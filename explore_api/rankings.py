"""GET /api/explore/rankings -- where selected counties rank among all counties.

Ranks EVERY county with data for the indicator/year, then returns only the
requested counties' positions plus the average across everyone. Sending back
all ~875 rows would be wasteful; the page only ever highlights the selected
ones against the field.
"""
import re
from statistics import mean
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from .data import cached, fetch_all_for_year
from .registry import INDICATORS

router = APIRouter()

_FIPS = re.compile(r"^\d{5}$")
ONE_HOUR = 3600


def build_rankings_response(indicator_code: str, all_rows, requested: list, year: int) -> dict:
    spec = INDICATORS[indicator_code]

    # Rank 1 = best. For most indicators, higher is better, so sort
    # descending. Gini index is the opposite: lower inequality is better,
    # so higher_is_better=False sorts ascending instead.
    descending = spec["higher_is_better"] is not False
    ordered = sorted(all_rows, key=lambda r: r[3], reverse=descending)

    rank_of = {fips: i + 1 for i, (fips, _, _, _) in enumerate(ordered)}
    by_fips = {fips: (name, state, value) for fips, name, state, value in ordered}
    national_average = mean(v for *_ , v in ordered) if ordered else None

    rows = []
    for fips in requested:
        if fips not in by_fips:
            continue  # county has no data for this indicator/year -- omit, don't fake a rank
        name, state, value = by_fips[fips]
        rows.append({
            "geo_id": fips,
            "geo_name": f"{name}, {state}",
            "value": value,
            "rank": rank_of[fips],
            "vs_average": (value - national_average) if national_average is not None else None,
        })

    return {
        "period": str(year),
        "national_average": national_average,
        "n_counties": len(ordered),
        "rows": rows,
    }


@router.get("/api/explore/rankings")
def rankings(
    indicator: str = Query(...),
    level: str = "county",
    period: Optional[int] = Query(None, description="Year to rank on, e.g. 2024"),
    geos: str = Query(..., description="Comma-separated 5-digit county FIPS"),
):
    if indicator not in INDICATORS:
        raise HTTPException(400, f"Unsupported indicator. Available: {', '.join(INDICATORS)}")
    if level != "county":
        raise HTTPException(400, "Only county-level rankings are available.")
    if period is None:
        raise HTTPException(400, "period (a year) is required.")

    requested = list(dict.fromkeys(g.strip() for g in geos.split(",") if g.strip()))
    if not requested:
        raise HTTPException(400, "Provide at least one county.")
    if not all(_FIPS.match(g) for g in requested):
        raise HTTPException(400, "County codes must be 5-digit FIPS codes.")

    all_rows = cached(
        f"rank_all:{indicator}:{period}", ONE_HOUR,
        lambda: fetch_all_for_year(indicator, period),
    )
    return build_rankings_response(indicator, all_rows, requested, period)
