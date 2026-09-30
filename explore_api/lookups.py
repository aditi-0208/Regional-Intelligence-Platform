"""Endpoints that feed the Explore page's dropdowns and chart.

Response shapes match what the page already expects, so the page needs almost
no changes:  /categories  /states  /geographies  /series
"""
import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from .comparison import ESTIMATED_YEARS
from .data import cached, fetch_rows, run_query
from .registry import CATEGORIES, INDICATORS, SOURCE, SOURCE_ID

router = APIRouter()

_FIPS = re.compile(r"^\d{5}$")
_STATE = re.compile(r"^\d{2}$")
MAX_REGIONS = 3
ONE_HOUR = 3600


def geo_name(county_name: str, state_name: str) -> str:
    """'Baldwin County, Alabama' -- county names alone repeat across states."""
    return f"{county_name}, {state_name}"


def build_categories() -> list:
    out = []
    for cat_id, cat_label in CATEGORIES:
        indicators = [
            {"id": code, "label": s["label"], "unit": s["unit"], "description": s["description"]}
            for code, s in INDICATORS.items() if s["category"] == cat_id
        ]
        if indicators:
            out.append({"id": cat_id, "label": cat_label, "indicators": indicators})
    return out


def build_series_response(indicator_code: str, rows, requested: list) -> dict:
    """Pivot rows into one row per year, keyed by county FIPS, for Recharts."""
    spec = INDICATORS[indicator_code]

    names, by_year = {}, {}
    for fips, county, state, year, value in rows:
        names[fips] = geo_name(county, state)
        by_year.setdefault(int(year), {})[fips] = float(value) if value is not None else None

    geos = [{"geo_id": f, "geo_name": names[f]} for f in requested if f in names]
    data = []
    for year in sorted(by_year):
        row = {"period": str(year)}
        for g in geos:
            row[g["geo_id"]] = by_year[year].get(g["geo_id"])
        data.append(row)

    return {
        "indicator": {
            "id": indicator_code, "label": spec["label"], "unit": spec["unit"],
            "description": spec["description"],
        },
        "geos": geos,
        "data": data,
        "estimated_years": sorted(y for y in by_year if y in ESTIMATED_YEARS),
        "sources": [{"source_id": SOURCE_ID, "source_name": SOURCE}],
    }


@router.get("/api/explore/categories")
def categories():
    return build_categories()


@router.get("/api/explore/states")
def states():
    def load():
        rows = run_query(
            "SELECT DISTINCT state_code, state_name FROM dbo.dim_geo ORDER BY state_name"
        )
        return [{"state_fips": r[0], "state_name": r[1]} for r in rows]

    return cached("states", ONE_HOUR, load)


@router.get("/api/explore/geographies")
def geographies(
    level: str = "county",
    state: Optional[str] = None,
    q: Optional[str] = None,
):
    if level == "msa":
        return []  # no metro-level data in the database yet
    if level != "county":
        raise HTTPException(400, f"Unknown level: {level}")
    if state and not _STATE.match(state):
        raise HTTPException(400, "state must be a 2-digit state FIPS code.")

    def load():
        where, params = [], []
        if state:
            where.append("state_code = ?")
            params.append(state)
        if q:
            where.append("county_name LIKE ?")
            params.append(f"%{q}%")
        clause = ("WHERE " + " AND ".join(where)) if where else ""
        rows = run_query(
            f"""SELECT county_fips, county_name, state_name, state_code
                FROM dbo.dim_geo {clause}
                ORDER BY state_name, county_name""",
            tuple(params),
        )
        return [
            {"geo_id": r[0], "geo_name": geo_name(r[1], r[2]), "state_fips": r[3]}
            for r in rows
        ]

    return cached(f"geos:{state}:{q}", ONE_HOUR, load)


@router.get("/api/explore/series")
def series(
    indicator: str = Query(...),
    geos: str = Query(..., description="Comma-separated 5-digit county FIPS, max 3"),
    from_year: Optional[int] = Query(None, alias="from", ge=1990, le=2100),
    to_year: Optional[int] = Query(None, alias="to", ge=1990, le=2100),
):
    if indicator not in INDICATORS:
        raise HTTPException(400, f"Unsupported indicator. Available: {', '.join(INDICATORS)}")

    requested = list(dict.fromkeys(g.strip() for g in geos.split(",") if g.strip()))
    if not requested:
        raise HTTPException(400, "Provide at least one county.")
    if len(requested) > MAX_REGIONS:
        raise HTTPException(400, f"Maximum {MAX_REGIONS} regions.")
    if not all(_FIPS.match(g) for g in requested):
        raise HTTPException(400, "County codes must be 5-digit FIPS codes.")

    start = from_year if from_year is not None else 1990
    end = to_year if to_year is not None else 2100
    if start > end:
        raise HTTPException(400, "'from' must be <= 'to'.")

    rows = fetch_rows(indicator, requested, start, end)
    return build_series_response(indicator, rows, requested)
