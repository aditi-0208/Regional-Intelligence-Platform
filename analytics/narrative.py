"""Deterministic, fact-only sentences generated from computed values.

No language model: every sentence is built from numbers the analytics
functions already produced, so the text can never disagree with the table.
"""
from typing import Optional


def fmt_value(value: Optional[float], unit: str) -> str:
    if value is None:
        return "data unavailable"
    if unit == "usd":
        return f"${value:,.0f}"
    if unit == "percent":
        return f"{value:.1f}%"
    if unit == "index":
        return f"{value:.3f}"
    return f"{value:,.1f}"


def fmt_diff(value: float, unit: str) -> str:
    """A difference between two values. Percentages are in percentage points."""
    mag = abs(value)
    if unit == "usd":
        return f"${mag:,.0f}"
    if unit == "percent":
        return f"{mag:.1f} percentage points"
    if unit == "index":
        return f"{mag:.3f}"
    return f"{mag:,.1f}"


def _direction(value: float) -> tuple:
    if value > 0:
        return "rose", "increase"
    if value < 0:
        return "fell", "decrease"
    return "was unchanged", "change"


def describe_comparison(
    label: str, unit: str, name_a: str, name_b: str,
    summary_a: dict, summary_b: dict, comparison: dict,
) -> list:
    """Up to three factual sentences about two counties on one indicator."""
    out = []

    # 1. Change over the period
    if summary_a.get("available") and summary_b.get("available"):
        if unit == "percent":
            ch_a, ch_b = summary_a["absolute_change"], summary_b["absolute_change"]
            text = lambda v: f"{abs(v):.1f} percentage points"
        else:
            ch_a, ch_b = summary_a["percent_change"], summary_b["percent_change"]
            text = lambda v: f"{abs(v):.1f}%"
        if ch_a is not None and ch_b is not None:
            verb, _ = _direction(ch_a)
            _, noun_b = _direction(ch_b)
            same = (summary_a["start_year"], summary_a["end_year"]) == (
                summary_b["start_year"], summary_b["end_year"])
            years = f" between {summary_a['start_year']} and {summary_a['end_year']}" if same else ""
            out.append(
                f"{name_a}'s {label} {verb} {text(ch_a)}{years}, "
                f"compared with a {text(ch_b)} {noun_b} in {name_b}."
            )

    # 2. Gap between the counties
    if comparison.get("available"):
        y0, y1 = comparison["start_year"], comparison["end_year"]
        d0, d1 = comparison["difference_at_start"], comparison["difference_at_end"]
        direction = comparison["gap_direction"]
        lead_end = name_a if d1 > 0 else name_b
        lead_start = name_a if d0 > 0 else name_b
        if direction in ("widened", "narrowed"):
            out.append(
                f"{lead_end} had the higher {label} in {y1}, and the difference "
                f"{direction} from {fmt_diff(d0, unit)} in {y0} to {fmt_diff(d1, unit)} in {y1}."
            )
        elif direction == "reversed":
            out.append(
                f"{lead_start} had the higher {label} in {y0}, but {lead_end} "
                f"had the higher {label} in {y1}."
            )
        else:
            out.append(f"The difference in {label} was unchanged between {y0} and {y1}.")

    # 3. Trend direction
    ta, tb = summary_a.get("trend"), summary_b.get("trend")
    if ta and tb and "unavailable" not in (ta, tb):
        if ta == tb:
            out.append(f"Both counties show {'an' if ta[0] in 'aeiou' else 'a'} {ta} trend over the selected period.")
        else:
            out.append(f"The trend is {ta} in {name_a} and {tb} in {name_b}.")

    return out
