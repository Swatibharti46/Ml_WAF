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

// --- Traffic Engine ---
let logs = [];
const IP_POOL = ['192.168.1.45', '10.0.0.12', '172.16.254.1', '203.0.113.5', '8.8.8.8'];
const PATHS = ['/api/v1/user', '/login', '/products', '/search', '/checkout', '/admin/config'];

function createPacket() {
  const isThreat = Math.random() > 0.85;
  const id = Math.random().toString(36).substring(2, 11).toUpperCase();
  const timestamp = new Date().toISOString();
  
  let type = 'LEGITIMATE';
  let severity = 'LOW';
  let payload = '';
  let score = Math.random() * 0.2;

  if (isThreat) {
    const scenario = Math.random();
    if (scenario < 0.25) {
      type = 'ANOMALY';
      payload = "SELECT * FROM users WHERE '1'='1'";
      severity = 'HIGH';
      score = 0.85 + Math.random() * 0.1;
    } else if (scenario < 0.5) {
      type = 'API_ABUSE';
      payload = "Suspicious iteration on /api/v1/user/100...101...102";
      severity = 'MEDIUM';
      score = 0.7 + Math.random() * 0.1;
    } else if (scenario < 0.75) {
      type = 'BOT';
      payload = "Automated scraping header detected";
      severity = 'HIGH';
      score = 0.8 + Math.random() * 0.1;
    } else {
      type = 'ZERO_DAY';
      payload = "\\x90\\x90\\x90 shellcode pattern identified";
      severity = 'CRITICAL';
      score = 0.95 + Math.random() * 0.04;
    }
  }

  return {
    id,
    timestamp,
    sourceIp: IP_POOL[Math.floor(Math.random() * IP_POOL.length)],
    method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
    path: PATHS[Math.floor(Math.random() * PATHS.length)],
    userAgent: 'Sentinel-Edge-Node/2.0',
    payload,
    responseTime: Math.floor(Math.random() * 40) + (isThreat ? 100 : 0),
    status: isThreat ? 403 : 200,
    type,
    severity,
    score,
    isEncrypted: true
  };
}

// Start simulation
setInterval(() => {
  const log = createPacket();
  logs = [log, ...logs].slice(0, 50);
}, 3000);

// --- API Routes ---
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

app.patch('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const logIndex = logs.findIndex(l => l.id === id);
  if (logIndex !== -1) {
    logs[logIndex].feedback = feedback;
    return res.json(logs[logIndex]);
  }
  res.status(404).json({ error: 'Log not found' });
});

app.post('/api/analyze/:id', async (req, res) => {
  const { id } = req.params;
  const log = logs.find(l => l.id === id);
  if (!log) return res.status(404).json({ error: 'Incident not found' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform security forensic analysis on this traffic log: ${JSON.stringify(log)}. Identify the attack vector and provide a ModSecurity rule to mitigate it.`,
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
    console.error("Gemini Server Error:", error);
    res.status(500).json({ error: 'Forensic engine failed' });
  }
});

// --- Deployment: Static Assets ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Sentinel] API/Server running on port ${PORT}`);
});