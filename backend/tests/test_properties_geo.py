"""Distance search, map pins, nearby residences, and admin location editing."""
import pytest

from app.utils.geo import haversine_km, parse_coordinate

# Reference points around Wits (Braamfontein).
WITS = (-26.1913, 28.0305)
NEAR = (-26.1932, 28.0318)   # ~250 m from WITS
MID = (-26.1940, 28.0400)    # ~1 km
FAR = (-26.1829, 27.9989)    # ~3.3 km (Auckland Park)


# ----------------------------------------------------------------- geo helpers

def test_haversine_one_degree_of_latitude():
    assert haversine_km(0, 0, 1, 0) == pytest.approx(111.19, abs=0.05)


def test_haversine_is_symmetric_and_zero_for_same_point():
    assert haversine_km(*WITS, *FAR) == pytest.approx(haversine_km(*FAR, *WITS))
    assert haversine_km(*WITS, *WITS) == 0
    assert haversine_km(*WITS, *FAR) == pytest.approx(3.29, abs=0.05)


@pytest.mark.parametrize('value, kind, expected', [
    ('-26.19', 'lat', -26.19), (28.03, 'lng', 28.03), ('', 'lat', None), (None, 'lng', None),
])
def test_parse_coordinate_accepts_valid_values(value, kind, expected):
    assert parse_coordinate(value, kind) == expected


@pytest.mark.parametrize('value, kind', [('91', 'lat'), (-181, 'lng'), ('abc', 'lat'), (True, 'lat'), ('nan', 'lng')])
def test_parse_coordinate_rejects_invalid_values(value, kind):
    with pytest.raises(ValueError):
        parse_coordinate(value, kind)


# ----------------------------------------------------------------- /api/properties

def _origin(point):
    return f'near_lat={point[0]}&near_lng={point[1]}'


def test_sort_by_distance_orders_nearest_first_and_puts_unmapped_last(client, make_property):
    make_property('Far Res', *FAR)
    make_property('No Pin Res')
    make_property('Near Res', *NEAR)
    make_property('Mid Res', *MID)

    response = client.get(f'/api/properties?{_origin(WITS)}&sort=distance')
    assert response.status_code == 200
    names = [p['name'] for p in response.json['properties']]
    assert names == ['Near Res', 'Mid Res', 'Far Res', 'No Pin Res']
    distances = [p['distance_km'] for p in response.json['properties']]
    assert distances[0] < distances[1] < distances[2]
    assert distances[3] is None
    assert response.json['properties'][0]['latitude'] == NEAR[0]


def test_max_km_excludes_far_and_unmapped_properties(client, make_property):
    make_property('Near Res', *NEAR)
    make_property('Far Res', *FAR)
    make_property('No Pin Res')

    response = client.get(f'/api/properties?{_origin(WITS)}&max_km=1.5')
    assert [p['name'] for p in response.json['properties']] == ['Near Res']
    assert response.json['total'] == 1


def test_recommended_sort_without_origin_ranks_by_rating(client, db, make_property):
    from app.models import Review, User

    low = make_property('A Low Rated')
    high = make_property('Z High Rated')
    student = User(email='s@example.com', name='S', university='wits', verified=True)
    db.session.add(student)
    db.session.commit()
    db.session.add_all([
        Review(user_id=student.id, property_id=low.id, overall_rating=2, review_text='Meh', recommend=False, approved=True),
        Review(user_id=student.id, property_id=high.id, overall_rating=5, review_text='Great', recommend=True, approved=True),
    ])
    db.session.commit()

    names = [p['name'] for p in client.get('/api/properties').json['properties']]
    assert names == ['Z High Rated', 'A Low Rated']
    first = client.get('/api/properties').json['properties'][0]
    assert first['average_rating'] == 5.0 and first['review_count'] == 1


def test_price_sorts_and_nsfas_filter(client, make_property):
    make_property('Cheap', price_min=3000, price_max=4000, nsfas_accredited=True)
    make_property('Pricey', price_min=7000, price_max=9000)

    asc = [p['name'] for p in client.get('/api/properties?sort=price_asc').json['properties']]
    desc = [p['name'] for p in client.get('/api/properties?sort=price_desc').json['properties']]
    nsfas = [p['name'] for p in client.get('/api/properties?nsfas=true').json['properties']]
    assert asc == ['Cheap', 'Pricey']
    assert desc == ['Pricey', 'Cheap']
    assert nsfas == ['Cheap']


def test_pagination_counts_after_distance_filter(client, make_property):
    for index in range(5):
        make_property(f'Res {index}', NEAR[0] + index * 0.0001, NEAR[1])
    page = client.get(f'/api/properties?{_origin(WITS)}&max_km=2&per_page=2&page=3').json
    assert page['total'] == 5 and page['pages'] == 3 and len(page['properties']) == 1


def test_invalid_origin_is_ignored(client, make_property):
    make_property('Near Res', *NEAR)
    response = client.get('/api/properties?near_lat=abc&near_lng=28&sort=distance&max_km=1')
    assert response.status_code == 200
    assert response.json['properties'][0]['distance_km'] is None
    assert response.json['total'] == 1


def test_unapproved_properties_are_hidden(client, make_property):
    make_property('Hidden', *NEAR, approved=False)
    assert client.get('/api/properties').json['total'] == 0
    assert client.get('/api/properties/map').json['properties'] == []


# ----------------------------------------------------------------- /map and /nearby

def test_map_endpoint_returns_only_pinned_properties(client, make_property):
    make_property('Near Res', *NEAR)
    make_property('No Pin Res')

    data = client.get(f'/api/properties/map?{_origin(WITS)}').json
    assert [p['name'] for p in data['properties']] == ['Near Res']
    assert data['total'] == 2 and data['unmapped'] == 1
    point = data['properties'][0]
    assert {'latitude', 'longitude', 'price_min', 'primary_image_url', 'distance_km', 'geo_precision'} <= point.keys()


def test_nearby_returns_closest_others_excluding_self(client, make_property):
    home = make_property('Home Res', *WITS)
    make_property('Far Res', *FAR)
    make_property('Near Res', *NEAR)
    make_property('No Pin Res')

    data = client.get(f'/api/properties/{home.id}/nearby?limit=5').json
    assert [p['name'] for p in data['properties']] == ['Near Res', 'Far Res']
    assert data['properties'][0]['distance_km'] == pytest.approx(0.25, abs=0.05)


def test_nearby_for_unpinned_property_is_empty_and_missing_is_404(client, make_property):
    lonely = make_property('No Pin Res')
    assert client.get(f'/api/properties/{lonely.id}/nearby').json == {'properties': []}
    assert client.get('/api/properties/9999/nearby').status_code == 404


# ----------------------------------------------------------------- admin location editing

def test_admin_can_set_and_clear_location(client, make_property, admin_headers):
    prop = make_property('Pin Me')

    response = client.put(f'/api/admin/properties/{prop.id}', json={'latitude': '-26.19', 'longitude': 28.03}, headers=admin_headers)
    assert response.status_code == 200
    body = response.json['property']
    assert (body['latitude'], body['longitude'], body['geo_precision']) == (-26.19, 28.03, 'exact')

    cleared = client.put(f'/api/admin/properties/{prop.id}', json={'latitude': None, 'longitude': None}, headers=admin_headers)
    assert cleared.status_code == 200
    assert cleared.json['property']['latitude'] is None and cleared.json['property']['geo_precision'] is None


@pytest.mark.parametrize('payload, message', [
    ({'latitude': -26.19}, 'both'),
    ({'latitude': 95, 'longitude': 28}, 'Latitude'),
    ({'latitude': 'north', 'longitude': 28}, 'numbers'),
    ({'latitude': -26.19, 'longitude': 28.03, 'geo_precision': 'guess'}, 'geo_precision'),
])
def test_admin_location_validation(client, make_property, admin_headers, payload, message):
    prop = make_property('Pin Me')
    response = client.put(f'/api/admin/properties/{prop.id}', json=payload, headers=admin_headers)
    assert response.status_code == 400
    assert message in response.json['error']


def test_admin_create_property_with_location(client, admin_headers, db):
    response = client.post('/api/admin/properties', headers=admin_headers, json={
        'name': 'New Res', 'address': '1 Test Street, Braamfontein', 'property_type': 'residence',
        'price_min': 4000, 'price_max': 5000, 'university': 'wits', 'latitude': -26.192, 'longitude': 28.033,
    })
    assert response.status_code == 201
    assert response.json['property']['latitude'] == -26.192
