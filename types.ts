
export enum TrafficType {
  LEGITIMATE = 'LEGITIMATE',
  ANOMALY = 'ANOMALY',
  ZERO_DAY = 'ZERO_DAY',
  BOT = 'BOT',
  API_ABUSE = 'API_ABUSE'
}

export enum ThreatSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TrafficLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  userAgent: string;
  payload: string;
  responseTime: number;
  status: number;
  type: TrafficType;
  severity: ThreatSeverity;
  score: number; // 0 to 1 ML Anomaly Score
  isEncrypted: boolean; // For Challenge Objective 4.2
  decryptedAt?: string; // Simulation of TLS termination
  feedback?: 'CONFIRMED' | 'FALSE_POSITIVE'; // For Objective 3.5 & 5.1
}

export interface RecommendedRule {
  id: string;
  originalThreatId: string;
  name: string;
  description: string;
  ruleContent: string;
  status: 'PENDING' | 'APPROVED' | 'DEPLOYED';
}

export interface AnomalyInsight {
  explanation: string;
  suggestedRule: string;
  confidence: number;
  reasoningVector: string[]; // Key behavioral features triggered
}

export interface PerformanceMetrics {
  detectionAccuracy: number;
  falsePositiveRate: number;
  throughput: number;
  avgLatency: number;
}
