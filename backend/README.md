# Pressure Tracker API (Docker)

## Quick start
```bash
docker compose up --build
```
API: http://localhost:8080/api  
Postgres: localhost:5432 (user/pass from env).

## Environment
Uses `.env` values when present. Important vars:
- `PORT` (default 8080)
- `CORS_ORIGIN` frontend origin
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

## Notes
- DB data stored in `pgdata` volume.
- Tables auto-create on startup.***
