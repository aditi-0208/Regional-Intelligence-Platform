/**
 * THE ONLY FILE YOU EDIT WHEN THE REAL SCHEMA DIFFERS.
 * queries.js builds all its SQL from these names.
 */
module.exports = {
  schema: 'dbo',

  fact: {
    table: 'fact_observation',
    variableId: 'variable_id',
    geoId: 'geo_id',
    sourceId: 'source_id',
    period: 'period',
    periodType: 'period_type',
    value: 'value',
    moe: 'moe',
  },

  variable: {
    table: 'dim_variable',
    id: 'variable_id',
    label: 'label',
    unit: 'unit',
    category: 'category',
    description: 'description',
    higherIsBetter: 'higher_is_better',
  },

  geography: {
    table: 'dim_geography',
    id: 'geo_id',
    name: 'geo_name',
    level: 'geo_level',       // 'county' | 'msa' | 'state'
    stateFips: 'state_fips',
    stateName: 'state_name',
  },

  source: {
    table: 'dim_source',
    id: 'source_id',
    name: 'source_name',
    publisher: 'publisher',
    url: 'source_url',
  },
};
