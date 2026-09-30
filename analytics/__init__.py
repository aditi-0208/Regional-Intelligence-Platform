"""Analytics layer for the Regional Intelligence Platform.

Pure functions: no database, no web framework. They take plain series
(lists of {"year": int, "value": float | None}) and return plain dicts,
so the same code can sit behind any API and be unit tested in isolation.
"""
from .descriptive import (
    absolute_change,
    percent_change,
    prepare_series,
    summarize_series,
)
from .trends import trend_label, trend_slope, yoy_changes
from .comparison import compare_two
from .narrative import describe_comparison, fmt_diff, fmt_value

__all__ = [
    "absolute_change",
    "percent_change",
    "prepare_series",
    "summarize_series",
    "trend_label",
    "trend_slope",
    "yoy_changes",
    "compare_two",
    "describe_comparison",
    "fmt_diff",
    "fmt_value",
]
