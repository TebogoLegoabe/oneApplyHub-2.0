"""
Geocode the seed properties in data/properties.json with OpenStreetMap Nominatim.

Adds `latitude`, `longitude` and `geo_precision` to every record that does not have
coordinates yet, then writes the file back:

    building  the residence itself was found in OpenStreetMap by name (exact)
    address   an address point / building on the right street was found
    street    only the street was found; the pin sits on the street's midpoint,
              so it can be a few hundred metres off — refine it in the admin
              dashboard (Properties > Location)

Records that already have coordinates are left untouched, so the script is safe to
re-run after adding new properties to the JSON file.

Usage (from backend/):
    python geocode_properties.py [--force] [--dry-run]

Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/):
    - at most 1 request per second (enforced below)
    - identify your application with a User-Agent; set GEOCODER_USER_AGENT to
      something like "yourapp-geocoder/1.0 (contact@example.com)"
    - this is a one-off bulk job; never geocode on every page view
"""
import argparse
import json
import math
import os
import re
import sys
import time
import urllib.parse
import urllib.request

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'properties.json')
NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
USER_AGENT = os.environ.get('GEOCODER_USER_AGENT', 'student-accommodation-geocoder/1.0 (seed script)')

# Campus belt around Wits and UJ: Auckland Park -> Parktown -> Braamfontein -> Doornfontein.
VIEWBOX = '27.95,-26.15,28.10,-26.27'  # left,top,right,bottom
BUILDING_CLASSES = {'building', 'amenity', 'tourism', 'office', 'shop', 'leisure', 'landuse', 'man_made'}
STREET_WORDS = r'(street|st|road|rd|avenue|ave|terrace|place|lane|drive|way|crescent)'
# OpenStreetMap spells this suburb "Aukland Park".
SUBURB_ALIASES = {'auckland park': 'Aukland Park'}

_last_request = 0.0


def _search(query):
    global _last_request
    wait = 1.1 - (time.monotonic() - _last_request)
    if wait > 0:
        time.sleep(wait)
    params = urllib.parse.urlencode({
        'q': query, 'format': 'jsonv2', 'limit': 3, 'countrycodes': 'za', 'viewbox': VIEWBOX, 'bounded': 1,
    })
    request = urllib.request.Request(f'{NOMINATIM_URL}?{params}', headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode('utf-8'))
    finally:
        _last_request = time.monotonic()


def _km(a_lat, a_lng, b_lat, b_lng):
    r = 6371.0
    d_lat, d_lng = math.radians(b_lat - a_lat), math.radians(b_lng - a_lng)
    h = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(a_lat)) * math.cos(math.radians(b_lat)) * math.sin(d_lng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def _normalise_street(street):
    street = re.sub(r'\bSt$', 'Street', street.strip())
    street = re.sub(r'\bRd$', 'Road', street)
    street = re.sub(r'\bAve$', 'Avenue', street)
    if not re.search(rf'\b{STREET_WORDS}\b', street, re.IGNORECASE):
        street = f'{street} Street'
    return street


def _parse_address(address):
    """Return (house_number, streets, suburb). Handles "Corner A and B St" and building names."""
    parts = [part.strip() for part in re.sub(r'\s+', ' ', address).split(',') if part.strip()]
    parts = [part for part in parts if part.lower() != 'johannesburg']
    suburb = SUBURB_ALIASES.get(parts[-1].lower(), parts[-1]) if len(parts) > 1 else ''
    lines = parts[:-1] if len(parts) > 1 else parts
    street_line = next((line for line in lines if re.search(rf'\b{STREET_WORDS}\b|^\d', line, re.IGNORECASE)), lines[-1])

    corner = re.match(r'^corner\s+(.+?)\s+(?:and|&)\s+(.+)$', street_line, re.IGNORECASE)
    if corner:
        first, second = corner.group(1), _normalise_street(corner.group(2))
        suffix = re.search(rf'\b{STREET_WORDS}$', second, re.IGNORECASE)
        first = _normalise_street(f'{first} {suffix.group(0)}' if suffix and not re.search(rf'\b{STREET_WORDS}\b', first, re.IGNORECASE) else first)
        return None, [second, first], suburb

    number = re.match(r'^(\d+)\s+(.*)$', street_line)
    if number:
        return number.group(1), [_normalise_street(number.group(2))], suburb
    return None, [_normalise_street(street_line)], suburb


def _name_candidates(name):
    """'South Point - Mvelelo' -> ['South Point Mvelelo', 'Mvelelo']."""
    brand, _, building = name.partition(' - ')
    if not building:
        return [name]
    candidates = [f'{brand} {building}', building]
    return [candidate for candidate in candidates if len(candidate) > 3]


def _street_hit(number, streets, suburb):
    """Best street-level match: try with house number, then street + suburb, then street only."""
    for street in streets:
        queries = []
        if number:
            queries.append(f'{number} {street}, {suburb}' if suburb else f'{number} {street}')
        queries += [f'{street}, {suburb}' if suburb else street, street]
        for query in dict.fromkeys(queries):
            for result in _search(query):
                category = result.get('category')
                if category == 'highway' or (number and category in BUILDING_CLASSES and number in result.get('display_name', '')):
                    precision = 'street' if category == 'highway' else 'address'
                    return float(result['lat']), float(result['lon']), precision, query
    return None


def geocode(name, address):
    number, streets, suburb = _parse_address(address)
    street = _street_hit(number, streets, suburb)

    # The building itself, when OpenStreetMap knows it by name. Only trusted when it lies
    # on (or next to) the listed street, so generic names like "Rise" can't jump across town.
    for candidate in _name_candidates(name):
        for result in _search(candidate):
            if result.get('category') not in BUILDING_CLASSES:
                continue
            lat, lng = float(result['lat']), float(result['lon'])
            on_street = any(s.split()[0].lower() in result.get('display_name', '').lower() for s in streets)
            near_street = street is not None and _km(lat, lng, street[0], street[1]) <= 0.8
            if on_street or near_street:
                return lat, lng, 'building', candidate
    return street


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--force', action='store_true', help='Re-geocode records that already have coordinates.')
    parser.add_argument('--dry-run', action='store_true', help='Print results without writing the file.')
    args = parser.parse_args()

    with open(DATA_FILE, encoding='utf-8') as handle:
        records = json.load(handle)

    misses = []
    for record in records:
        if not args.force and record.get('latitude') is not None and record.get('longitude') is not None:
            continue
        found = geocode(record['name'], record['address'])
        if not found:
            misses.append(record['name'])
            print(f'  [MISS    ] {record["name"]} | {record["address"]}', flush=True)
            continue
        lat, lng, precision, query = found
        record['latitude'], record['longitude'], record['geo_precision'] = round(lat, 6), round(lng, 6), precision
        print(f'  [{precision.upper():8}] {record["name"]}: {lat:.6f}, {lng:.6f}  <- "{query}"', flush=True)

    if not args.dry_run:
        with open(DATA_FILE, 'w', encoding='utf-8') as handle:
            json.dump(records, handle, indent=2, ensure_ascii=False)
            handle.write('\n')

    located = sum(1 for record in records if record.get('latitude') is not None)
    print(f'\n{located}/{len(records)} properties have coordinates.' + (' (dry run, file not written)' if args.dry_run else ''))
    if misses:
        print('Set these manually (admin dashboard > Properties > Location):')
        for name in misses:
            print(f'  - {name}')
    return 0 if not misses else 1


if __name__ == '__main__':
    sys.exit(main())
