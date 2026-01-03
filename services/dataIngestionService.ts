
import { TrafficLog } from '../types';
import { generateTraffic } from './trafficSimulator';

/**
 * Service to handle real-world data ingestion.
 * In a production Vercel deployment, this would point to a secure 
 * Log Aggregator or a real-time WAF API.
 */
export async function fetchLiveLogs(endpoint?: string): Promise<TrafficLog[]> {
  if (!endpoint) {
    // Return a batch of simulated traffic for demo stability
    return Array.from({ length: 5 }, () => generateTraffic());
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('WAF Endpoint unreachable');
    
    const data = await response.json();
    // Assuming the WAF returns an array of log objects
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Data Ingestion Error:', error);
    return [];
  }
}

export function parseUploadedLogs(jsonString: string): TrafficLog[] {
  try {
    const data = JSON.parse(jsonString);
    return Array.isArray(data) ? data : [data];
  } catch (e) {
    throw new Error('Invalid JSON format for log ingestion');
  }
}
