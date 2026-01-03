
import { GoogleGenAI, Type } from "@google/genai";
import { TrafficLog, AnomalyInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAnomaly(log: TrafficLog): Promise<AnomalyInsight> {
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
    // Fix: Using gemini-3-pro-preview as this task involves complex reasoning and rule generation (coding)
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING, description: "Detailed explanation of the anomaly behavior." },
            suggestedRule: { type: Type.STRING, description: "WAF rule syntax for mitigation." },
            confidence: { type: Type.NUMBER, description: "Probability score (0-1)." },
            // Added reasoningVector to match the AnomalyInsight type definition
            reasoningVector: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key behavioral features triggered."
            }
          },
          required: ["explanation", "suggestedRule", "confidence", "reasoningVector"]
        }
      }
    });

    // Fix: Using response.text (property) and trimming before parsing JSON
    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    return {
      explanation: result.explanation || "No explanation provided.",
      suggestedRule: result.suggestedRule || "",
      confidence: result.confidence || 0,
      reasoningVector: result.reasoningVector || []
    };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fix: Ensure fallback object includes reasoningVector to satisfy AnomalyInsight interface
    return {
      explanation: "Failed to generate real-time insight. Behavior indicates potential injection or pattern mismatch.",
      suggestedRule: "SecRule REQUEST_URI \"@contains " + log.path + "\" \"id:1001,phase:1,deny,status:403\"",
      confidence: 0.5,
      reasoningVector: ["Fallback triggered", "Analysis error"]
    };
  }
}
