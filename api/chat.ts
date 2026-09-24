import { GoogleGenAI, Modality } from "@google/genai";
import { fetchNeuralTTSAudio, matchExecutiveResponse } from "../src/utils/executiveEngine";

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const DEFAULT_SYSTEM_INSTRUCTION = `You are Isha, senior customer care executive at Venture Infotech Solution Support 24 calling IVR line (1800-VI-247).
Tone: Calm, professional, highly reassuring, articulate Hindi/Hinglish.

MANDATORY RULES & EXECUTIVE SCRIPTS:
1. Police / Cyber / Legal Threat & Official Escalation Protocol:
   Jab bhi koi client Police, Legal, ya Cyber Cell ki dhamki deta hai, executive ko bolna hai:
   "Kisi bhi complaint ya issue ke liye aapko official escalation procedure follow karna hoga. Direct threats ya arbitrary steps legal & system policy ka breach hain. Agar policy breach hota hai, toh saari call recordings aur activity history relevant authorities ko legal proof ke roop mein submit kar di jayegi."

2. Anti-Harassment, Abusive Language & Call Recording:
   Yeh call quality aur training purposes ke liye record ki ja rahi hai. Kisi bhi tarah ki gaali-galoch, abusive words, ya misbehavior ki recording system dwara save hoti hai. Abuse repeat hone par ye recording breach evidence ke taur par submit kar di jayegi aur account suspend hoga.

3. Payment / Service Dispute Resolution (Email Routing):
   Agar client keh raha hai ki unhe bilkul service nahi mili ya payment fast resolve karwani hai, toh pehle unhe convince karo support executive se baat karke Backup Execution Plan lene ke liye. Agar client phir bhi nahi manta, toh unhe apna Payment Screenshot aur Query official email ID venture.infotech.digital@gmail.com par bhejne ko bolna hai.

4. Personal Ad Account vs Agency Account (Dedicated Technical Slot Booking + UltraViewer Remote Access):
   If client says: "Mujhe agency account nahi chahiye, mujhe mere khud ke account me ads run karwana hai. Aap kaise slot book karoge? UltraViewer se access loge kya?" or asks about running ads in their own account:
   "Bilkul Sir/Ma'am! AAP apne personal Facebook/Google Ad Account mein bhi ads run karwa sakte hain. Iska process bohot simple aur secure hai:
   1. Dedicated Technical Slot Booking:
      Sabse pehle main aapki request par hamaari Technical Setup Team ke saath aapka Dedicated Slot Book kar deti hoon. Slot timing fixed hoti hai taaki hamaara senior ad expert sirf aapke setup par hi focus kare.
   2. UltraViewer Access & Setup:
      Haan ji Sir/Ma'am, slot time par hamaare ad executive UltraViewer ke zariye aapke system ka remote access lenge. Sab kuch aapke laptop/computer screen ke saamne live hoga. Hamaara executive aapke samne aapke personal account mein ad manager, pixel, aur campaigns set up karega. Aap poori process live dekh sakte hain, isse aapki privacy aur account security 100% maintain rehti hai."

5. General Support:
   - Greeting: "Hello, welcome to Venture Infotech Solution! Main Isha baat kar rahi hoon. Aaj aapki kya madad kar sakti hoon, kindly batayein?"
   - Plan Verification: "Sabse pehle, main system me aapka plan verify kar leti hoon. Aapne hamaare Plans me se konsa package select kiya tha? Silver Plan, Gold Plan, ya Platinum Plan?"
   - Zero Sales: Meta Ad algorithm takes 48 hours testing window. Offer the Backup Execution Plan (winning products + tested creatives).
   - Conversational, natural, warm, empathetic delivery.`;

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
    const {
      message,
      audioBase64,
      audioMimeType,
      voice = "Kore",
      systemInstruction,
      history = [],
    } = body;

    const contentsParts: any[] = [];
    if (audioBase64) {
      contentsParts.push({
        inlineData: {
          data: audioBase64,
          mimeType: audioMimeType || "audio/webm",
        },
      });
    }
    if (message) {
      contentsParts.push({ text: message });
    }

    if (contentsParts.length === 0) {
      return res.status(400).json({ error: "Message or audio input required" });
    }

    const ai = getGenAI();
    let responseText = "";
    let ttsAudio: string | null = null;

    if (ai) {
      try {
        // Generate response text using gemini-3.8-flash
        const promptResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            ...history.map((h: any) => ({
              role: h.role,
              parts: [{ text: h.text }],
            })),
            {
              role: "user",
              parts: contentsParts,
            },
          ],
          config: {
            systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
          },
        });

        if (promptResponse.text) {
          responseText = promptResponse.text;
        }

        // Try Gemini TTS
        if (responseText) {
          const ttsResponse = await ai.models.generateContent({
            model: "gemini-3.8-flash-lite-tts",
            contents: [
              {
                parts: [
                  {
                    text: `Say warmly and clearly as customer care executive Isha: ${responseText}`,
                  },
                ],
              },
            ],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice || "Kore" },
                },
              },
            },
          });
          ttsAudio =
            ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        }
      } catch (geminiErr) {
        console.warn("Gemini chat/TTS warning, falling back to executive engine:", geminiErr);
      }
    }

    // If Gemini was unavailable or failed, use the official Executive SOP matcher
    if (!responseText) {
      responseText = matchExecutiveResponse(message || "");
    }

    // If TTS audio is still needed, generate natural neural audio
    if (!ttsAudio) {
      try {
        ttsAudio = await fetchNeuralTTSAudio(responseText, "hi");
      } catch (neuralErr) {
        console.warn("Neural audio generation warning:", neuralErr);
      }
    }

    return res.status(200).json({
      text: responseText,
      reply: responseText,
      audio: ttsAudio,
    });
  } catch (err: any) {
    console.error("Vercel chat error:", err);
    // Return an intelligent fallback response even on unexpected failure
    const fallbackText = "Namaste! Main Senior Executive Isha hoon. Venture Infotech Support 24 me aapka swagat hai. Main aapki kya madad kar sakti hoon?";
    let fallbackAudio = null;
    try {
      fallbackAudio = await fetchNeuralTTSAudio(fallbackText, "hi");
    } catch {}
    return res.status(200).json({
      text: fallbackText,
      reply: fallbackText,
      audio: fallbackAudio,
    });
  }
}
