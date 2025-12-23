# Stuck On Inventory

A comprehensive full-stack inventory management system for collectables including coins, comic books, Native American relics, stamps, and Bunnykins figurines. This repository contains a React frontend (Vite + Nginx), a Node/Express backend, and a PostgreSQL database sharing a single Docker Compose file that runs all three services together.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [User Guide](#user-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

Stuck On Inventory is a modern web application designed to help collectors catalog, manage, and track their valuable collectables. The system provides a unified interface for managing multiple collection types with features like image uploads (including HEIC/HEIF support), advanced search, detailed record keeping, and responsive design for mobile and desktop use.

## Features

### For End Users

**Multi-Collection Management**
- Coins - Track mint locations, years, grades, circulation types, and face values
- Comic Books - Manage titles, publishers, issue numbers, CGC grades, and variants
- Native American Relics - Catalog artifacts with origin, era, and condition data
- Stamps - Organize by country, denomination, issue year, and condition
- Bunnykins - Track Royal Doulton figurines with series and production years

**Core Functionality**
- ✅ Full CRUD operations (Create, Read, Update, Delete) for all collection types
- ✅ Upload up to 3 images per item with HEIC/HEIF auto-conversion
- ✅ Table and card view toggle for different browsing preferences
- ✅ Modal-based detail and edit views for quick access
- ✅ Responsive design - works seamlessly on mobile, tablet, and desktop
- ✅ Dark/light theme toggle
- ✅ Real-time notifications for user actions
- ✅ Authentication and session management

**Advanced Features**
- AI-powered coin value estimation (OpenAI integration)
- Image management with preview, upload, and delete capabilities
- Date tracking for when items were added to inventory
- Flexible description fields for detailed notes
- Admin panel for managing reference data (mint locations, coin types)

### For Developers

**Modern Tech Stack**
- React 18+ with Vite for fast development
- React Router for client-side routing
- Tailwind CSS for responsive styling
- Express.js backend with clean REST API architecture
- PostgreSQL database with automatic schema initialization
- Docker Compose for one-command deployment

**Developer Experience**
- Hot module replacement in development
- Clean, modular component architecture
- Consistent patterns across all collection types
- Comprehensive error handling
- Environment-based configuration
- Database migrations on startup

## Tech Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + custom CSS variables
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios with interceptors
- **Icons**: React Icons (Game Icons, Material Design, etc.)
- **Notifications**: Notistack
- **Image Processing**: heic2any for HEIC/HEIF conversion
- **Date Handling**: Moment.js
- **Production Server**: Nginx

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 13+
- **ORM**: pg (node-postgres)
- **File Upload**: Multer
- **Authentication**: JWT-based token system
- **Environment**: dotenv for configuration

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Database Persistence**: Volume mounting
- **Image Storage**: Local filesystem with configurable path

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 2GB+ RAM available
- Ports 8080, 5081, and 5432 available

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd StuckOnInventory

# 2. Set up environment variables
cp .env.example .env

# 3. Build and start all services
docker compose build
docker compose up -d

# 4. Verify backend is running
curl http://localhost:5081/api/health

# 5. Open the application
open http://localhost:8080
```

The application will be available at **http://localhost:8080**

### Default Login
```
Username: admin
Password: test123
```
*(Note: This is a demo token system - update for production use)*

## Project Structure

```
StuckOnInventory/
├── inventoryFrontend/          # React frontend application
│   ├── src/
│   │   ├── components/         # React components organized by feature
│   │   │   ├── coins/         # Coin-specific components
│   │   │   ├── comics/        # Comic book components
│   │   │   ├── relics/        # Native American relic components
│   │   │   ├── stamps/        # Stamp components
│   │   │   ├── bunnykins/     # Bunnykins figurine components
│   │   │   ├── cointypes/     # Coin type reference data
│   │   │   ├── mints/         # Mint location reference data
│   │   │   ├── comicpublishers/ # Comic publisher reference data
│   │   │   └── relictypes/    # Relic type reference data
│   │   ├── pages/             # Top-level pages (Home, Admin)
│   │   ├── api/               # API client configuration
│   │   ├── auth/              # Authentication components
│   │   └── App.jsx            # Main application component with routing
│   ├── container/etc/nginx/   # Nginx configuration
│   └── package.json
│
├── inventoryBackend/           # Express.js backend
│   ├── routes/                # API route handlers
│   │   ├── coinRoute.js
│   │   ├── comicRoute.js
│   │   ├── relicRoute.js
│   │   ├── stampRoute.js
│   │   ├── bunnykinRoute.js
│   │   ├── mintRoute.js
│   │   ├── coinTypeRoute.js
│   │   ├── comicPublisherRoute.js
│   │   └── relicTypeRoute.js
│   ├── uploads/               # Image storage directory
│   └── index.js               # Express server entry point
│
├── database/                   # Database initialization and seed data
│   ├── database.js            # Schema creation and data seeding
│   ├── config-db.js           # Database configuration
│   ├── mints.json             # US Mint locations (authoritative)
│   └── cointypes.json         # US coin types with face values
│
├── data/postgres/              # PostgreSQL data persistence (created on first run)
├── docker-compose.yml          # Docker orchestration
├── .env.example               # Environment variable template
└── README.md
```

## Development

### Local Development (Outside Docker)

**Backend Setup:**
```bash
cd inventoryBackend
npm install

# Update .env to use localhost for database
# SQL_SERVER_IP=localhost

npm start  # Runs on port 5081
```

**Frontend Setup:**
```bash
cd inventoryFrontend
npm install

# Update .env to point to local backend
# VITE_ENV_URL=http://localhost:5081

npm run dev  # Runs on port 5173 (Vite default)
```

### Adding a New Collectable Type

The codebase follows consistent patterns. To add a new collectable:

1. **Database** - Add table creation in `database/database.js`:
```javascript
async function createNewTypeTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS newtypes (
      id SERIAL PRIMARY KEY,
      field1 VARCHAR(255) NOT NULL,
      field2 VARCHAR(255) NOT NULL,
      // ... custom fields
      description TEXT,
      image1 VARCHAR(500),
      image2 VARCHAR(500),
      image3 VARCHAR(500),
      added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}
```

2. **Backend Route** - Create `inventoryBackend/routes/newtypeRoute.js` (copy from `relicRoute.js` or `comicRoute.js`)

3. **Register Route** - Add to `inventoryBackend/index.js`:
```javascript
import newtypeRoute from './routes/newtypeRoute.js';
app.use('/api/newtypes', newtypeRoute);
```

4. **Frontend Components** - Create 9 components in `inventoryFrontend/src/components/newtypes/`:
   - `NewTypesList.jsx`
   - `CreateNewTypes.jsx`
   - `NewTypesTable.jsx`
   - `NewTypesCard.jsx`
   - `NewTypeSingleCard.jsx`
   - `NewTypeModal.jsx`
   - `ShowNewType.jsx`
   - `EditNewType.jsx`
   - `DeleteNewType.jsx`

5. **Routing** - Add routes to `App.jsx` and menu item to `WaffleMenu.jsx`

### Environment Variables

**Backend (.env)**
```bash
NODE_ENV=development
APP_PORT=5081

# Database (use 'db' for Docker, 'localhost' for local dev)
SQL_SERVER_IP=db
SQL_SERVER_PORT=5432
SQL_USER=postgres
SQL_DB=inventory_db
SQL_PASS=your_secure_password

# Optional: OpenAI API for coin value estimation
OPENAI_API_KEY=your_openai_key

# Optional: Custom upload directory
UPLOAD_DIR=/app/uploads
```

**Frontend (.env)**
```bash
# Backend API URL (use localhost:5081 for Docker)
VITE_ENV_URL=http://localhost:5081

# Frontend port (for Vite dev server)
FRONTEND_PORT=5173
```

## User Guide

### Getting Started

1. **Login** - Access the application at http://localhost:8080 and log in
2. **Navigate** - Use the waffle menu (grid icon) to access different collection types
3. **View Collections** - Toggle between table and card views using the view switcher

### Managing Your Inventory

**Adding Items**
1. Navigate to the collection type (e.g., Comics, Coins)
2. Click the "+" icon in the top right
3. Fill in the required fields (marked with *)
4. Optionally upload up to 3 images
5. Click "Save"

**Viewing Details**
- Click the info icon (ⓘ) in the table/card to see full details
- Images can be clicked to view full size in a new tab

**Editing Items**
1. Click the edit icon (✎) on any item
2. Modify fields as needed
3. Manage images (upload new, delete existing)
4. Click "Save Changes"

**Deleting Items**
1. Click the delete icon (🗑) on any item
2. Confirm the deletion (this cannot be undone)

### Special Features

**Coin Value Estimation**
- For coins only: Click the "AI Estimate" button
- The system uses OpenAI to estimate current market value
- Estimates are based on type, year, mint, grade, and condition

**Image Upload**
- Supports JPEG, PNG, GIF, HEIC, and HEIF formats
- Maximum 10MB per image
- HEIC/HEIF images are automatically converted for web display
- Up to 3 images per item

**Theme Toggle**
- Click the theme icon in the header to switch between light and dark modes
- Preference is saved to your browser

## API Documentation

### Base URL
```
http://localhost:5081/api
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Common Endpoints Pattern

Each collection type follows the same REST API pattern:

**List All Items**
```http
GET /api/{collection}/
Response: { data: [...items] }
```

**Get Single Item**
```http
GET /api/{collection}/:id
Response: { ...item }
```

**Create Item**
```http
POST /api/{collection}/
Body: { field1: value1, field2: value2, ... }
Response: { message: "...", {collection}Id: id }
```

**Update Item**
```http
PUT /api/{collection}/:id
Body: { field1: newValue, ... }
Response: { ...updatedItem }
```

**Delete Item**
```http
DELETE /api/{collection}/:id
Response: { ...deletedItem }
```

**Upload Images**
```http
POST /api/{collection}/upload/:id
Content-Type: multipart/form-data
Body: images[] (up to 3 files)
Response: { ...updatedItem }
```

**Delete Specific Image**
```http
DELETE /api/{collection}/image/:id/:slot
Params: slot = 'image1' | 'image2' | 'image3'
Response: { ...updatedItem }
```

### Collection Types
- `/api/coins`
- `/api/comics`
- `/api/relics`
- `/api/stamps`
- `/api/bunnykins`
- `/api/mintlocations` (reference data)
- `/api/cointypes` (reference data)

### Special Endpoints

**Health Check**
```http
GET /api/health
Response: "coinList backend server online"
```

**Login**
```http
POST /api/login
Response: { token: "test123" }
```

**Coin Value Estimation**
```http
POST /api/coins/estimate
Body: { type, mintlocation, mintyear, grade, circulation }
Response: { estimatedValue: number }
```

## Database Schema

### Common Fields (All Tables)
- `id` - SERIAL PRIMARY KEY
- `image1`, `image2`, `image3` - VARCHAR(500) - Image paths
- `added_date` - TIMESTAMPTZ - Creation timestamp

### Coins Table
```sql
CREATE TABLE coins (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  mintlocation VARCHAR(255) NOT NULL,
  mintyear DATE NOT NULL,
  circulation VARCHAR(255) NOT NULL,
  grade VARCHAR(255) NOT NULL,
  face_value DECIMAL(10,2),
  estimated_value DECIMAL(10,2),
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500),
  added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Comics Table
```sql
CREATE TABLE comics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  issuenumber VARCHAR(100) NOT NULL,
  publicationyear VARCHAR(100) NOT NULL,
  grade VARCHAR(100) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  variant VARCHAR(255),
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500),
  added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Relics Table
```sql
CREATE TABLE relics (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  era VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500)
);
```

### Stamps Table
```sql
CREATE TABLE stamps (
  id SERIAL PRIMARY KEY,
  country VARCHAR(255) NOT NULL,
  denomination VARCHAR(255) NOT NULL,
  issueyear VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500)
);
```

### Bunnykins Table
```sql
CREATE TABLE bunnykins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  productionyear VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500)
);
```

### Reference Tables

**Mint Locations** - Authoritative list seeded from `database/mints.json`
```sql
CREATE TABLE mintlocations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL
);
```

**Coin Types** - Authoritative list seeded from `database/cointypes.json`
```sql
CREATE TABLE cointypes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  face_value DECIMAL(10,2) NOT NULL
);
```

## Deployment

### Production Deployment

1. **Update Environment Variables**
```bash
# Set production values in .env
NODE_ENV=production
SQL_PASS=<strong_password>
OPENAI_API_KEY=<your_key>
```

2. **Build and Deploy**
```bash
docker compose build
docker compose up -d
```

3. **Verify Deployment**
```bash
# Check all services are running
docker compose ps

# Check backend health
curl http://localhost:5081/api/health

# Check logs
docker compose logs -f
```

### Managing Reference Data

**Mint Locations** - Edit `database/mints.json` and restart:
```bash
docker compose build backend
docker compose up -d backend
```

**Coin Types** - Edit `database/cointypes.json` and restart:
```bash
docker compose build backend
docker compose up -d backend
```

### Backup and Restore

**Backup Database**
```bash
docker exec -t db pg_dump -U postgres inventory_db > backup.sql
```

**Restore Database**
```bash
docker exec -i db psql -U postgres inventory_db < backup.sql
```

**Backup Images**
```bash
tar -czf images_backup.tar.gz inventoryBackend/uploads/
```

### Stopping and Cleaning

```bash
# Stop services (data persists)
docker compose down

# Stop and remove all data (clean slate)
docker compose down -v

# Remove only database volume
docker volume rm stuckoninventory_postgres_data
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :8080
lsof -i :5081

# Kill the process or change ports in .env
```

**Database Connection Failed**
- Ensure PostgreSQL container is running: `docker compose ps`
- Check credentials in `.env` match database configuration
- For local development, use `SQL_SERVER_IP=localhost`

**Images Not Uploading**
- Check `uploads/` directory permissions
- Verify `UPLOAD_DIR` environment variable
- Check file size (max 10MB per image)

**Frontend Can't Reach Backend**
- Verify `VITE_ENV_URL` in frontend `.env`
- Check backend is running: `curl http://localhost:5081/api/health`
- Ensure CORS is enabled in `inventoryBackend/index.js`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code patterns and naming conventions
4. Test thoroughly (all CRUD operations, image uploads, etc.)
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Use functional components with hooks
- Follow the existing component structure (9 components per collection type)
- Keep components focused and reusable
- Use consistent naming: `{Type}List`, `Create{Type}`, `Show{Type}`, etc.
- Add proper error handling and user feedback

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- React Icons for comprehensive icon library
- heic2any for HEIC/HEIF image conversion
- The open-source community for amazing tools and libraries

---

**Built with ❤️ for collectors, by collectors**
