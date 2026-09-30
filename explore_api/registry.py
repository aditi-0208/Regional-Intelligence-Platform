"""Hand-written lookup of indicators the comparison endpoint supports.

Temporary: this is replaced by the indicator_catalog table once its unit,
display name and value-column fields are filled in. Only these codes are
accepted, and table/column names come from here, never from user input.
"""
SOURCE = "U.S. Census Bureau, American Community Survey"
SOURCE_ID = "acs"

# Order shown in the Category dropdown.
CATEGORIES = [("income", "Income"), ("housing", "Housing")]

INDICATORS = {
    "B19013": {
        "category": "income", "description": "Middle value of household income: half of households earn more, half earn less.",
        "table": "fact_county_B19013", "column": "median_household_income",
        "label": "Median household income", "noun": "median household income",
        "unit": "usd", "higher_is_better": True,
    },
    "B19113": {
        "category": "income", "description": "Middle value of family income: half of families earn more, half earn less.",
        "table": "fact_county_B19113", "column": "median_family_income",
        "label": "Median family income", "noun": "median family income",
        "unit": "usd", "higher_is_better": True,
    },
    "B19301": {
        "category": "income", "description": "Total income divided by the number of people in the area.",
        "table": "fact_county_B19301", "column": "per_capita_income",
        "label": "Per capita income", "noun": "per capita income",
        "unit": "usd", "higher_is_better": True,
    },
    "B19083": {
        "category": "income", "description": "Income inequality from 0 (perfect equality) to 1 (perfect inequality).",
        "table": "fact_county_B19083", "column": "gini_index",
        "label": "Gini index of income inequality", "noun": "Gini index",
        "unit": "index", "higher_is_better": False,
    },
    "B25077": {
        "category": "housing", "description": "Median value of owner-occupied homes, as estimated by owners.",
        "table": "fact_county_B25077", "column": "median_value_in_dollars",
        "label": "Median home value", "noun": "median home value",
        "unit": "usd", "higher_is_better": None,
    },
}
