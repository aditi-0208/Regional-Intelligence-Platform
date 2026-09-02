const { sql, query } = require('./db');
const S = require('./schema');

const q = (t) => (S.schema ? `[${S.schema}].[${t}]` : `[${t}]`);
const F = S.fact, V = S.variable, G = S.geography, SRC = S.source;

/** Safe parameterized IN clause -- never concatenate request values into SQL. */
function inClause(prefix, values, type = sql.VarChar(20)) {
  const params = {};
  const names = values.map((v, i) => { params[`${prefix}${i}`] = [type, v]; return `@${prefix}${i}`; });
  return { sql: names.join(', '), params };
}

async function listCategories() {
  const rows = await query(`
    SELECT v.[${V.id}] AS id, v.[${V.label}] AS label, v.[${V.unit}] AS unit,
           v.[${V.category}] AS category_label, v.[${V.description}] AS description,
           v.[${V.higherIsBetter}] AS higher_is_better
    FROM ${q(V.table)} v
    ORDER BY v.[${V.category}], v.[${V.label}]
  `);

  const byCategory = new Map();
  for (const r of rows) {
    const label = r.category_label || 'Other';
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!byCategory.has(id)) byCategory.set(id, { id, label, indicators: [] });
    byCategory.get(id).indicators.push({
      id: r.id, label: r.label, unit: r.unit,
      description: r.description, higher_is_better: r.higher_is_better,
    });
  }
  return [...byCategory.values()];
}

async function getIndicator(id) {
  const rows = await query(`
    SELECT v.[${V.id}] AS id, v.[${V.label}] AS label, v.[${V.unit}] AS unit,
           v.[${V.category}] AS category_label, v.[${V.description}] AS description,
           v.[${V.higherIsBetter}] AS higher_is_better
    FROM ${q(V.table)} v WHERE v.[${V.id}] = @id
  `, { id: [sql.VarChar(80), id] });
  return rows[0] || null;
}

function listStates() {
  return query(`
    SELECT DISTINCT g.[${G.stateFips}] AS state_fips, g.[${G.stateName}] AS state_name
    FROM ${q(G.table)} g
    WHERE g.[${G.stateFips}] IS NOT NULL
    ORDER BY g.[${G.stateName}]
  `);
}

function listGeographies({ level, state, q: search }) {
  return query(`
    SELECT g.[${G.id}] AS geo_id, g.[${G.name}] AS geo_name,
           g.[${G.level}] AS geo_level, g.[${G.stateFips}] AS state_fips
    FROM ${q(G.table)} g
    WHERE g.[${G.level}] = @level
      AND (@state IS NULL OR g.[${G.stateFips}] = @state)
      AND (@search IS NULL OR g.[${G.name}] LIKE '%' + @search + '%')
    ORDER BY g.[${G.name}]
  `, {
    level: [sql.VarChar(20), level],
    state: [sql.VarChar(2), state],
    search: [sql.NVarChar(200), search],
  });
}

function getSeries({ indicatorId, geoIds, from, to }) {
  const geos = inClause('geo', geoIds);
  return query(`
    SELECT g.[${G.id}] AS geo_id, g.[${G.name}] AS geo_name,
           f.[${F.period}] AS period, f.[${F.value}] AS value,
           f.[${F.moe}] AS moe, f.[${F.sourceId}] AS source_id
    FROM ${q(F.table)} f
    JOIN ${q(G.table)} g ON g.[${G.id}] = f.[${F.geoId}]
    WHERE f.[${F.variableId}] = @indicatorId
      AND f.[${F.geoId}] IN (${geos.sql})
      AND (@from IS NULL OR f.[${F.period}] >= @from)
      AND (@to   IS NULL OR f.[${F.period}] <= @to)
    ORDER BY f.[${F.period}] ASC
  `, {
    indicatorId: [sql.VarChar(80), indicatorId],
    from: [sql.VarChar(10), from],
    to: [sql.VarChar(10), to],
    ...geos.params,
  });
}

/**
 * National ranking + average in one round trip. RANK() over the full
 * population at this level, then filter to the selected regions -- doing
 * it this way keeps the rank correct without shipping every county to Node.
 */
async function getRankings({ indicatorId, level, period, geoIds }) {
  const geos = geoIds.length ? inClause('geo', geoIds) : null;

  const rows = await query(`
    WITH latest AS (
      SELECT MAX(f.[${F.period}]) AS p
      FROM ${q(F.table)} f
      JOIN ${q(G.table)} g ON g.[${G.id}] = f.[${F.geoId}]
      WHERE f.[${F.variableId}] = @indicatorId AND g.[${G.level}] = @level
    ),
    pool AS (
      SELECT g.[${G.id}] AS geo_id, g.[${G.name}] AS geo_name,
             f.[${F.value}] AS value, f.[${F.period}] AS period
      FROM ${q(F.table)} f
      JOIN ${q(G.table)} g ON g.[${G.id}] = f.[${F.geoId}]
      WHERE f.[${F.variableId}] = @indicatorId
        AND g.[${G.level}] = @level
        AND f.[${F.period}] = COALESCE(@period, (SELECT p FROM latest))
        AND f.[${F.value}] IS NOT NULL
    ),
    ranked AS (
      SELECT *, RANK() OVER (ORDER BY value DESC) AS rank_num,
             AVG(value) OVER () AS national_average,
             COUNT(*)   OVER () AS total
      FROM pool
    )
    SELECT geo_id, geo_name, value, period, rank_num, national_average, total
    FROM ranked
    ${geos ? `WHERE geo_id IN (${geos.sql})` : ''}
    ORDER BY rank_num
  `, {
    indicatorId: [sql.VarChar(80), indicatorId],
    level: [sql.VarChar(20), level],
    period: [sql.VarChar(10), period],
    ...(geos ? geos.params : {}),
  });

  const avg = rows[0]?.national_average ?? null;
  return {
    period: rows[0]?.period ?? period,
    total: rows[0]?.total ?? 0,
    national_average: avg == null ? null : Math.round(avg * 10) / 10,
    indicator: await getIndicator(indicatorId),
    rows: rows.map((r) => ({
      geo_id: r.geo_id, geo_name: r.geo_name, value: r.value, rank: r.rank_num,
      vs_average: avg == null ? null : Math.round((r.value - avg) * 10) / 10,
    })),
  };
}

function getSources(sourceIds) {
  if (!sourceIds.length) return Promise.resolve([]);
  const ids = inClause('src', sourceIds, sql.VarChar(40));
  return query(`
    SELECT s.[${SRC.id}] AS source_id, s.[${SRC.name}] AS source_name,
           s.[${SRC.publisher}] AS publisher, s.[${SRC.url}] AS source_url
    FROM ${q(SRC.table)} s WHERE s.[${SRC.id}] IN (${ids.sql})
  `, ids.params);
}

module.exports = {
  listCategories, listStates, listGeographies, getIndicator,
  getSeries, getRankings, getSources,
};
