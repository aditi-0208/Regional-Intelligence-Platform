import pytest

from explore_api import lookups
from explore_api.lookups import build_categories, build_series_response, geo_name
from explore_api.registry import INDICATORS

HILLS = [49597, 50796, 51725, 54588, 54731, 58480, 61154, 63530, 65905, 74308, 76687, 85183]
PINE = [43703, 45152, 47618, 50036, 51512, 52198, 56737, 59342, 61947, 66472, 70768, 73832]


def _rows(pine_missing_2015=False):
    rows = []
    for fips, name, vals in (("12057", "Hillsborough County", HILLS), ("12103", "Pinellas County", PINE)):
        for i, v in enumerate(vals):
            if pine_missing_2015 and fips == "12103" and 2013 + i == 2015:
                continue
            rows.append((fips, name, "Florida", 2013 + i, v))
    return rows


def test_geo_name_includes_state():
    assert geo_name("Baldwin County", "Alabama") == "Baldwin County, Alabama"


def test_categories_group_every_indicator_once():
    cats = build_categories()
    ids = [i["id"] for c in cats for i in c["indicators"]]
    assert sorted(ids) == sorted(INDICATORS)
    assert [c["id"] for c in cats] == ["income", "housing"]
    first = cats[0]["indicators"][0]
    assert set(first) == {"id", "label", "unit", "description"}


def test_series_pivot_matches_page_contract():
    r = build_series_response("B19013", _rows(), ["12057", "12103"])
    assert r["indicator"]["unit"] == "usd"
    assert [g["geo_id"] for g in r["geos"]] == ["12057", "12103"]
    assert r["geos"][0]["geo_name"] == "Hillsborough County, Florida"
    assert len(r["data"]) == 12
    assert r["data"][0] == {"period": "2013", "12057": 49597.0, "12103": 43703.0}
    assert r["estimated_years"] == [2020]
    assert r["sources"][0]["source_name"].startswith("U.S. Census Bureau")


def test_series_keeps_caller_order():
    r = build_series_response("B19013", _rows(), ["12103", "12057"])
    assert [g["geo_id"] for g in r["geos"]] == ["12103", "12057"]


def test_series_missing_value_is_null_not_zero():
    r = build_series_response("B19013", _rows(pine_missing_2015=True), ["12057", "12103"])
    row_2015 = next(x for x in r["data"] if x["period"] == "2015")
    assert row_2015["12103"] is None
    assert row_2015["12057"] == 51725.0


def test_series_county_without_data_is_left_out():
    rows = [x for x in _rows() if x[0] == "12057"]
    r = build_series_response("B19013", rows, ["12057", "12103"])
    assert [g["geo_id"] for g in r["geos"]] == ["12057"]


def test_series_no_rows_gives_empty_data():
    r = build_series_response("B19013", [], ["12057"])
    assert r["geos"] == [] and r["data"] == []
