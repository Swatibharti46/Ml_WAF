import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Traffic Engine State ---
let logs = [];
const IP_POOL = ['192.168.1.45', '10.0.0.12', '172.16.254.1', '203.0.113.5', '8.8.8.8'];
const PATHS = ['/api/v1/user', '/login', '/products', '/search', '/checkout', '/admin/config'];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

function createPacket() {
  const isThreat = Math.random() > 0.85;
  const id = "TX-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = new Date().toISOString();
  
  let type = 'LEGITIMATE';
  let severity = 'LOW';
  let payload = '';
  let score = Math.random() * 0.25;

  if (isThreat) {
    const scenario = Math.random();
    if (scenario < 0.25) {
      type = 'ANOMALY';
      payload = "SELECT * FROM users WHERE '1'='1' --";
      severity = 'HIGH';
      score = 0.85 + Math.random() * 0.1;
    } else if (scenario < 0.5) {
      type = 'API_ABUSE';
      payload = "Iterative ID scanning pattern detected (Broken Object Level Authorization attempt)";
      severity = 'MEDIUM';
      score = 0.7 + Math.random() * 0.1;
    } else if (scenario < 0.75) {
      type = 'BOT';
      payload = "Headless browser signature identified via TLS fingerprinting";
      severity = 'HIGH';
      score = 0.8 + Math.random() * 0.1;
    } else {
      type = 'ZERO_DAY';
      payload = "\\x90\\x90\\x90\\xEB\\x04... heap overflow vector identified";
      severity = 'CRITICAL';
      score = 0.95 + Math.random() * 0.04;
    }
  }

  return {
    id,
    timestamp,
    sourceIp: IP_POOL[Math.floor(Math.random() * IP_POOL.length)],
    method: METHODS[Math.floor(Math.random() * METHODS.length)],
    path: PATHS[Math.floor(Math.random() * PATHS.length)],
    userAgent: 'Sentinel-Sensor/v2.1',
    payload: payload || 'Encrypted TLS Payload [SHA-256 Verified]',
    responseTime: Math.floor(Math.random() * 30) + (isThreat ? 120 : 0),
    status: isThreat ? 403 : 200,
    type,
    severity,
    score,
    isEncrypted: true
  };
}

// Populate initial logs so the dashboard isn't empty
for (let i = 0; i < 30; i++) {
  logs.push(createPacket());
}
// Sort by time initially
logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Background simulation to keep the feed moving
setInterval(() => {
  const log = createPacket();
  logs = [log, ...logs].slice(0, 50);
}, 3000);

// --- API Endpoints ---

// Get all recent logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Provide manual feedback (Confirm/False Positive)
app.patch('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const logIndex = logs.findIndex(l => l.id === id);
  if (logIndex !== -1) {
    logs[logIndex].feedback = feedback;
    return res.json(logs[logIndex]);
  }
  res.status(404).json({ error: 'Packet record not found' });
});

// Deep Forensic Analysis via Gemini
app.post('/api/analyze/:id', async (req, res) => {
  const { id } = req.params;
  const log = logs.find(l => l.id === id);
  if (!log) return res.status(404).json({ error: 'Packet context lost' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `ACT AS A SENIOR SECURITY ANALYST. Perform deep forensic analysis on this network packet log: ${JSON.stringify(log)}. Identify the specific attack vector, its CVE relevance if applicable, and provide a precise ModSecurity SecRule to block it. Output in JSON format only.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            suggestedRule: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoningVector: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["explanation", "suggestedRule", "confidence", "reasoningVector"]
        }
      }
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Gemini Forensics Error:", error);
    res.status(500).json({ error: 'ML Forensics engine offline' });
  }
});

// --- Production Serving ---
// Serve static files from the 'dist' directory after the Vite build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For SPA support: redirect all unknown routes to index.html
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Sentinel WAF Node active on port ${PORT}`);
  console.log(`📡 Simulation Active: ${logs.length} initial packets loaded`);
  console.log(`🔧 API endpoints ready at http://localhost:${PORT}/api/logs\n`);
});