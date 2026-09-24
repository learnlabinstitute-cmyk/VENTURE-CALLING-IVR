import { GoogleGenAI, Modality } from "@google/genai";
import { fetchNeuralTTSAudio } from "../src/utils/executiveEngine";

function isValidGeminiApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed.startsWith("AQ.") ||
    !trimmed.startsWith("AIza")
  ) {
    return false;
  }
  return true;
}

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isValidGeminiApiKey(apiKey)) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey!.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { text, voice = "Kore", systemInstruction } = body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    // Attempt Gemini TTS first if available
    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `Say warmly and clearly as customer care executive Isha: ${text}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || "Kore" },
              },
            },
            systemInstruction:
              systemInstruction ||
              "You are Isha, senior customer care executive at Venture Infotech Support 24. Speak warmly in polite, calm Hindi/Hinglish.",
          },
        });

        const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioBase64) {
          return res.status(200).json({ audio: audioBase64, data: audioBase64 });
        }
      } catch {
        // Fallback to natural neural audio
      }
    }

    // Natural Neural Audio Generation (Authentic Indian Hindi/English voice)
    const neuralAudioBase64 = await fetchNeuralTTSAudio(text, "hi");
    return res.status(200).json({ audio: neuralAudioBase64, data: neuralAudioBase64 });
  } catch (err: any) {
    console.error("Vercel TTS Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate speech",
    });
  }
}
