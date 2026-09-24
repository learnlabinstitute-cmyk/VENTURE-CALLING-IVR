import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { fetchNeuralTTSAudio, matchExecutiveResponse } from "./src/utils/executiveEngine";

dotenv.config();

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

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(getGenAI()),
      model: "gemini-3.8-flash",
    });
  });

  // Turn-based Voice / TTS Generation endpoint (supports both /api/tts and /api/speak)
  const handleTTS = async (req: express.Request, res: express.Response) => {
    try {
      const { text, voice = "Kore", systemInstruction } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

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
              systemInstruction: systemInstruction || "You are Isha, senior customer care executive at Venture Infotech Support 24. Speak warmly in polite, calm Hindi/Hinglish.",
            },
          });

          const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (audioBase64) {
            return res.json({ audio: audioBase64, data: audioBase64 });
          }
        } catch {
          // Graceful fallback to natural neural audio
        }
      }

      // Natural Neural Voice Audio Generation (Authentic, never robotic)
      const neuralAudio = await fetchNeuralTTSAudio(text, "hi");
      res.json({ audio: neuralAudio, data: neuralAudio });
    } catch (err: any) {
      console.error("Error generating speech:", err);
      res.status(500).json({ error: err.message || "Failed to generate speech" });
    }
  };

  app.post("/api/tts", handleTTS);
  app.post("/api/speak", handleTTS);

  // Turn-based Audio/Text Chat endpoint (Processes user audio or text, returns answer + TTS audio)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, audioBase64, audioMimeType, voice = "Kore", systemInstruction, history = [] } = req.body;
      const ai = getGenAI();

      // Build contents parts
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

      const defaultSystemInstruction = `You are Isha, senior customer care executive at Venture Infotech Solution Support 24 calling IVR line (1800-VI-247).
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
   If client says: "Mujhe agency account nahi chahiye, mujhe mere khud ke account me ads run karwana hai. Aap kaise slot book karoge? UltraViewer se access loge kya?" or similar:
   "Bilkul Sir/Ma'am! AAP apne personal Facebook/Google Ad Account mein bhi ads run karwa sakte hain. Iska process bohot simple aur secure hai:
   1. Dedicated Technical Slot Booking:
      Sabse pehle main aapki request par hamaari Technical Setup Team ke saath aapka Dedicated Slot Book kar deti hoon. Slot timing fixed hoti hai taaki hamaara senior ad expert sirf aapke setup par hi focus kare.
   2. UltraViewer Access & Setup:
      Haan ji Sir/Ma'am, slot time par hamaare ad executive UltraViewer ke zariye aapke system ka remote access lenge. Sab kuch aapke laptop/computer screen ke saamne live hoga. Hamaara executive aapke samne aapke personal account mein ad manager, pixel, aur campaigns set up karega. Aap poori process live dekh sakte hain, isse aapki privacy aur account security 100% maintain rehti hai."

5. General Support:
   - Greeting: "Hello, welcome to Venture Infotech Solution! Main Isha baat kar rahi hoon. Aaj aapki kya madad kar sakti hoon, kindly batayein?"
   - Plan Verification: "Sabse pehle, main system me aapka plan verify kar leti hoon. Aapne hamaare Plans me se konsa package select kiya tha? Silver Plan, Gold Plan, ya Platinum Plan?"
   - Zero Sales: Meta Ad algorithm takes 48 hours testing window. Provide the Backup Execution Plan (winning products + tested creatives).`;

      let responseText = "";
      let ttsAudio: string | null = null;

      if (ai) {
        try {
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
              systemInstruction: systemInstruction || defaultSystemInstruction,
            },
          });

          if (promptResponse.text) {
            responseText = promptResponse.text;
          }

          if (responseText) {
            const ttsResponse = await ai.models.generateContent({
              model: "gemini-3.8-flash-lite-tts",
              contents: [{ parts: [{ text: `Say warmly and clearly as customer care executive Isha: ${responseText}` }] }],
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice || "Kore" },
                  },
                },
              },
            });
            ttsAudio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
          }
        } catch {
          // Graceful fallback to executive engine
        }
      }

      // If Gemini was unavailable or threw an error, use the official Executive SOP matcher
      if (!responseText) {
        responseText = matchExecutiveResponse(message || "");
      }

      // Generate natural neural audio if TTS not yet available
      if (!ttsAudio) {
        try {
          ttsAudio = await fetchNeuralTTSAudio(responseText, "hi");
        } catch {
          // Fallback handled gracefully
        }
      }

      res.json({
        text: responseText,
        reply: responseText,
        audio: ttsAudio,
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      // Guarantee a graceful executive response even on unexpected failure
      const fallbackText = "Namaste! Main Senior Executive Isha hoon Venture Infotech Solution Support 24 se. Main aapki kya madad kar sakti hoon?";
      let fallbackAudio = null;
      try {
        fallbackAudio = await fetchNeuralTTSAudio(fallbackText, "hi");
      } catch {}
      res.json({
        text: fallbackText,
        reply: fallbackText,
        audio: fallbackAudio,
      });
    }
  });

  // WebSocket Server for Gemini 3.1 Live API
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : "";
    if (pathname === "/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Gemini 3.1 Live API WebSocket");
    let session: any = null;
    let isConnected = true;

    clientWs.on("close", () => {
      isConnected = false;
      if (session) {
        try {
          session.close();
        } catch (e) {
          // ignore cleanup errors
        }
      }
      console.log("Client disconnected from Live API");
    });

    clientWs.on("error", (err) => {
      console.error("WebSocket client error:", err);
    });

    // Initialize session when client sends config or first ping
    clientWs.on("message", async (rawMessage) => {
      try {
        const msg = JSON.parse(rawMessage.toString());

        if (msg.type === "init") {
          const { voice = "Zephyr", systemInstruction } = msg;
          const ai = getGenAI();

          if (!ai) {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: "ready",
                message: "Natural voice companion active",
              }));
            }
            return;
          }

          const prompt = systemInstruction || 
            `You are Isha, senior customer care executive at Venture Infotech Support 24 calling IVR.
Always answer warmly in Hindi/Hinglish.
Greeting: "Hello, welcome to Venture Infotech Support! Main Isha baat kar rahi hoon. Aaj aapki kya madad kar sakti hoon, kindly batayein?"
Verify Plan: "Sabse pehle, main system me aapka plan verify kar leti hoon. Aapne hamaare Plans me se konsa package select kiya tha? Silver Plan, Gold Plan, ya Platinum Plan?"
Empathetic, reassuring tone. No blame game regarding sales promises; explain the 48-hour ad algorithm testing window.
Offer the Backup Execution Plan (winning product copy-paste into Cosmofeed/Razorpay).
Explain dedicated IVR for recorded quality if asked about offline numbers.
Follow strict Anti-Harassment policy with first and second warnings.`;

          try {
            session = await ai.live.connect({
              model: "gemini-3.8-live",
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                  },
                },
                systemInstruction: prompt,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
              },
              callbacks: {
                onmessage: (message: LiveServerMessage) => {
                  if (!isConnected || clientWs.readyState !== WebSocket.OPEN) return;

                  // Handle audio and text chunks
                  const modelParts = message.serverContent?.modelTurn?.parts;
                  if (modelParts && modelParts.length > 0) {
                    for (const part of modelParts) {
                      if (part.inlineData?.data) {
                        clientWs.send(JSON.stringify({
                          type: "audio",
                          audio: part.inlineData.data,
                          data: part.inlineData.data,
                        }));
                      }
                      if (part.text) {
                        clientWs.send(JSON.stringify({
                          type: "transcript",
                          text: part.text,
                        }));
                      }
                    }
                  }

                  // Handle interruption
                  if (message.serverContent?.interrupted) {
                    clientWs.send(JSON.stringify({
                      type: "interrupted",
                    }));
                  }

                  // Handle turn completion
                  if (message.serverContent?.turnComplete) {
                    clientWs.send(JSON.stringify({
                      type: "turnComplete",
                    }));
                  }
                },
                onerror: (err: any) => {
                  console.error("Gemini Live session error callback:", err);
                  if (isConnected && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                      type: "error",
                      message: err.message || "Live API error",
                    }));
                  }
                },
                onclose: () => {
                  console.log("Gemini Live session closed");
                  if (isConnected && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                      type: "sessionClosed",
                    }));
                  }
                },
              },
            });

            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: "ready",
                message: "Connected to Gemini 3.1 Live API",
              }));
            }
          } catch (initErr: any) {
            console.error("Failed to connect to Live API:", initErr);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: "error",
                message: initErr.message || "Failed to initialize Gemini 3.1 Live session",
              }));
            }
          }
          return;
        }

        // Forward realtime audio chunks from client to Gemini session
        if (msg.type === "audio" && (msg.audio || msg.data)) {
          if (session) {
            session.sendRealtimeInput({
              audio: {
                data: msg.audio || msg.data,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          }
          return;
        }

        // Forward realtime text input from client to Gemini session
        if (msg.type === "text" && msg.text) {
          if (session) {
            session.sendRealtimeInput({
              text: msg.text,
            });
          }
          return;
        }

        // Reconfigure or change voice
        if (msg.type === "changeConfig") {
          if (session) {
            try {
              session.close();
            } catch (e) {}
          }
          // Re-init with new config
          const ai = getGenAI();
          if (!ai) return;
          const { voice = "Zephyr", systemInstruction } = msg;
          session = await ai.live.connect({
            model: "gemini-3.8-live",
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice },
                },
              },
              systemInstruction: systemInstruction || "You are a warm, articulate voice companion powered by Gemini 3.1.",
            },
            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                if (!isConnected || clientWs.readyState !== WebSocket.OPEN) return;
                const modelParts = message.serverContent?.modelTurn?.parts;
                if (modelParts) {
                  for (const part of modelParts) {
                    if (part.inlineData?.data) {
                      clientWs.send(JSON.stringify({
                        type: "audio",
                        audio: part.inlineData.data,
                      }));
                    }
                    if (part.text) {
                      clientWs.send(JSON.stringify({
                        type: "text",
                        text: part.text,
                      }));
                    }
                  }
                }
                if (message.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: "interrupted" }));
                }
                if (message.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: "turnComplete" }));
                }
              },
            },
          });
          clientWs.send(JSON.stringify({ type: "ready", message: "Voice reconfigured" }));
        }
      } catch (err: any) {
        console.error("WebSocket message handling error:", err);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: "error",
            message: err.message || "Message processing failed",
          }));
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemini 3.1 Voice Companion server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
