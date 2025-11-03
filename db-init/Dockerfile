# Use Oracle 23ai Free Lite as base
FROM container-registry.oracle.com/database/free:latest-lite

# Set working directory
WORKDIR /opt/oracle

# Copy your initialization SQL into the image's setup folder so the
# base Oracle image can run it during first startup. The official
# Oracle images run scripts placed under /opt/oracle/scripts/setup
# on initial container start (this is the common pattern).
COPY ./init.sql /opt/oracle/scripts/setup/init.sql

# We should not override the base image ENTRYPOINT here. The base
# image performs important startup tasks (database creation, permissions,
# listeners, etc). Overriding it caused our script to attempt SQL*Plus
# connections before the DB was ready, leading to ORA-12547 in logs.

# Expose Oracle DB default port
EXPOSE 1521
