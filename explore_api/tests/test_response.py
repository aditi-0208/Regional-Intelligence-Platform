import pytest
from fastapi import HTTPException

from explore_api.comparison import build_comparison_response
from explore_api.registry import INDICATORS

HILLS = [49597, 50796, 51725, 54588, 54731, 58480, 61154, 63530, 65905, 74308, 76687, 85183]
PINE = [43703, 45152, 47618, 50036, 51512, 52198, 56737, 59342, 61947, 66472, 70768, 73832]


def _rows():
    rows = []
    for fips, name, vals in (("12057", "Hillsborough County", HILLS), ("12103", "Pinellas County", PINE)):
        rows += [(fips, name, 2013 + i, v) for i, v in enumerate(vals)]
    return rows


def test_response_shape_and_values():
    r = build_comparison_response("B19013", _rows(), "12057", "12103", 2013, 2024)
    assert r["indicator"]["unit"] == "usd"
    assert [c["name"] for c in r["counties"]] == ["Hillsborough County", "Pinellas County"]
    assert r["counties"][0]["summary"]["percent_change"] == pytest.approx(71.75, abs=0.01)
    assert r["comparison"]["change_in_gap"] == 5457
    assert len(r["insights"]) == 3
    assert any(p["estimated"] for p in r["counties"][0]["series"] if p["year"] == 2020)
    assert any("2020" in n for n in r["notes"])


def test_no_data_for_a_county_is_404_not_zero():
    rows = [row for row in _rows() if row[0] == "12057"]
    with pytest.raises(HTTPException) as e:
        build_comparison_response("B19013", rows, "12057", "12103", 2013, 2024)
    assert e.value.status_code == 404


def test_registry_is_complete():
    for code, spec in INDICATORS.items():
        for key in ("table", "column", "label", "noun", "unit"):
            assert spec[key], (code, key)
        assert spec["table"] == f"fact_county_{code}"
