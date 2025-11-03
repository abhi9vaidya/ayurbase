import oracledb from "oracledb";

let connection = null;

export async function getOracleConnection() {
  if (connection) return connection;

  connection = await oracledb.getConnection({
    user: process.env.ORACLE_USERNAME,
    password: process.env.ORACLE_PASSWORD,
    connectionString: process.env.ORACLE_CONNECTION_STRING,
  });

  return connection;
}