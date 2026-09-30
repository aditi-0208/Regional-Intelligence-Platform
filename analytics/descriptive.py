"""Descriptive statistics for one indicator in one county over a period."""
from statistics import mean, median
from typing import Iterable, Optional

from .trends import trend_label, trend_slope


def absolute_change(start: Optional[float], end: Optional[float]) -> Optional[float]:
    """End minus start. None if either value is missing."""
    if start is None or end is None:
        return None
    return end - start


def percent_change(start: Optional[float], end: Optional[float]) -> Optional[float]:
    """Percent change from start to end.

    Returns None when it cannot be computed (missing value, or a start of
    zero). Never returns 0 for missing data.
    """
    if start is None or end is None or start == 0:
        return None
    return (end - start) / abs(start) * 100.0


def prepare_series(rows: Iterable[dict], start_year: int, end_year: int):
    """Filter to the period and separate usable points from missing ones.

    Returns (points, missing_years):
      points        sorted list of {"year", "value"} with a real value
      missing_years years inside the period with no usable value
    Missing values are excluded, never converted to zero.
    """
    by_year = {}
    for r in rows:
        y = r["year"]
        if start_year <= y <= end_year:
            by_year[y] = r.get("value")

    points = [
        {"year": y, "value": v} for y, v in sorted(by_year.items()) if v is not None
    ]
    have = {p["year"] for p in points}
    missing = [y for y in range(start_year, end_year + 1) if y not in have]
    return points, missing


def summarize_series(
    rows: Iterable[dict],
    start_year: int,
    end_year: int,
    estimated_years: Optional[set] = None,
) -> dict:
    """Descriptive metrics for one county x indicator x period.

    estimated_years: years known to be estimated or interpolated rather than
    published. They stay in the calculation but are reported so the caller
    can warn the user.
    """
    points, missing = prepare_series(rows, start_year, end_year)
    estimated_in_period = sorted(
        y for y in (estimated_years or set()) if start_year <= y <= end_year
    )

    if not points:
        return {
            "available": False,
            "reason": "No data available for the selected period.",
            "missing_years": missing,
            "estimated_years": estimated_in_period,
        }

    values = [p["value"] for p in points]
    first, last = points[0], points[-1]
    peak = max(points, key=lambda p: p["value"])
    low = min(points, key=lambda p: p["value"])
    slope = trend_slope(points)  # None if fewer than 2 points

    return {
        "available": True,
        "start_year": first["year"],
        "end_year": last["year"],
        "start_value": first["value"],
        "end_value": last["value"],
        "absolute_change": absolute_change(first["value"], last["value"]),
        "percent_change": percent_change(first["value"], last["value"]),
        "average": mean(values),
        "median": median(values),
        "min_value": low["value"],
        "min_year": low["year"],
        "max_value": peak["value"],
        "max_year": peak["year"],
        "trend_slope": slope,
        "trend": trend_label(slope, mean(values)),
        "n_observations": len(points),
        "missing_years": missing,
        "estimated_years": estimated_in_period,
    }
