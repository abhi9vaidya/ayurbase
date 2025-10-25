const oracledb = require('oracledb');

let pool = null;

async function initOraclePool() {
  if (pool) return pool;
  const { DB_USER, DB_PASSWORD, DB_CONNECT } = process.env;
  if (!DB_USER || !DB_PASSWORD || !DB_CONNECT) {
    console.warn('[oracle] DB env vars not configured (DB_USER/DB_PASSWORD/DB_CONNECT). Running in demo/mock mode.');
    return null;
  }

  try {
    pool = await oracledb.createPool({
      user: DB_USER,
      password: DB_PASSWORD,
      connectString: DB_CONNECT,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('[oracle] Pool created');
    return pool;
  } catch (err) {
    console.error('[oracle] Failed to create pool', err);
    pool = null;
    return null;
  }
}

async function getConnection() {
  if (!pool) {
    const p = await initOraclePool();
    if (!p) return null;
  }
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error('[oracle] getConnection error', err);
    throw err;
  }
}

async function closePool() {
  if (!pool) return;
  try {
    await pool.close(10);
    pool = null;
    console.log('[oracle] Pool closed');
  } catch (err) {
    console.error('[oracle] closePool error', err);
  }
}

module.exports = { initOraclePool, getConnection, closePool };
