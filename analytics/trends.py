"""Time-series helpers: trend slope, trend label, year-over-year change."""
from typing import Iterable, Optional


def trend_slope(points: Iterable[dict]) -> Optional[float]:
    """Least-squares slope of value against year, in value units per year.

    Needs at least two points with different years, otherwise None.
    """
    pts = [(p["year"], p["value"]) for p in points if p.get("value") is not None]
    n = len(pts)
    if n < 2:
        return None
    mean_x = sum(x for x, _ in pts) / n
    mean_y = sum(y for _, y in pts) / n
    sxx = sum((x - mean_x) ** 2 for x, _ in pts)
    if sxx == 0:
        return None
    sxy = sum((x - mean_x) * (y - mean_y) for x, y in pts)
    return sxy / sxx


def trend_label(
    slope: Optional[float], average: Optional[float], flat_threshold: float = 0.005
) -> str:
    """'increasing', 'decreasing' or 'relatively flat'.

    The slope is compared with the period average, so the same rule works for
    dollars and percentages. Default: a yearly move smaller than 0.5% of the
    average counts as flat. This is a display rule, not a significance test.
    """
    if slope is None or not average:
        return "unavailable"
    relative = slope / abs(average)
    if abs(relative) < flat_threshold:
        return "relatively flat"
    return "increasing" if relative > 0 else "decreasing"


def yoy_changes(points: Iterable[dict]) -> list:
    """Year-over-year change between consecutive calendar years only.

    If a year is missing, the change across the gap is NOT reported as a
    one-year change. That row carries gap_years > 1 and a None yoy value.
    """
    pts = sorted(
        (p for p in points if p.get("value") is not None), key=lambda p: p["year"]
    )
    out = []
    for prev, cur in zip(pts, pts[1:]):
        gap = cur["year"] - prev["year"]
        if gap == 1 and prev["value"] != 0:
            change = cur["value"] - prev["value"]
            pct = change / abs(prev["value"]) * 100.0
        else:
            change = pct = None
        out.append(
            {
                "from_year": prev["year"],
                "to_year": cur["year"],
                "gap_years": gap,
                "absolute_change": change,
                "percent_change": pct,
            }
        )
    return out
