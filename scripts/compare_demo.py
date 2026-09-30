"""Demo: live database -> analytics module, for two counties.

Reads median household income (ACS table B19013) for Hillsborough and
Pinellas from the SOTR database, then runs the analytics functions.
Read-only: it runs one SELECT and prints the results.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))  # SOTR/ folder (analytics package)
sys.path.insert(0, os.path.expanduser("~/Aditi/Projects/SOTR-github/backend"))  # db.py

from db import get_conn                                   # noqa: E402
from analytics import summarize_series, compare_two       # noqa: E402

COUNTIES = ("12057", "12103")   # Hillsborough, Pinellas (5-digit FIPS)
START, END = 2013, 2024
ESTIMATED = {2020}              # 2020 values look interpolated, not published

SQL = """
SELECT f.county_fips, g.county_name, y.year, f.median_household_income
FROM dbo.fact_county_B19013 f
JOIN dbo.dim_geo g  ON f.geo_id = g.geo_id
JOIN dbo.dim_year y ON f.year_id = y.year_id
WHERE f.county_fips IN (?, ?) AND y.year BETWEEN ? AND ?
ORDER BY f.county_fips, y.year
"""

with get_conn() as conn:
    rows = conn.cursor().execute(SQL, COUNTIES + (START, END)).fetchall()

series, names = {c: [] for c in COUNTIES}, {}
for fips, name, year, value in rows:
    names[fips] = name
    series[fips].append(
        {"year": int(year), "value": float(value) if value is not None else None}
    )

print(f"Rows fetched: {len(rows)}\n")

for fips in COUNTIES:
    s = summarize_series(series[fips], START, END, estimated_years=ESTIMATED)
    print(f"{names.get(fips, fips)}")
    if not s["available"]:
        print(f"  {s['reason']}\n")
        continue
    print(f"  {s['start_year']}: ${s['start_value']:,.0f}   {s['end_year']}: ${s['end_value']:,.0f}")
    print(f"  change: ${s['absolute_change']:,.0f} ({s['percent_change']:.1f}%)")
    print(f"  average: ${s['average']:,.0f}   trend: {s['trend']}")
    print(f"  missing years: {s['missing_years']}   estimated years: {s['estimated_years']}\n")

c = compare_two(series[COUNTIES[0]], series[COUNTIES[1]], START, END)
if c["available"]:
    print("Comparison (Hillsborough vs Pinellas)")
    print(f"  difference in {c['start_year']}: ${c['difference_at_start']:,.0f}")
    print(f"  difference in {c['end_year']}: ${c['difference_at_end']:,.0f}")
    print(f"  change in gap: ${c['change_in_gap']:,.0f} ({c['gap_direction']})")
else:
    print(c["reason"])
