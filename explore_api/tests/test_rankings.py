from explore_api.rankings import build_rankings_response

# 5 counties, made-up but realistic income values for 2024
ROWS = [
    ("12057", "Hillsborough County", "Florida", 85183.0),
    ("12103", "Pinellas County", "Florida", 73832.0),
    ("12086", "Miami-Dade County", "Florida", 61616.0),
    ("12095", "Orange County", "Florida", 74351.0),
    ("01003", "Baldwin County", "Alabama", 69355.0),
]


def test_rank_1_is_highest_value_for_income():
    r = build_rankings_response("B19013", ROWS, ["12057"], 2024)
    assert r["rows"][0]["rank"] == 1  # Hillsborough is the highest of the 5


def test_rank_reflects_full_field_not_just_requested():
    # Orange (74,351) actually outranks Pinellas (73,832), even though we
    # only ask for Pinellas -- its rank must come from the whole table.
    r = build_rankings_response("B19013", ROWS, ["12103"], 2024)
    assert r["rows"][0]["rank"] == 3  # Hillsborough(1), Orange(2), Pinellas(3)


def test_national_average_uses_all_counties_not_just_requested():
    r = build_rankings_response("B19013", ROWS, ["12057", "12103"], 2024)
    expected_avg = sum(v for *_, v in ROWS) / len(ROWS)
    assert r["national_average"] == expected_avg
    assert r["n_counties"] == 5


def test_vs_average_sign():
    r = build_rankings_response("B19013", ROWS, ["12057", "12086"], 2024)
    by_id = {row["geo_id"]: row for row in r["rows"]}
    assert by_id["12057"]["vs_average"] > 0   # Hillsborough is above average
    assert by_id["12086"]["vs_average"] < 0   # Miami-Dade is below average


def test_county_with_no_data_is_omitted_not_faked():
    r = build_rankings_response("B19013", ROWS, ["12057", "99999"], 2024)
    assert len(r["rows"]) == 1
    assert r["rows"][0]["geo_id"] == "12057"


def test_lower_is_better_reverses_rank_order():
    # Gini index: LOWER inequality should be rank 1, not higher value.
    gini_rows = [
        ("12057", "Hillsborough County", "Florida", 0.47),
        ("12103", "Pinellas County", "Florida", 0.44),   # most equal -> rank 1
        ("12086", "Miami-Dade County", "Florida", 0.52),
    ]
    r = build_rankings_response("B19083", gini_rows, ["12103", "12086"], 2024)
    by_id = {row["geo_id"]: row for row in r["rows"]}
    assert by_id["12103"]["rank"] == 1
    assert by_id["12086"]["rank"] == 3


def test_geo_name_includes_state():
    r = build_rankings_response("B19013", ROWS, ["12057"], 2024)
    assert r["rows"][0]["geo_name"] == "Hillsborough County, Florida"
