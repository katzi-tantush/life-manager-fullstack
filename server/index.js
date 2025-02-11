import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import driveRouter from './routes/drive.js';
import processRouter from './routes/process.js';
import sheetsRouter from './routes/sheets.js';
import { validateAllConfigs } from './config/index.js';
import { sessionMiddleware } from './middleware/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate all configurations
validateAllConfigs();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// API Routes
app.use('/api/drive', sessionMiddleware, driveRouter);
app.use('/api/process', sessionMiddleware, processRouter);
app.use('/api/sheets', sessionMiddleware, sheetsRouter);

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});