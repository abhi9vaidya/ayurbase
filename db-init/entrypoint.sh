#!/bin/bash
set -euo pipefail

# Robust entry script to create a PDB-local user and optional service.
# Intended to be run inside the Oracle container (manually or from a wrapper).

: "${ORACLE_USERNAME:?Need to set ORACLE_USERNAME in .env}"
: "${ORACLE_PASSWORD:?Need to set ORACLE_PASSWORD in .env}"
: "${ORACLE_DATABASE:?Need to set ORACLE_DATABASE in .env}"

echo "Oracle init: waiting for database to be ready..."

# Wait until SQL*Plus responds as SYSDBA (with a timeout)
MAX_WAIT=300
WAITED=0
until sqlplus -s / as sysdba <<'SQL' >/dev/null 2>&1
WHENEVER SQLERROR EXIT FAILURE
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
SELECT 1 FROM dual;
EXIT
SQL
do
    sleep 5
    WAITED=$((WAITED+5))
    echo "waiting for database... ${WAITED}s"
    if [ "$WAITED" -ge "$MAX_WAIT" ]; then
        echo "Timed out waiting for database" >&2
        exit 1
    fi
done

echo "Database ready — determining target PDB..."

# Find an open, writable PDB (exclude PDB$SEED)
TARGET_PDB=$(sqlplus -s / as sysdba <<SQL
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
SELECT name FROM v\$pdbs WHERE name NOT IN ('PDB\$SEED') AND open_mode LIKE 'READ WRITE' AND ROWNUM=1;
EXIT
SQL
)
TARGET_PDB=$(echo "$TARGET_PDB" | tr -d '[:space:]')
if [ -z "$TARGET_PDB" ]; then
    echo "No writable PDB found, defaulting to FREEPDB1"
    TARGET_PDB="FREEPDB1"
fi
echo "Target PDB: $TARGET_PDB"

echo "Creating user '${ORACLE_USERNAME}' in PDB ${TARGET_PDB} if it does not exist..."

# Create user in the PDB (local user) and grant necessary privileges
sqlplus / as sysdba <<SQL
WHENEVER SQLERROR EXIT FAILURE
ALTER SESSION SET CONTAINER=$TARGET_PDB;
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
DECLARE
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = UPPER('${ORACLE_USERNAME}');
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER ${ORACLE_USERNAME} IDENTIFIED BY "${ORACLE_PASSWORD}"';
        EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO ${ORACLE_USERNAME}';
        EXECUTE IMMEDIATE 'GRANT CONNECT TO ${ORACLE_USERNAME}';
        EXECUTE IMMEDIATE 'GRANT UNLIMITED TABLESPACE TO ${ORACLE_USERNAME}';
        EXECUTE IMMEDIATE 'ALTER USER ${ORACLE_USERNAME} ACCOUNT UNLOCK';
    END IF;
END;
/
EXIT
SQL

echo "Ensuring listener has service name '${ORACLE_DATABASE}' (creating DBMS_SERVICE in PDB if needed)..."

# Check whether the service exists (case-insensitive)
SERVICE_EXISTS=$(sqlplus -s / as sysdba <<SQL
SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
SELECT COUNT(*) FROM v\$services WHERE LOWER(name) = LOWER('${ORACLE_DATABASE}');
EXIT
SQL
)
SERVICE_EXISTS=$(echo "$SERVICE_EXISTS" | tr -d '[:space:]')
if [ -z "$SERVICE_EXISTS" ]; then SERVICE_EXISTS=0; fi

if [ "$SERVICE_EXISTS" -eq 0 ]; then
    echo "Service '${ORACLE_DATABASE}' not found — creating in PDB ${TARGET_PDB}"
    sqlplus / as sysdba <<SQL
    WHENEVER SQLERROR EXIT FAILURE
    ALTER SESSION SET CONTAINER=$TARGET_PDB;
    BEGIN
        DBMS_SERVICE.CREATE_SERVICE(service_name => '${ORACLE_DATABASE}', network_name => '${ORACLE_DATABASE}');
        DBMS_SERVICE.START_SERVICE('${ORACLE_DATABASE}');
    EXCEPTION
        WHEN OTHERS THEN
            NULL; -- non-fatal if service cannot be created
    END;
    /
    EXIT
SQL
else
    echo "Service '${ORACLE_DATABASE}' already exists"
fi

echo "Running optional init.sql if present..."
if [ -f /opt/oracle/scripts/setup/init.sql ]; then
    # try running init.sql as the created user; fall back to SYS if needed
    if sqlplus -s ${ORACLE_USERNAME}/${ORACLE_PASSWORD}@//localhost:1521/${ORACLE_DATABASE} @/opt/oracle/scripts/setup/init.sql >/dev/null 2>&1; then
        echo "init.sql executed as ${ORACLE_USERNAME} against ${ORACLE_DATABASE}"
    else
        echo "Could not execute init.sql as ${ORACLE_USERNAME}, attempting as SYSDBA"
        sqlplus / as sysdba @/opt/oracle/scripts/setup/init.sql || true
    fi
else
    echo "No init.sql found at /opt/oracle/scripts/setup/init.sql"
fi

echo "Initialization complete."
# Keep running so a user can exec into the container if this is started manually
tail -f /dev/null
