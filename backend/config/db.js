const { Pool } = require('pg');
const colors = require('colors');

// Create but don't connect yet
let pool = null;

/**
 * Initialize the database pool without connecting
 * Will only connect when first query is made
 */
const initPool = () => {
  console.log('[DB] initPool() called');
  if (pool) {
    console.log('[DB] Pool already initialized, returning existing pool');
    return pool;
  }

  // Get DB config from environment, check multiple possible naming conventions
  const dbHost = process.env.PG_HOST || process.env.PGHOST || 'localhost';
  const dbUser = process.env.PG_USER || process.env.PGUSER || 'postgres';
  const dbPassword = process.env.PG_PASSWORD || process.env.PGPASSWORD || 'Test@1234';
  const dbName = process.env.PG_DATABASE || process.env.PGDATABASE || 'smartblindshub';
  const dbPort = process.env.PG_PORT || process.env.PGPORT || 5432;

  console.log('[DB] Creating new database pool with params:');
  console.log(`[DB] Host: ${dbHost}`);
  console.log(`[DB] Database: ${dbName}`);
  console.log(`[DB] User: ${dbUser}`);
  console.log(`[DB] Port: ${dbPort}`);

  // Create a new pool
  pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
  });

  // Log any pool errors
  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client'.red, err);
  });

  console.log('[DB] PostgreSQL pool initialized (connection will be established on first query)'.cyan);
  return pool;
};

/**
 * Get client with connect
 * This ensures we connect on-demand, not at startup
 */
const getClient = async () => {
  console.log('[DB] getClient() called - attempting to get database connection');
  try {
    // Make sure the pool is initialized
    const dbPool = initPool();
    // Get connection from pool
    console.log('[DB] Connecting to PostgreSQL');
    const client = await dbPool.connect();
    console.log('[DB] Connected to PostgreSQL successfully'.green);
    return client;
  } catch (error) {
    console.error(`[DB] Error connecting to PostgreSQL: ${error.message}`.red);
    console.error(error.stack);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = {
  initPool,
  getClient,
  query: async (text, params) => {
    console.log(`[DB] Executing query: ${text.substring(0, 100)}...`);
    let client;
    try {
      client = await getClient();
      console.log('[DB] Client acquired, executing query');
      const result = await client.query(text, params);
      console.log(`[DB] Query executed successfully, rows: ${result.rowCount}`);
      return result;
    } catch (error) {
      console.error(`[DB] Error executing query: ${error.message}`.red);
      console.error(error.stack);
      throw error; // Rethrow the error to be handled by the caller
    } finally {
      if (client) {
        console.log('[DB] Releasing client');
        client.release();
        console.log('[DB] Client released');
      }
    }
  },
  end: async () => {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('Database pool has ended'.cyan);
    }
  }
};
