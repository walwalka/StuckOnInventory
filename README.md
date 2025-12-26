# Stuck On Inventory

A web app for cataloging your collections - coins, comics, Native American artifacts, stamps, and Bunnykins figurines. Built with React, Express, and PostgreSQL, it runs everything in Docker for easy setup.

## What It Does

Track your collectibles with custom fields for each type. Upload photos (HEIC works too), switch between table and card views, and keep everything organized in one place. The coin tracker even has AI value estimation.

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd StuckOnInventory
cp .env.example .env

# Start everything
docker compose build
docker compose up -d

# Visit http://localhost:8080
```

That's it. The database sets itself up on first run.

## What's Inside

**Collections You Can Track:**
- Coins (mint, year, grade, circulation)
- Comics (publisher, issue number, CGC grade)
- Native American artifacts (origin, era, condition)
- Stamps (country, denomination, year)
- Bunnykins figurines (series, production year)

**Features:**
- Upload 3 images per item (HEIC converts automatically)
- Dark mode
- Mobile-friendly
- JWT auth with email verification
- Password reset via email
- Rate limiting built in
- Reference data management (coin types, mints, publishers, etc.)

## Tech Stack

**Frontend:** React 18 + Vite, React Router, Tailwind CSS
**Backend:** Express.js, PostgreSQL, Passport JWT auth
**Deployment:** Docker Compose with Nginx

## First Time Setup

The app needs an admin to invite users (security first):

```bash
# 1. Start the app
docker compose up -d

# 2. Create your first admin user in the database
docker exec -it inventory_db psql -U postgres inventory_db

# In the psql shell:
INSERT INTO users (email, password_hash, email_verified, role)
VALUES ('admin@example.com',
        '$2b$10$your_bcrypt_hash_here',
        true,
        'admin');

# Generate a password hash first:
# node -e "console.log(require('bcrypt').hashSync('your_password', 10))"
```

Once you have an admin account, log in and use the User Management page to invite others.

## Environment Variables

Create a `.env` file:

```bash
# Database
SQL_SERVER_IP=db
SQL_SERVER_PORT=5432
SQL_USER=postgres
SQL_DB=inventory_db
SQL_PASS=changeme

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_random_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (optional - uses console logs in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:8080

# Optional
OPENAI_API_KEY=sk-...  # For coin value estimates
```

## Project Layout

```
StuckOnInventory/
├── inventoryFrontend/    # React app
│   ├── src/
│   │   ├── components/   # Coins, comics, relics, etc.
│   │   ├── pages/        # Home, Admin
│   │   └── api/          # API client
│   └── container/        # Nginx config
├── inventoryBackend/     # Express API
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, rate limiting
│   └── uploads/          # Image storage
├── database/             # Schema + seed data
│   ├── database.js
│   ├── migrations/
│   ├── mints.json
│   └── cointypes.json
└── docker-compose.yml
```

## How It Works

**Authentication Flow:**
1. Admin invites you via email with a special link
2. Click link, set your password
3. Login gets you two JWT tokens
4. Access token (15 min) for API calls
5. Refresh token (7 days) to get new access tokens
6. Frontend handles refresh automatically

**User Roles:**
- `user` - Can manage their inventory
- `admin` - Can also manage users, invites, and reference data (coin types, mints, publishers)

**API Endpoints:**
- `/api/auth/*` - Login, register (via invite), password reset
- `/api/users/*` - User management (admin only)
- `/api/invites/*` - Send invites (admin only)
- `/api/coins/*` - CRUD operations (all authenticated users)
- `/api/comics/*`, `/api/relics/*`, etc.

## Development

**Run without Docker:**

Backend:
```bash
cd inventoryBackend
npm install
# Update .env: SQL_SERVER_IP=localhost
npm start  # Port 5081
```

Frontend:
```bash
cd inventoryFrontend
npm install
# Update .env: VITE_ENV_URL=http://localhost:5081
npm run dev  # Port 5173
```

**Add a New Collection Type:**

Copy the pattern from existing types (relics is simplest):
1. Database table in `database/database.js`
2. Backend route in `inventoryBackend/routes/`
3. Register route in `index.js`
4. Frontend components in `src/components/yourtypes/`
5. Add to menu in `WaffleMenu.jsx`

Each collection has 9 components: List, Table, Card, SingleCard, Create, Show, Edit, Delete, Modal.

## Common Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after code changes
docker compose build backend
docker compose up -d backend

# Reset everything
docker compose down -v

# Backup database
docker exec -t inventory_db pg_dump -U postgres inventory_db > backup.sql

# Restore database
docker exec -i inventory_db psql -U postgres inventory_db < backup.sql

# Backup images
tar -czf images.tar.gz inventoryBackend/uploads/
```

## Troubleshooting

**"JwtStrategy requires a secret or key"**
- Set `JWT_SECRET` in `.env`
- Restart: `docker compose restart backend`

**Can't log in - "Email not verified"**
- Check backend logs: `docker logs inventory_backend | grep verify`
- Or use forgot password flow

**401 errors**
- Token expired (15 min) - should auto-refresh
- Clear localStorage and login again

**Port conflicts**
- Change ports in `docker-compose.yml`
- Frontend: 8080 → your choice
- Backend: 5081 → your choice

## Notes

- Email verification links expire after 24 hours
- Password reset links expire after 1 hour
- Rate limits: 5 login attempts per 15 min, 3 password resets per hour
- Images max 10MB each, HEIC/HEIF converts to JPEG
- Reference data (mints, coin types) seeds from JSON files on startup

## License

MIT - do what you want with it.
