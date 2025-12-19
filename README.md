# Stuck On Inventory

The app is designed for handling collectible inventories, currently supporting US coins, Native American Relics, US stamps, and Bunnykins with the ability to be expanded in the future. This repository contains a React frontend (Vite + Nginx), a Node/Express backend, and a PostgreSQL database sharing a single Docker Compose file that runs all three services together.

## Services
- Frontend: Nginx serving the Vite build on http://localhost:8080
- Backend: Express API on http://localhost:5081
- Database: PostgreSQL on localhost:5432 (container name `db`)

## Quick Start

Prerequisites: Docker and Docker Compose installed.

```bash
# From the repository root
cp .env.example .env
docker compose build
docker compose up -d

# Verify backend health
curl http://localhost:5081/health

# Open the frontend
open http://localhost:8080
```

## Environment Variables

Compose reads variables from `.env` in the repo root. Start by copying
`.env.example` to `.env`, then adjust as needed.

Key variables:
- Backend: `NODE_ENV`, `APP_PORT`, `SQL_SERVER_IP`, `SQL_SERVER_PORT`, `SQL_USER`, `SQL_DB`, `SQL_PASS`
- Frontend: `VITE_ENV_URL` (use `http://localhost:5081`), `FRONTEND_PORT`

Defaults in `.env.example` are set to work with Compose out-of-the-box
(`SQL_SERVER_IP=db`, `VITE_ENV_URL=http://localhost:5081`).

For local development outside Docker:
- Use `SQL_SERVER_IP=localhost` and `VITE_ENV_URL=http://localhost:5081`.

## Useful URLs
- Frontend: http://localhost:8080
- Backend health: http://localhost:5081/health

## Project Structure
- Backend: `coinListsBackend/`
    - API routes live under `routes/`
    - DB init + seeding: `database/database.js`
    - Mint list data: `database/mints.json` (authoritative source)
    - Coin types data: `database/cointypes.json` (authoritative source)
- Frontend: `coinListsFrontend/`
    - Built by Vite, served by Nginx
    - Nginx config: `container/etc/nginx/`
- Compose: `docker-compose.yml` orchestrates db/backend/frontend

## Database Tables

The backend auto-creates the following tables on startup:

- **coins**: US coin inventory with type, mint location, year, circulation, grade, images, face value, and estimated value
- **cointypes**: Coin type definitions with face values (seeded from `cointypes.json`)
- **mintlocations**: US Mint locations with name, city, and state (seeded from `mints.json`)
- **relics**: Native American relics with type, origin, era, condition, description, and images
- **stamps**: US stamp inventory with country, denomination, issue year, condition, description, and images
- **bunnykins**: Bunnykins collectibles with name, series, production year, condition, description, and images

## Notes
- The frontend uses a relative `/api` base via Nginx to reach the backend.
- Database persistence: Compose bind-mounts Postgres data to `./data/postgres` so your data survives container restarts.
- **Mint locations seeding**: On backend start, `database/database.js` loads `database/mints.json` and reconciles the `mintlocations` table (adds new, updates changed, removes entries not present in JSON). Edit this JSON to manage mint location values, then restart the backend:

    ```bash
    docker compose build backend
    docker compose up -d backend
    ```

- **Coin types seeding**: Similarly, `database/cointypes.json` is loaded to seed/update the `cointypes` table with coin names and face values.

- To stop the stack: `docker compose down` (data persists). Use `docker compose down -v` to remove the DB data if you want a clean database.
