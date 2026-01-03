
# Swavlamban Sentinel: ML-Enabled Network Anomaly Detection

**Challenge #3: Development of a Machine Learning Enabled Network Anomaly Detection Module**

## 🚀 Deployment Overview
This module is designed for real-time network traffic inspection, behavioral baselining, and automated WAF rule generation. It utilizes **Gemini 3 Pro** for high-fidelity explainable AI insights.

### Build & Run
1. **Environment**: Add `API_KEY` (Google AI Studio) to your Vercel Environment Variables.
2. **Install**: `npm install`
3. **Run**: `npm run dev`
4. **Build**: `npm run build`

## 🛠 Features
- **Real-time Ingestion**: Polls external WAF endpoints or accepts manual JSON log imports.
- **Behavioral Baselining**: Learns 'Normal' traffic patterns to identify Zero-Day deviations.
- **Explainable AI (XAI)**: Provides human-readable reasoning for every detection.
- **Automated Mitigation**: Generates ModSecurity/AWS WAF compatible rules.

## 📁 Directory Structure
- `components/`: UI Modules (Dashboard, Metrics, Analyzers)
- `services/`: Core logic (ML Interface, Traffic Simulator, API Ingestion)
- `types.ts`: TypeScript interfaces for security data models.
