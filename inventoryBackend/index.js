import "dotenv/config";
import { PORT } from './config.js';
import express from 'express';
import coinRoute from './routes/coinRoute.js';
import mintRoute from './routes/mintRoute.js';
import coinTypeRoute from './routes/coinTypeRoute.js';
import relicRoute from './routes/relicRoute.js';
import stampRoute from './routes/stampRoute.js';
import bunnykinRoute from './routes/bunnykinRoute.js';
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

// OpenAI key presence check (no value logged)
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. /api/coins/estimate will return 500.");
}

// Serve uploaded images statically
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Unified API prefix
app.post('/api/login', (req, res) => {
  res.send({
    token: 'test123'
  });
});

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

// Stamps endpoints under /api
app.use('/api/stamps', stampRoute);

// Bunnykins endpoints under /api
app.use('/api/bunnykins', bunnykinRoute);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});
