import "dotenv/config";
import pg from 'pg'
import { sqlIp , sqlDb, sqlPass, sqlUser, sqlPort } from './config-db.js';

const { Pool } = pg;

export const pool = new Pool({
    user: sqlUser,
    host: sqlIp,
    database: sqlDb,
    password: sqlPass,
    port: sqlPort,
});

// Database initialization is now handled by the migration system
// Run migrations using: npm run migrate
// Check migration status: npm run migrate:status
