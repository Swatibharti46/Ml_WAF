
import { GoogleGenAI, Type } from "@google/genai";
import { TrafficLog, AnomalyInsight } from "../types";

export async function analyzeAnomaly(log: TrafficLog): Promise<AnomalyInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this suspicious network traffic log and provide a security assessment.
  
  LOG DATA:
  Timestamp: ${log.timestamp}
  Source IP: ${log.sourceIp}
  Method: ${log.method}
  Path: ${log.path}
  User-Agent: ${log.userAgent}
  Payload: ${log.payload}
  ML Anomaly Score: ${log.score}
  
  Please provide:
  1. A clear explanation of why this is considered an anomaly (Explainable AI).
  2. A recommended ModSecurity WAF rule to block similar traffic.
  3. A confidence score for this analysis.
  4. A reasoning vector: a list of short descriptive strings representing behavioral features identified.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            suggestedRule: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoningVector: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            }
          },
          required: ["explanation", "suggestedRule", "confidence", "reasoningVector"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      explanation: result.explanation || "No explanation provided.",
      suggestedRule: result.suggestedRule || "",
      confidence: result.confidence || 0,
      reasoningVector: result.reasoningVector || []
    };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      explanation: "Analysis engine timed out or encountered an error. Heuristic behavior suggests potential automated probing.",
      suggestedRule: `SecRule REQUEST_URI "@contains ${log.path}" "id:1001,phase:1,deny,status:403"`,
      confidence: 0.5,
      reasoningVector: ["Fallback Mechanism", "Pattern Match Fail"]
    };
  }
}
