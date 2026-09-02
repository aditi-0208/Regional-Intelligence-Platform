const sql = require('mssql');

/**
 * Authentication note for mumasotrproddbs:
 *
 * SQL authentication is disabled on this server, so there is no
 * username/password to put in .env. The app authenticates as an
 * Entra identity instead:
 *
 *   locally      -> your `az login` session
 *   in Azure     -> the App Service Managed Identity
 *
 * Either way, a DBA must first run:
 *   CREATE USER [<identity>] FROM EXTERNAL PROVIDER;
 *   ALTER ROLE db_datareader ADD MEMBER [<identity>];
 */

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DB,
  authentication: { type: 'azure-active-directory-default' },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    // Fail fast rather than hanging a request for 15s on a firewall block
    connectTimeout: 15000,
    requestTimeout: 20000,
  },
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
};

let poolPromise = null;

/** Lazily create one pool for the process. Never open a connection per request. */
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect().catch((err) => {
      poolPromise = null; // allow retry on the next request
      throw err;
    });
  }
  return poolPromise;
}

/**
 * Run a parameterized query. `params` is { name: [sqlType, value] }.
 * Always pass values through here -- never interpolate into the SQL string.
 */
async function query(text, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  for (const [name, [type, value]] of Object.entries(params)) {
    request.input(name, type, value);
  }
  const result = await request.query(text);
  return result.recordset;
}

module.exports = { sql, getPool, query };
