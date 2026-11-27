"""Small, dependency-free geo helpers for distance search."""
import math

EARTH_RADIUS_KM = 6371.0088

GEO_PRECISIONS = ('exact', 'building', 'address', 'street')


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle ("as the crow flies") distance between two points in kilometres."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    h = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(min(1.0, math.sqrt(h)))


def parse_coordinate(value, kind: str):
    """Return a float latitude/longitude, None for blank input, or raise ValueError.

    kind is 'lat' (-90..90) or 'lng' (-180..180).
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    if isinstance(value, bool):
        raise ValueError(f'Invalid {kind}')
    number = float(value)
    limit = 90 if kind == 'lat' else 180
    if not math.isfinite(number) or not -limit <= number <= limit:
        raise ValueError(f'{"Latitude" if kind == "lat" else "Longitude"} must be between -{limit} and {limit}')
    return round(number, 6)
