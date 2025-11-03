import oracledb from "oracledb"

let connection: any = null

export async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USERNAME || "system",
      password: process.env.ORACLE_PASSWORD || "password",
      connectString: process.env.ORACLE_CONNECTION_STRING || "localhost:1521/freepdb1",
    })
    console.log("[v0] OracleDB connection established successfully")
  } catch (error) {
    console.error("[v0] OracleDB connection error:", error)
    throw error
  }
}

export async function getConnection() {
  try {
    if (!connection) {
      await initializeDatabase()
    }
    return connection
  } catch (error) {
    console.error("[v0] Error getting connection:", error)
    throw error
  }
}

export async function closeConnection() {
  try {
    if (connection) {
      await connection.close()
      connection = null
    }
  } catch (error) {
    console.error("[v0] Error closing connection:", error)
  }
}

export async function executeQuery(sql: string, params: any[] = []) {
  let conn
  try {
    conn = await getConnection()
    const result = await conn.execute(sql, params, {
      autoCommit: true,
      fetchAsString: ["DATE", "TIMESTAMP"],
    })
    return result
  } catch (error) {
    console.error("[v0] Query execution error:", error)
    throw error
  }
}

export async function executeQuerySingle(sql: string, params: any[] = []) {
  const result = await executeQuery(sql, params)
  return result.rows?.[0] || null
}

export async function executeQueryMany(sql: string, params: any[] = []) {
  const result = await executeQuery(sql, params)
  return result.rows || []
}

export default initializeDatabase
