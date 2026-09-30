from analytics import compare_two, describe_comparison, summarize_series
from analytics.tests.test_analytics import HILLS, PINE


def _build(a, b, s, e, unit="usd", label="median household income"):
    sa, sb = summarize_series(a, s, e), summarize_series(b, s, e)
    c = compare_two(a, b, s, e, unit=unit)
    return describe_comparison(label, unit, "Hillsborough County", "Pinellas County", sa, sb, c)


def test_real_data_sentences():
    out = _build(HILLS, PINE, 2013, 2024)
    assert out[0] == ("Hillsborough County's median household income rose 71.8% between 2013 "
                      "and 2024, compared with a 68.9% increase in Pinellas County.")
    assert out[1] == ("Hillsborough County had the higher median household income in 2024, and "
                      "the difference widened from $5,894 in 2013 to $11,351 in 2024.")
    assert out[2] == "Both counties show an increasing trend over the selected period."


def test_percent_unit_uses_points():
    a = [{"year": 2019, "value": 5.0}, {"year": 2024, "value": 5.8}]
    b = [{"year": 2019, "value": 4.0}, {"year": 2024, "value": 4.6}]
    out = _build(a, b, 2019, 2024, unit="percent", label="unemployment rate")
    assert "0.8 percentage points" in out[0]
    assert "1.2 percentage points" in out[1]
    assert "%" not in out[1]


def test_reversal_sentence():
    a = [{"year": 2019, "value": 90}, {"year": 2024, "value": 110}]
    b = [{"year": 2019, "value": 100}, {"year": 2024, "value": 100}]
    out = _build(a, b, 2019, 2024)
    assert any("Pinellas County had the higher" in s and "Hillsborough County had the higher" in s for s in out)


def test_no_data_gives_no_claims():
    assert _build([], [], 2019, 2024) == []
