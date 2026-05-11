FROM postgres:16-alpine
COPY migrations/001_init.sql /docker-entrypoint-initdb.d/01_init.sql
COPY migrations/002_seed.sql /docker-entrypoint-initdb.d/02_seed.sql
COPY migrations/003_users.sql /docker-entrypoint-initdb.d/03_users.sql
