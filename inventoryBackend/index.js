import "dotenv/config";
import { PORT } from './config.js';
import express from 'express';
import passport from 'passport';
import coinRoute from './routes/coinRoute.js';
import mintRoute from './routes/mintRoute.js';
import coinTypeRoute from './routes/coinTypeRoute.js';
import relicRoute from './routes/relicRoute.js';
import relicTypeRoute from './routes/relicTypeRoute.js';
import stampRoute from './routes/stampRoute.js';
import bunnykinRoute from './routes/bunnykinRoute.js';
import comicRoute from './routes/comicRoute.js';
import comicPublisherRoute from './routes/comicPublisherRoute.js';
import authRoute from './routes/authRoute.js';
import inviteRoute from './routes/inviteRoute.js';
import userRoute from './routes/userRoute.js';
import configurePassport from './config/passport.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(process.env.NODE_ENV);

const app = express();

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
  console.warn("OPENAI_API_KEY is not set. /api/coins/estimate will return 500.");
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

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('coinList backend server');
});

app.get('/api/health', (request, response) => {
  console.log('Health Check');
  return response.status(200).send('coinList backend server online');
});

// Coins endpoints under /api
app.use('/api/coins', coinRoute);

// Mint locations endpoints under /api
app.use('/api/mintlocations', mintRoute);

// Coin types endpoints under /api
app.use('/api/cointypes', coinTypeRoute);

// Relics endpoints under /api
app.use('/api/relics', relicRoute);

// Relic types endpoints under /api
app.use('/api/relictypes', relicTypeRoute);

// Stamps endpoints under /api
app.use('/api/stamps', stampRoute);

// Bunnykins endpoints under /api
app.use('/api/bunnykins', bunnykinRoute);

// Comics endpoints under /api
app.use('/api/comics', comicRoute);

// Comic publishers endpoints under /api
app.use('/api/comicpublishers', comicPublisherRoute);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});
