
import { TrafficLog, TrafficType, ThreatSeverity } from '../types';

const IP_POOL = ['192.168.1.45', '10.0.0.12', '172.16.254.1', '203.0.113.5', '8.8.8.8'];
const PATHS = ['/api/v1/user', '/login', '/products', '/search', '/checkout', '/admin/config'];
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'PostmanRuntime/7.29.2',
  'python-requests/2.28.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
];

export function generateTraffic(): TrafficLog {
  const randType = Math.random();
  const id = Math.random().toString(36).substring(2, 11);
  const timestamp = new Date().toISOString();
  const sourceIp = IP_POOL[Math.floor(Math.random() * IP_POOL.length)];
  const method = (['GET', 'POST', 'PUT', 'DELETE'] as const)[Math.floor(Math.random() * 4)];
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  let type = TrafficType.LEGITIMATE;
  let severity = ThreatSeverity.LOW;
  let payload = '';
  let score = Math.random() * 0.25;
  const isEncrypted = true;
  const decryptedAt = new Date().toISOString();

  // Challenge Scenarios Implementation
  if (randType > 0.85) {
    const scenario = Math.random();
    if (scenario < 0.25) { // SQLi / Anomaly
      type = TrafficType.ANOMALY;
      payload = "SELECT * FROM users WHERE id=1 OR 1=1;--";
      severity = ThreatSeverity.HIGH;
      score = 0.82 + Math.random() * 0.15;
    } else if (scenario < 0.50) { // API Abuse (Objective 4.4)
      type = TrafficType.API_ABUSE;
      payload = "Rate limit deviation: 500 req/sec";
      severity = ThreatSeverity.MEDIUM;
      score = 0.65 + Math.random() * 0.1;
    } else if (scenario < 0.75) { // Bot Traffic (Objective 4.4)
      type = TrafficType.BOT;
      payload = "Automated credential stuffing pattern";
      severity = ThreatSeverity.HIGH;
      score = 0.75 + Math.random() * 0.15;
    } else { // Zero-Day (Objective 4.3)
      type = TrafficType.ZERO_DAY;
      payload = "\x41\x41\x41\x41 buffer overflow pattern";
      severity = ThreatSeverity.CRITICAL;
      score = 0.94 + Math.random() * 0.05;
    }
  }

  return {
    id,
    timestamp,
    sourceIp,
    method,
    path,
    userAgent,
    payload,
    responseTime: Math.floor(Math.random() * 50) + (randType > 0.85 ? 120 : 0),
    status: randType > 0.85 ? (Math.random() > 0.3 ? 403 : 200) : 200,
    type,
    severity,
    score,
    isEncrypted,
    decryptedAt
  };
}
