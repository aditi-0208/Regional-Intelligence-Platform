/**
 * Mock layer. Same function signatures as queries.js, so index.js swaps
 * between them with one require and nothing else changes.
 *
 * Figures are plausible-looking but invented. Don't screenshot them.
 */

const CATEGORIES = [
  {
    id: 'housing', label: 'Housing',
    indicators: [
      { id: 'family_household_share', label: 'Household type: Family share', unit: 'percent',
        description: 'Share of households that are family households', higher_is_better: null },
      { id: 'median_home_value', label: 'Median home value', unit: 'usd',
        description: 'Median value of owner-occupied housing units', higher_is_better: null },
      { id: 'housing_cost_burden', label: 'Housing cost burden', unit: 'percent',
        description: 'Households spending 30%+ of income on housing', higher_is_better: false },
    ],
  },
  {
    id: 'economy', label: 'Economy',
    indicators: [
      { id: 'median_household_income', label: 'Median household income', unit: 'usd', higher_is_better: true },
      { id: 'poverty_rate', label: 'Poverty rate', unit: 'percent', higher_is_better: false },
      { id: 'gini_index', label: 'Income inequality (Gini)', unit: 'index', higher_is_better: false },
    ],
  },
  {
    id: 'workforce', label: 'Workforce',
    indicators: [
      { id: 'labor_force_participation', label: 'Labor force participation rate', unit: 'percent', higher_is_better: true },
      { id: 'unemployment_rate', label: 'Unemployment rate', unit: 'percent', higher_is_better: false },
    ],
  },
  {
    id: 'innovation', label: 'Innovation',
    indicators: [
      { id: 'bachelors_or_higher', label: "Bachelor's degree or higher", unit: 'percent', higher_is_better: true },
      { id: 'patents_per_100k', label: 'Patent filings per 100k', unit: 'rate', higher_is_better: true },
    ],
  },
];

const ALL_INDICATORS = CATEGORIES.flatMap((c) =>
  c.indicators.map((i) => ({ ...i, category_id: c.id, category_label: c.label }))
);

const STATES = [
  { state_fips: '12', state_name: 'Florida' },
  { state_fips: '13', state_name: 'Georgia' },
  { state_fips: '48', state_name: 'Texas' },
  { state_fips: '37', state_name: 'North Carolina' },
  { state_fips: '47', state_name: 'Tennessee' },
];

const COUNTIES = [
  ['12057', 'Hillsborough County, FL', '12'], ['12086', 'Miami-Dade County, FL', '12'],
  ['12095', 'Orange County, FL', '12'],       ['12103', 'Pinellas County, FL', '12'],
  ['12101', 'Pasco County, FL', '12'],        ['12053', 'Hernando County, FL', '12'],
  ['12105', 'Polk County, FL', '12'],         ['12081', 'Manatee County, FL', '12'],
  ['12011', 'Broward County, FL', '12'],      ['12031', 'Duval County, FL', '12'],
  ['12071', 'Lee County, FL', '12'],          ['12099', 'Palm Beach County, FL', '12'],
  ['13121', 'Fulton County, GA', '13'],       ['13089', 'DeKalb County, GA', '13'],
  ['13135', 'Gwinnett County, GA', '13'],     ['13067', 'Cobb County, GA', '13'],
  ['48201', 'Harris County, TX', '48'],       ['48113', 'Dallas County, TX', '48'],
  ['48453', 'Travis County, TX', '48'],       ['48029', 'Bexar County, TX', '48'],
  ['37119', 'Mecklenburg County, NC', '37'],  ['37183', 'Wake County, NC', '37'],
  ['37081', 'Guilford County, NC', '37'],     ['47037', 'Davidson County, TN', '47'],
  ['47157', 'Shelby County, TN', '47'],
].map(([geo_id, geo_name, state_fips]) => ({ geo_id, geo_name, geo_level: 'county', state_fips }));

const MSAS = [
  ['45300', 'Tampa-St. Petersburg-Clearwater, FL', '12'],
  ['33100', 'Miami-Fort Lauderdale-West Palm Beach, FL', '12'],
  ['36740', 'Orlando-Kissimmee-Sanford, FL', '12'],
  ['27260', 'Jacksonville, FL', '12'],
  ['12060', 'Atlanta-Sandy Springs-Alpharetta, GA', '13'],
  ['26420', 'Houston-The Woodlands-Sugar Land, TX', '48'],
  ['19100', 'Dallas-Fort Worth-Arlington, TX', '48'],
  ['12420', 'Austin-Round Rock-Georgetown, TX', '48'],
  ['16740', 'Charlotte-Concord-Gastonia, NC', '37'],
  ['34980', 'Nashville-Davidson-Murfreesboro, TN', '47'],
].map(([geo_id, geo_name, state_fips]) => ({ geo_id, geo_name, geo_level: 'msa', state_fips }));

const GEOS = [...COUNTIES, ...MSAS];
const YEARS = ['2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'];

/* Deterministic pseudo-random, so charts don't jump on reload */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}

const BASE = {
  family_household_share: 62, median_home_value: 245000, housing_cost_burden: 32,
  median_household_income: 58000, poverty_rate: 14, gini_index: 0.46,
  labor_force_participation: 63, unemployment_rate: 5.2,
  bachelors_or_higher: 31, patents_per_100k: 18,
};

const DRIFT = {
  median_home_value: 0.062, median_household_income: 0.028, poverty_rate: -0.012,
  bachelors_or_higher: 0.014, unemployment_rate: -0.02, patents_per_100k: 0.03,
};

function valueFor(indicatorId, geoId, year) {
  const base = BASE[indicatorId] ?? 50;
  const geoFactor = 0.85 + hash(geoId + indicatorId) * 0.35;
  const drift = 1 + (Number(year) - 2013) * (DRIFT[indicatorId] ?? 0.004);
  const wobble = 0.975 + hash(geoId + year + indicatorId) * 0.05;
  const raw = base * geoFactor * drift * wobble;
  if (indicatorId === 'median_home_value' || indicatorId === 'median_household_income') return Math.round(raw / 100) * 100;
  if (indicatorId === 'gini_index') return Math.round(raw * 1000) / 1000;
  return Math.round(raw * 10) / 10;
}

function moeFor(indicatorId, value) {
  if (indicatorId === 'gini_index') return Math.round(value * 0.03 * 1000) / 1000;
  if (BASE[indicatorId] > 1000) return Math.round(value * 0.022);
  return Math.round(value * 0.055 * 10) / 10;
}

async function listCategories() { return CATEGORIES; }
async function listStates() { return STATES; }
async function getIndicator(id) { return ALL_INDICATORS.find((i) => i.id === id) || null; }

async function listGeographies({ level, state, q }) {
  return GEOS.filter((g) =>
    g.geo_level === level &&
    (!state || g.state_fips === state) &&
    (!q || g.geo_name.toLowerCase().includes(q.toLowerCase()))
  );
}

async function getSeries({ indicatorId, geoIds, from, to }) {
  const years = YEARS.filter((y) => (!from || y >= String(from)) && (!to || y <= String(to)));
  const rows = [];
  for (const year of years) {
    for (const geoId of geoIds) {
      const geo = GEOS.find((g) => g.geo_id === geoId);
      if (!geo) continue;
      const value = valueFor(indicatorId, geoId, year);
      rows.push({
        geo_id: geoId, geo_name: geo.geo_name, period: year,
        value, moe: moeFor(indicatorId, value), source_id: 'acs5',
      });
    }
  }
  return rows;
}

async function getRankings({ indicatorId, level, period, geoIds }) {
  const year = period || YEARS[YEARS.length - 1];
  const pool = GEOS.filter((g) => g.geo_level === level);

  const scored = pool
    .map((g) => ({ geo_id: g.geo_id, geo_name: g.geo_name, value: valueFor(indicatorId, g.geo_id, year) }))
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const nationalAverage = Math.round((scored.reduce((s, r) => s + r.value, 0) / scored.length) * 10) / 10;

  return {
    period: year,
    total: scored.length,
    national_average: nationalAverage,
    indicator: await getIndicator(indicatorId),
    // Only the selected regions -- the page shows these plus the average row
    rows: geoIds
      .map((id) => scored.find((r) => r.geo_id === id))
      .filter(Boolean)
      .map((r) => ({ ...r, vs_average: Math.round((r.value - nationalAverage) * 10) / 10 })),
  };
}

async function getSources() {
  return [{
    source_id: 'acs5', source_name: 'ACS 5-Year Estimates',
    publisher: 'U.S. Census Bureau', source_url: 'https://www.census.gov/programs-surveys/acs',
  }];
}

module.exports = {
  listCategories, listStates, listGeographies, getIndicator,
  getSeries, getRankings, getSources,
};
