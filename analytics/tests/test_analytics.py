"""Tests use the real Hillsborough (12057) and Pinellas (12103) median
household income values from the SOTR database (ACS, 2013-2024)."""
import math
import pytest

from analytics import (
    compare_two, percent_change, prepare_series,
    summarize_series, trend_label, trend_slope, yoy_changes,
)

HILLS = [
    {"year": y, "value": v} for y, v in zip(
        range(2013, 2025),
        [49597, 50796, 51725, 54588, 54731, 58480,
         61154, 63530, 65905, 74308, 76687, 85183])
]
PINE = [
    {"year": y, "value": v} for y, v in zip(
        range(2013, 2025),
        [43703, 45152, 47618, 50036, 51512, 52198,
         56737, 59342, 61947, 66472, 70768, 73832])
]


def test_percent_change_basic():
    assert percent_change(100, 150) == pytest.approx(50.0)
    assert percent_change(200, 100) == pytest.approx(-50.0)


def test_percent_change_cannot_be_computed():
    assert percent_change(0, 10) is None
    assert percent_change(None, 10) is None
    assert percent_change(10, None) is None


def test_summary_hillsborough_full_period():
    s = summarize_series(HILLS, 2013, 2024, estimated_years={2020})
    assert s["start_value"] == 49597 and s["end_value"] == 85183
    assert s["absolute_change"] == 35586
    assert s["percent_change"] == pytest.approx(71.75, abs=0.01)
    assert s["max_year"] == 2024 and s["min_year"] == 2013
    assert s["trend"] == "increasing"
    assert s["estimated_years"] == [2020]
    assert s["missing_years"] == []


def test_summary_respects_period():
    s = summarize_series(HILLS, 2018, 2024)
    assert s["start_year"] == 2018 and s["start_value"] == 58480
    assert s["n_observations"] == 7


def test_missing_values_are_excluded_not_zeroed():
    rows = [{"year": 2019, "value": 100}, {"year": 2020, "value": None},
            {"year": 2021, "value": 120}]
    pts, missing = prepare_series(rows, 2019, 2021)
    assert [p["year"] for p in pts] == [2019, 2021]
    assert missing == [2020]
    s = summarize_series(rows, 2019, 2021)
    assert s["average"] == 110  # not 73.3
    assert s["missing_years"] == [2020]


def test_no_data_reports_unavailable():
    s = summarize_series([], 2019, 2024)
    assert s["available"] is False
    assert "No data" in s["reason"]


def test_single_point_has_no_slope():
    s = summarize_series([{"year": 2020, "value": 5}], 2020, 2020)
    assert s["trend_slope"] is None
    assert s["trend"] == "unavailable"


def test_trend_slope_exact_line():
    pts = [{"year": y, "value": 10 + 3 * (y - 2000)} for y in range(2000, 2006)]
    assert trend_slope(pts) == pytest.approx(3.0)


def test_trend_label_flat_decreasing():
    assert trend_label(0.1, 100) == "relatively flat"
    assert trend_label(-5, 100) == "decreasing"
    assert trend_label(5, 100) == "increasing"


def test_yoy_consecutive_years():
    rows = yoy_changes(HILLS)
    assert len(rows) == 11
    first = rows[0]
    assert (first["from_year"], first["to_year"]) == (2013, 2014)
    assert first["absolute_change"] == 1199
    assert first["percent_change"] == pytest.approx(2.417, abs=0.001)


def test_yoy_does_not_call_a_gap_one_year():
    rows = yoy_changes([{"year": 2019, "value": 100}, {"year": 2021, "value": 120}])
    assert rows[0]["gap_years"] == 2
    assert rows[0]["percent_change"] is None


def test_compare_gap_widens_over_full_period():
    c = compare_two(HILLS, PINE, 2013, 2024)
    assert c["difference_at_start"] == 5894
    assert c["difference_at_end"] == 11351
    assert c["change_in_gap"] == 5457
    assert c["gap_direction"] == "widened"
    assert c["current_leader"] == "a"
    assert c["percent_difference_at_end"] == pytest.approx(15.37, abs=0.01)


def test_compare_uses_only_common_years():
    b = [r for r in PINE if r["year"] != 2013]
    c = compare_two(HILLS, b, 2013, 2024)
    assert c["start_year"] == 2014
    assert 2013 not in c["years_compared"]


def test_compare_percent_unit_uses_points_only():
    a = [{"year": 2019, "value": 5.0}, {"year": 2024, "value": 5.8}]
    b = [{"year": 2019, "value": 4.0}, {"year": 2024, "value": 4.6}]
    c = compare_two(a, b, 2019, 2024, unit="percent")
    assert c["difference_at_end"] == pytest.approx(1.2)
    assert "percent_difference_at_end" not in c


def test_compare_reversal_detected():
    a = [{"year": 2019, "value": 90}, {"year": 2024, "value": 110}]
    b = [{"year": 2019, "value": 100}, {"year": 2024, "value": 100}]
    assert compare_two(a, b, 2019, 2024)["gap_direction"] == "reversed"


def test_compare_needs_two_common_years():
    c = compare_two(HILLS, [{"year": 2020, "value": 1}], 2013, 2024)
    assert c["available"] is False
