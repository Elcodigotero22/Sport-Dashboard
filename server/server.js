import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const logDir = path.join(__dirname, 'logs');
fs.mkdirSync(logDir, { recursive: true });
const traceFile = path.join(logDir, 'http_trace.jsonl');

const logRequest = (entry) => {
    fs.appendFileSync(traceFile, JSON.stringify(entry) + '\n');
};

// Ruta proxy para API Sports
app.get('/api/proxy', async (req, res) => {
    const { endpoint, league, season } = req.query;
    const validEndpoints = ['standings', 'fixtures', 'teams'];

    if (!validEndpoints.includes(endpoint)) {
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    const start = Date.now();
    try {
        const baseUrl = 'https://v3.football.api-sports.io';
        const url = `${baseUrl}/${endpoint}?league=${league}&season=${season}`;

        const r = await fetch(url, {
            headers: {
                'x-rapidapi-key': process.env.API_SPORTS_KEY || '',
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        if (r.ok) {
            const data = await r.json();

            // Registrar la solicitud
            const logEntry = {
                ts: new Date().toISOString(),
                method: 'GET',
                url: url,
                status: r.status,
                duration_ms: Date.now() - start,
                endpoint: endpoint,
                league: league || 'none',
                season: season || 'none'
            };

            logRequest(logEntry);
            res.json(data);
        } else {
            throw new Error(`API error: ${r.status}`);
        }
    } catch (error) {
        const logEntry = {
            ts: new Date().toISOString(),
            method: 'GET',
            url: url,
            error: error.message,
            duration_ms: Date.now() - start,
            endpoint: endpoint,
            league: league || 'none',
            season: season || 'none'
        };

        logRequest(logEntry);

        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Failed to fetch data',
            message: error.message
        });
    }
});

// Mock 
app.get('/api/mock/:endpoint', (req, res) => {
    const { endpoint } = req.params;
    const mockData = {
        fixtures: [],
        standings: [],
        players: [],
        teams: []
    };

    if (mockData[endpoint]) {
        res.json(mockData[endpoint]);
    } else {
        res.status(404).json({ error: 'Mock endpoint not found' });
    }
});

// Verificacion de conexion
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});