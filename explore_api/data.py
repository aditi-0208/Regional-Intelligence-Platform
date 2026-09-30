"""Database access and a small cache shared by the Explore endpoints."""
import time

from .registry import INDICATORS

_CACHE = {}


def cached(key, ttl_seconds, fn):
    """Return a stored result if it is younger than ttl_seconds, else compute it.

    Lookup lists (states, counties) change a few times a year at most, and the
    production server is shared, so repeat page loads should not hit it.
    Errors are never cached.
    """
    now = time.time()
    hit = _CACHE.get(key)
    if hit and now - hit[0] < ttl_seconds:
        return hit[1]
    value = fn()
    _CACHE[key] = (now, value)
    return value


def run_query(sql, params=()):
    from db import get_conn  # imported here so tests need no database driver

    with get_conn() as conn:
        return conn.cursor().execute(sql, params).fetchall()


def fetch_rows(indicator_code, fips_list, start, end):
    """Rows of (fips, county_name, state_name, year, value) for 1+ counties.

    Table and column names come only from the registry, never from user input.
    """
    spec = INDICATORS[indicator_code]
    placeholders = ",".join("?" for _ in fips_list)
    sql = f"""
    SELECT f.county_fips, g.county_name, g.state_name, y.year, f.{spec['column']}
    FROM dbo.{spec['table']} f
    JOIN dbo.dim_geo g  ON f.geo_id = g.geo_id
    JOIN dbo.dim_year y ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders}) AND y.year BETWEEN ? AND ?
    ORDER BY f.county_fips, y.year
    """
    return run_query(sql, tuple(fips_list) + (start, end))


def fetch_all_for_year(indicator_code, year):
    """Every county's value for one indicator in one year.

    Used for ranking: needs the whole table, not just selected counties.
    Table/column names come only from the registry, never from user input.
    """
    from .registry import INDICATORS
    spec = INDICATORS[indicator_code]
    sql = f"""
    SELECT f.county_fips, g.county_name, g.state_name, f.{spec['column']}
    FROM dbo.{spec['table']} f
    JOIN dbo.dim_geo g  ON f.geo_id = g.geo_id
    JOIN dbo.dim_year y ON f.year_id = y.year_id
    WHERE y.year = ? AND f.{spec['column']} IS NOT NULL
    """
    return run_query(sql, (year,))
