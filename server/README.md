# SOTR Explore — wiring the page to real data

Your `Explore.jsx` was a complete, well-designed page with every value
hardcoded — `REGIONS`, `SERIES`, `TABLE_ROWS`, the summary statistics, and the
national rankings were all literals in the file. The design is preserved
exactly; only the data source changed.

```
Explore.jsx  ──fetch──►  Express API  ──mssql──►  mumasotrproddb
   (CRA :3000)              (:4000)
```

The browser never talks to Azure. Database credentials in frontend code are
visible to anyone who opens DevTools.

---

## Run it

**Server**

```bash
cd server
npm install
cp .env.example .env      # USE_MOCK=true already set
npm run dev               # http://localhost:4000
```

**Frontend** — no new dependencies. Recharts and react-router-dom are already
in your `package.json`.

1. Copy `client/src/api/sotr.js`, `client/src/hooks/useApi.js`, and
   `client/src/pages/Explore.jsx` into your project at the same paths.
2. Create `.env.local` at the project root:

   ```
   REACT_APP_API_BASE=http://localhost:4000
   ```

3. `npm start`, then open `/explore`.

Your existing `Explore.css` is untouched and every class name still applies.

---

## What became dynamic

| Was hardcoded | Now |
|---|---|
| `REGIONS` (3 fixed counties) | Chips you can add and remove, from `/geographies` |
| `SERIES` (3 fixed arrays) | `/series`, pivoted server-side for Recharts |
| `TABLE_ROWS` | Same data as the chart — table view can no longer drift from it |
| Stat card values and deltas | Computed from the series |
| Summary statistics block | `summarize()` — change, peak, largest YoY move |
| National context table | `/rankings`, with the average row placed in rank order |
| Category / State / Indicator selects | Real options, and the selects actually filter |
| Share / CSV buttons | Copy URL; download CSV of the current view |

Four things worth calling out:

**The Y axis was pinned to `[59, 66]`.** Fine for a percentage, but median
home value would have rendered as a flat line off-scale. It's now computed
from the data with padding.

**Selections live in the URL** (`?level=county&indicator=…&geos=12057,12086`).
That makes Share a one-line clipboard copy, and it means a colleague can send
you a specific view. It also survives refresh.

**Colour is assigned by slot, not by region.** First selected region is always
blue, second green, third amber — consistent across chips, stat cards, chart,
summary columns, and the rankings table, which is what the page's own note
promises.

**Series rows are keyed by `geo_id`, not name.** Region names contain commas
and can collide across states; IDs can't.

---

## API

| Route | Feeds |
|---|---|
| `GET /api/explore/categories` | Category + Indicator selects (they're dependent, so one call) |
| `GET /api/explore/states` | State filter |
| `GET /api/explore/geographies?level=&state=&q=` | Region picker |
| `GET /api/explore/series?indicator=&geos=&from=&to=` | Chart, table, stat cards, summaries |
| `GET /api/explore/rankings?indicator=&level=&period=&geos=` | National context table |

---

## Switching to the live database

1. Get a DBA to grant your Entra identity `db_datareader` on `mumasotrproddb`.
2. `npm install mssql @azure/identity` in `server/`
3. `az login` locally — in Azure, enable Managed Identity on the App Service
4. `USE_MOCK=false` in `.env`
5. `curl localhost:4000/api/health` → expect `{"mode":"live","db":"connected"}`

Then run these against the real database and correct **`server/schema.js`** —
it maps assumed table and column names to real ones, and `queries.js` builds
all its SQL from it. Nothing in the frontend changes.

```sql
SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';
SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='<table>';
```

`queries.js` assumes a star schema: `fact_observation` joined to
`dim_variable`, `dim_geography`, `dim_source`. If the warehouse instead has
one table per source, ask for a **view** in that shape rather than
normalizing in the API — a view serves every consumer, not just this page.

---

## Still to decide

**Margin of error.** `/series` already returns `<geo_id>__moe` for every
point, and the mock generates realistic values, but nothing displays them
yet. ACS figures are survey estimates: showing 63.1% and 61.4% as different
when both carry ±3 is the kind of thing a reviewer will flag on a USF
research product. A custom Recharts tooltip showing `± x` is the cheapest fix.

**`/reports` overlaps with this page.** It's titled "Explore the data" and
renders ~40 Tableau Public embeds. Two explore experiences with different
data paths will confuse people and double your maintenance. Worth settling
with the team which one is the destination.

**Orphaned code.** `registry.jsx`, `IncomeReport.jsx`, `GenericReport.jsx`,
`MainLayout.jsx`, `USAMap.jsx`, and `DemoIndicatorChart.jsx` aren't imported
anywhere. `IncomeReport` in particular is ~600 lines with a choropleth,
heatmap, and slopegraph. Check whether that was deliberate before anyone
rebuilds something that already exists.

**React Query.** `useApi.js` is deliberately dependency-free and handles the
race condition that matters (fast indicator switching). If you build more
data-driven pages, `@tanstack/react-query` gives you caching and dedup for
free — replace that one file.
