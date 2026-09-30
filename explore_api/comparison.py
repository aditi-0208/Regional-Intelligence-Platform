"""GET /api/explore/comparison  -- two counties, one indicator, one period.

Flow: validate -> fetch rows -> analytics -> structured JSON.
The frontend only displays what comes back; it never recomputes.
"""
import re
from fastapi import APIRouter, HTTPException, Query

from analytics import compare_two, describe_comparison, summarize_series
from .registry import INDICATORS, SOURCE

router = APIRouter()

# Years whose values appear to be estimated/interpolated rather than published.
# TODO: confirm with the pipeline team how 2020 was filled.
ESTIMATED_YEARS = {2020}

_FIPS = re.compile(r"^\d{5}$")


def fetch_county_series(indicator_code: str, fips_a: str, fips_b: str, start: int, end: int):
    """Read both counties' rows. Table and column come from the registry only."""
    from db import get_conn  # imported here so tests need no database driver

    spec = INDICATORS[indicator_code]
    sql = f"""
    SELECT f.county_fips, g.county_name, y.year, f.{spec['column']}
    FROM dbo.{spec['table']} f
    JOIN dbo.dim_geo g  ON f.geo_id = g.geo_id
    JOIN dbo.dim_year y ON f.year_id = y.year_id
    WHERE f.county_fips IN (?, ?) AND y.year BETWEEN ? AND ?
    ORDER BY f.county_fips, y.year
    """
    with get_conn() as conn:
        return conn.cursor().execute(sql, (fips_a, fips_b, start, end)).fetchall()


def build_comparison_response(indicator_code, rows, fips_a, fips_b, start, end):
    """Turn raw rows into the API response. No database access here."""
    spec = INDICATORS[indicator_code]
    unit = spec["unit"]

    series = {fips_a: [], fips_b: []}
    names = {}
    for fips, name, year, value in rows:
        names[fips] = name
        series[fips].append(
            {"year": int(year), "value": float(value) if value is not None else None}
        )

    for fips in (fips_a, fips_b):
        if not any(p["value"] is not None for p in series[fips]):
            raise HTTPException(
                status_code=404,
                detail=(f"No data for county {fips} on this indicator. "
                        "The dataset may not include every county."),
            )

    summaries = {
        f: summarize_series(series[f], start, end, estimated_years=ESTIMATED_YEARS)
        for f in (fips_a, fips_b)
    }
    comparison = compare_two(series[fips_a], series[fips_b], start, end, unit=unit)

    counties = []
    for f in (fips_a, fips_b):
        counties.append({
            "fips": f,
            "name": names[f],
            "summary": summaries[f],
            "series": [
                {**p, "estimated": p["year"] in ESTIMATED_YEARS}
                for p in series[f]
            ],
        })

    notes = []
    est = sorted({y for s in summaries.values() for y in s.get("estimated_years", [])})
    if est:
        notes.append(
            "Values for " + ", ".join(str(y) for y in est) +
            " appear to be estimated rather than published, and may smooth trends."
        )
    for f in (fips_a, fips_b):
        missing = summaries[f].get("missing_years", [])
        if missing:
            notes.append(f"{names[f]} has no data for: {', '.join(str(y) for y in missing)}.")
    if unit == "usd":
        notes.append("Dollar values are as reported for each year and are not adjusted for inflation.")

    return {
        "indicator": {
            "code": indicator_code, "label": spec["label"], "unit": unit,
            "higher_is_better": spec["higher_is_better"], "source": SOURCE,
        },
        "period": {"start_year": start, "end_year": end},
        "counties": counties,
        "comparison": comparison,
        "insights": describe_comparison(
            spec["noun"], unit, names[fips_a], names[fips_b],
            summaries[fips_a], summaries[fips_b], comparison,
        ),
        "notes": notes,
    }


@router.get("/api/explore/comparison")
def comparison(
    indicator: str = Query(..., description="Census table code, e.g. B19013"),
    county_a: str = Query(..., description="5-digit county FIPS"),
    county_b: str = Query(..., description="5-digit county FIPS"),
    start_year: int = Query(..., ge=1990, le=2100),
    end_year: int = Query(..., ge=1990, le=2100),
):
    if indicator not in INDICATORS:
        raise HTTPException(400, f"Unsupported indicator. Available: {', '.join(INDICATORS)}")
    if not (_FIPS.match(county_a) and _FIPS.match(county_b)):
        raise HTTPException(400, "County codes must be 5-digit FIPS codes.")
    if county_a == county_b:
        raise HTTPException(400, "Choose two different counties.")
    if start_year > end_year:
        raise HTTPException(400, "start_year must be <= end_year.")

    rows = fetch_county_series(indicator, county_a, county_b, start_year, end_year)
    return build_comparison_response(indicator, rows, county_a, county_b, start_year, end_year)
