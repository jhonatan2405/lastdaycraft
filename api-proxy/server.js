/*
Simple Express proxy for Exaroton API.
- Keeps your EXAROTON_TOKEN in environment variables (never push to repo)
- Provides a `/api` prefix for the client to call.

Security notes:
- For admin actions (start/stop/command), the proxy checks for a custom PROXY_KEY header.
- Run this as a small server on the same host as your website (or CORS-allowed host).
*/

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const EXAROTON_BASE = 'https://api.exaroton.com/v1';
const TOKEN = process.env.EXAROTON_TOKEN;
const PROXY_KEY = process.env.PROXY_KEY || '';

if (!TOKEN) {
  console.error('Missing EXAROTON_TOKEN in environment. Set it in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

async function forward(req, res, path, options={}){
  const method = options.method || 'GET';
  const body = options.body || null;
  const r = await fetch(`${EXAROTON_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await r.text();
  // if JSON
  try{ const json = JSON.parse(text); return res.status(r.status).json(json); }
  catch(_) { return res.status(r.status).send(text); }
}

// Public: GET server object
app.get('/api/servers/:id', async (req, res) => {
  const { id } = req.params;
  await forward(req, res, `/servers/${encodeURIComponent(id)}`);
});

// Public: GET logs tail
app.get('/api/servers/:id/logs', async (req, res) => {
  const { id } = req.params;
  const tail = req.query.tail || 80;
  await forward(req, res, `/servers/${encodeURIComponent(id)}/logs?tail=${encodeURIComponent(tail)}`);
});

// Public: GET RAM option
app.get('/api/servers/:id/options/ram', async (req, res) => {
  const { id } = req.params;
  await forward(req, res, `/servers/${encodeURIComponent(id)}/options/ram/`);
});

// Admin: start server (requires PROXY_KEY header)
app.post('/api/servers/:id/start', async (req, res) => {
  if (!req.headers['x-proxy-key'] || req.headers['x-proxy-key'] !== PROXY_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  await forward(req, res, `/servers/${encodeURIComponent(id)}/start/`, { method: 'POST' });
});

// Admin: stop server
app.post('/api/servers/:id/stop', async (req, res) => {
  if (!req.headers['x-proxy-key'] || req.headers['x-proxy-key'] !== PROXY_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  await forward(req, res, `/servers/${encodeURIComponent(id)}/stop/`, { method: 'POST' });
});

// Admin: restart server
app.post('/api/servers/:id/restart', async (req, res) => {
  if (!req.headers['x-proxy-key'] || req.headers['x-proxy-key'] !== PROXY_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  await forward(req, res, `/servers/${encodeURIComponent(id)}/restart/`, { method: 'POST' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Exaroton proxy listening on ${PORT}`));
