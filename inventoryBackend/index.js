import { PORT } from './config.js';
import express from 'express';
import passport from 'passport';
import authRoute from './routes/authRoute.js';
import inviteRoute from './routes/inviteRoute.js';
import userRoute from './routes/userRoute.js';
import dynamicEntityRoute from './routes/dynamicEntityRoute.js';
import tableManagementRoute from './routes/tableManagementRoute.js';
import configurePassport from './config/passport.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(process.env.NODE_ENV);

const app = express();

// Trust proxy - required for rate limiting and IP detection behind reverse proxy
app.set('trust proxy', 1);

// middleware for parsing request body
app.use(express.json());

// middleware for handling CORS policy
app.use(cors());

// Initialize Passport for JWT authentication
configurePassport(passport);
app.use(passport.initialize());

// Apply general rate limiter to all routes
app.use(generalLimiter);

// OpenAI key presence check (no value logged)
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. AI estimation features will not be available.");
}

// Serve uploaded images statically
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Authentication endpoints under /api/auth
app.use('/api/auth', authRoute);

// Invite endpoints under /api/invites
app.use('/api/invites', inviteRoute);

// User management endpoints under /api/users
app.use('/api/users', userRoute);

// Table management endpoints (new dynamic system)
app.use('/api/tables', tableManagementRoute);

// Dynamic entity CRUD endpoints (new dynamic system)
app.use('/api/entities', dynamicEntityRoute);

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('StuckOnInventory backend server');
});

app.get('/api/health', (request, response) => {
  console.log('Health Check');
  return response.status(200).send('StuckOnInventory backend server online');
});

// Handle 404 errors for undefined routes (must come AFTER all routes)
app.use(notFoundHandler);

// Global error handler (must be LAST middleware)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Inventory Backend listening on port ${PORT}`)
});
