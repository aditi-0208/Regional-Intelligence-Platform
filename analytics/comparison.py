"""County-versus-county comparison."""
from typing import Iterable, Optional

from .descriptive import percent_change, prepare_series


def compare_two(
    rows_a: Iterable[dict],
    rows_b: Iterable[dict],
    start_year: int,
    end_year: int,
    unit: str = "usd",
) -> dict:
    """How the relationship between county A and county B changed.

    Uses only years where BOTH counties have a value, so the gap is always
    measured like-for-like. For unit='percent' the difference is in
    percentage points, and no percent-difference-of-a-percentage is given.
    """
    pts_a, _ = prepare_series(rows_a, start_year, end_year)
    pts_b, _ = prepare_series(rows_b, start_year, end_year)
    a = {p["year"]: p["value"] for p in pts_a}
    b = {p["year"]: p["value"] for p in pts_b}
    common = sorted(set(a) & set(b))

    if len(common) < 2:
        return {
            "available": False,
            "reason": "Fewer than two years with data for both counties.",
        }

    y0, y1 = common[0], common[-1]
    diff_start = a[y0] - b[y0]
    diff_end = a[y1] - b[y1]
    change_in_gap = diff_end - diff_start

    if diff_start * diff_end < 0:
        gap_direction = "reversed"
    elif abs(diff_end) > abs(diff_start):
        gap_direction = "widened"
    elif abs(diff_end) < abs(diff_start):
        gap_direction = "narrowed"
    else:
        gap_direction = "unchanged"

    result = {
        "available": True,
        "unit": unit,
        "start_year": y0,
        "end_year": y1,
        "years_compared": common,
        "difference_at_start": diff_start,
        "difference_at_end": diff_end,
        "change_in_gap": change_in_gap,
        "gap_direction": gap_direction,
        "current_leader": "a" if diff_end > 0 else "b" if diff_end < 0 else "tie",
    }
    if unit != "percent":
        result["percent_difference_at_start"] = percent_change(b[y0], a[y0])
        result["percent_difference_at_end"] = percent_change(b[y1], a[y1])
    return result
