import React, { useState, useEffect, useRef, useCallback } from "react";
import { VentureLogo } from "./components/VentureLogo";
import { IPhoneFrame } from "./components/iphone/IPhoneFrame";
import { IPhoneInCallView } from "./components/iphone/IPhoneInCallView";
import { IPhoneKeypadModal } from "./components/iphone/IPhoneKeypadModal";
import { PreCallIntakeForm } from "./components/PreCallIntakeForm";
import { buildCallerSystemPrompt, VOICES } from "./data/personas";
import {
  CallerInfo,
  ConnectionState,
  SupportPlan,
  TranscriptEntry,
  VoiceName,
} from "./types";
import {
  LiveAudioPlayer,
  calculateRMS,
  float32To16BitPCMBase64,
  playRingSound,
  playHangupSound,
  speakTextViaSpeechSynthesis,
  stopSpeechSynthesis,
} from "./utils/audioUtils";
import { matchExecutiveResponse } from "./utils/executiveEngine";
import {
  Phone,
  PhoneOff,
  AlertCircle,
  Volume2,
  UserPlus,
  ShieldCheck,
  Headphones,
} from "lucide-react";

export default function App() {
  // Navigation / View State: "form" (Pre-call intake) | "calling" (iPhone Calling UX)
  const [currentView, setCurrentView] = useState<"form" | "calling">("form");

  // Verified Caller Info from Pre-Call Form
  const [callerInfo, setCallerInfo] = useState<CallerInfo>({
    name: "Rohan Sharma",
    email: "rohan.sharma@venturestore.in",
    phone: "+91 98765 43210",
  });

  // Call & Persona States
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [selectedVoice] = useState<VoiceName>("Kore");
  const [selectedPlan, setSelectedPlan] = useState<SupportPlan>("Gold Plan");

  // In-Call Controls
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);

  // In-Phone Keypad Modal
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);

  // Live Audio & Activity
  const [, setUserLevel] = useState<number>(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isIshaSpeaking, setIsIshaSpeaking] = useState<boolean>(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState<boolean>(false);

  // Captions & Transcripts (Stored internally for context, but no scripts exposed to user)
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References for Web Audio & WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const livePlayerRef = useRef<LiveAudioPlayer>(new LiveAudioPlayer());
  const speakTimeoutRef = useRef<any>(null);
  const conversationAbortRef = useRef<boolean>(false);
  const speechRecRef = useRef<any>(null);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const isIshaSpeakingRef = useRef(isIshaSpeaking);
  useEffect(() => {
    isIshaSpeakingRef.current = isIshaSpeaking;
  }, [isIshaSpeaking]);

  // Call timer effect
  useEffect(() => {
    let interval: any = null;
    if (connectionState === "connected") {
      interval = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDurationSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionState]);

  // Format call duration MM:SS
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Speak text with Server-side TTS or browser fallback
  const speakText = useCallback(
    async (text: string, voiceOverride?: string, isUserVoice?: boolean) => {
      if (!isSpeakerOn) return;

      setIsIshaSpeaking(!isUserVoice);
      setCurrentCaption(text);

      try {
        let res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: voiceOverride || (isUserVoice ? "Puck" : selectedVoice || "Kore"),
            systemInstruction: buildCallerSystemPrompt(callerInfo),
          }),
        });

        if (!res.ok) {
          res = await fetch("/api/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voice: voiceOverride || (isUserVoice ? "Puck" : selectedVoice || "Kore"),
              systemInstruction: buildCallerSystemPrompt(callerInfo),
            }),
          });
        }

        if (res.ok) {
          const data = await res.json();
          const base64 = data.audio || data.data;
          if (base64) {
            await livePlayerRef.current.playBase64Audio(base64);
            setIsIshaSpeaking(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Server TTS error, attempting fallback", e);
      }

      // Browser SpeechSynthesis fallback only if server TTS unavailable
      try {
        speakTextViaSpeechSynthesis(
          text,
          () => setIsIshaSpeaking(!isUserVoice),
          () => setIsIshaSpeaking(false),
          "hi-IN"
        );
      } catch (err) {
        console.error("Speech playback error:", err);
        setIsIshaSpeaking(false);
      }
    },
    [isSpeakerOn, selectedVoice, callerInfo]
  );

  // Clean disconnect of active session
  const disconnectSession = useCallback(() => {
    playHangupSound();
    stopSpeechSynthesis();
    conversationAbortRef.current = true;
    setIsSpeakingAudio(false);

    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
      speechRecRef.current = null;
    }

    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    livePlayerRef.current.stopAll();

    setIsConnecting(false);
    setConnectionState("disconnected");
    setIsIshaSpeaking(false);
    setIsUserSpeaking(false);
  }, []);

  // Send message to Isha (via WebSocket or HTTP /api/chat fallback)
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim()) return;

      const userEntry: TranscriptEntry = {
        id: `user-${Date.now()}`,
        role: "user",
        text: messageText,
        timestamp: new Date(),
      };

      setTranscripts((prev) => [...prev, userEntry]);
      setCurrentCaption(messageText);

      // If active WebSocket session is open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "text",
            text: messageText,
          })
        );
        return;
      }

      // HTTP chat fallback with Gemini or Executive SOP engine
      try {
        setIsIshaSpeaking(true);
        let replyText = "";
        let audioBase64: string | null = null;

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: messageText,
              voice: selectedVoice,
              systemInstruction: buildCallerSystemPrompt(callerInfo),
              history: transcripts.map((t) => ({
                role: t.role === "user" ? "user" : "model",
                text: t.text,
              })),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            replyText = data.reply || data.text || "";
            audioBase64 = data.audio || null;
          }
        } catch (fetchErr) {
          console.warn("Chat fetch warning:", fetchErr);
        }

        // If backend was unreachable or returned empty, match official SOP
        if (!replyText) {
          replyText = matchExecutiveResponse(
            messageText,
            callerInfo.name || "Client",
            selectedPlan
          );
        }

        setTranscripts((prev) => [
          ...prev,
          {
            id: `gemini-${Date.now()}`,
            role: "gemini",
            text: replyText,
            timestamp: new Date(),
          },
        ]);
        setCurrentCaption(replyText);

        if (audioBase64) {
          await livePlayerRef.current.playBase64Audio(audioBase64);
        } else {
          await speakText(replyText);
        }
      } catch (err: any) {
        console.error("Chat error:", err);
        const fallback = matchExecutiveResponse(messageText, callerInfo.name || "Client", selectedPlan);
        setTranscripts((prev) => [
          ...prev,
          {
            id: `gemini-${Date.now()}`,
            role: "gemini",
            text: fallback,
            timestamp: new Date(),
          },
        ]);
        setCurrentCaption(fallback);
        await speakText(fallback);
      } finally {
        setIsIshaSpeaking(false);
      }
    },
    [selectedVoice, callerInfo, transcripts, speakText, selectedPlan]
  );

  // Initialize Call Connection to Executive Isha
  const startLiveSession = useCallback(
    async (callerOverride?: CallerInfo) => {
      disconnectSession();

      const activeCaller = callerOverride || callerInfo;
      setIsConnecting(true);
      setConnectionState("connecting");
      setErrorMessage(null);
      conversationAbortRef.current = false;

      // Play ringing audio
      playRingSound();

      try {
        // Initialize speaker audio output
        livePlayerRef.current.init();

        // Request microphone access
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          mediaStreamRef.current = stream;

          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          const inputAudioCtx = new AudioCtxClass({ sampleRate: 16000 });
          inputAudioCtxRef.current = inputAudioCtx;

          const source = inputAudioCtx.createMediaStreamSource(stream);
          const processor = inputAudioCtx.createScriptProcessor(2048, 1, 1);
          processorNodeRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current) {
              setUserLevel(0);
              setIsUserSpeaking(false);
              return;
            }

            const inputData = e.inputBuffer.getChannelData(0);
            const rms = calculateRMS(inputData);
            setUserLevel(rms);
            setIsUserSpeaking(rms > 0.04);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              const pcm16Base64 = float32To16BitPCMBase64(inputData);
              wsRef.current.send(
                JSON.stringify({
                  type: "audio",
                  data: pcm16Base64,
                })
              );
            }
          };

          source.connect(processor);
          processor.connect(inputAudioCtx.destination);
        } catch (micErr) {
          console.warn("Microphone access not granted or unavailable, proceeding with audio output only:", micErr);
        }

        // Establish WebSocket connection to /live
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const callerName = activeCaller.name.trim() || "Client";
        const greetingText = activeCaller.plan
          ? `Hello ${callerName}, welcome to Venture Infotech Solution! Main Isha baat kar rahi hoon. Maine system me dekha aapka ${activeCaller.plan} registered hai. Aaj aapki kya madad kar sakti hoon, kindly batayein?`
          : `Hello ${callerName}, welcome to Venture Infotech Solution! Main Isha baat kar rahi hoon. Aaj aapki kya madad kar sakti hoon, kindly batayein?`;

        // Pre-fetch natural Gemini TTS audio immediately so it's ready the moment the call connects
        const greetingTtsPromise = (async () => {
          try {
            let res = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: greetingText,
                voice: selectedVoice || "Kore",
                systemInstruction: buildCallerSystemPrompt(activeCaller),
              }),
            });
            if (!res.ok) {
              res = await fetch("/api/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: greetingText,
                  voice: selectedVoice || "Kore",
                  systemInstruction: buildCallerSystemPrompt(activeCaller),
                }),
              });
            }
            if (res.ok) {
              const d = await res.json();
              return d.audio || d.data || null;
            }
          } catch (e) {
            console.warn("Pre-fetch TTS error:", e);
          }
          return null;
        })();

        let hasSpokenGreeting = false;
        const playGreetingOnce = async () => {
          if (hasSpokenGreeting || conversationAbortRef.current) return;
          hasSpokenGreeting = true;

          setIsConnecting(false);
          setConnectionState("connected");

          setTranscripts([
            {
              id: "greeting-0",
              role: "gemini",
              text: greetingText,
              timestamp: new Date(),
            },
          ]);
          setCurrentCaption(greetingText);

          // Play natural Gemini TTS audio immediately! Isha speaks first!
          const preloadedAudio = await greetingTtsPromise;
          if (preloadedAudio) {
            setIsIshaSpeaking(true);
            await livePlayerRef.current.playBase64Audio(preloadedAudio);
            setIsIshaSpeaking(false);
          } else {
            await speakText(greetingText);
          }
        };

        // Realistic 1.5s ringtone, then Isha speaks FIRST with authentic natural voice
        setTimeout(() => {
          playGreetingOnce();
        }, 1500);

        ws.onopen = () => {
          // Send handshake with caller-personalized system instruction
          ws.send(
            JSON.stringify({
              type: "init",
              voice: selectedVoice || "Kore",
              systemInstruction: buildCallerSystemPrompt(activeCaller),
            })
          );
          playGreetingOnce();
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "ready") {
              playGreetingOnce();
            }

            if (data.type === "audio" && (data.audio || data.data)) {
              setIsIshaSpeaking(true);
              const chunk = data.audio || data.data;
              if (livePlayerRef.current.playChunkBase64) {
                livePlayerRef.current.playChunkBase64(chunk);
              } else {
                livePlayerRef.current.playPCMChunk(chunk);
              }
            }

            if ((data.type === "text" || data.type === "transcript") && data.text) {
              setCurrentCaption(data.text);
              setTranscripts((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "gemini") {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: last.text + " " + data.text },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `gemini-${Date.now()}`,
                    role: "gemini",
                    text: data.text,
                    timestamp: new Date(),
                  },
                ];
              });
            }

            if (data.type === "turnComplete") {
              setIsIshaSpeaking(false);
            }

            if (data.type === "interrupted") {
              livePlayerRef.current.stopAll();
              setIsIshaSpeaking(false);
            }
          } catch (parseErr) {
            console.error("Failed to parse WebSocket message:", parseErr);
          }
        };

        ws.onerror = (err) => {
          console.warn("WebSocket live notice (falling back smoothly to HTTP/TTS):", err);
          playGreetingOnce();
        };

        ws.onclose = () => {
          if (connectionState === "connected") {
            setConnectionState("disconnected");
          }
        };
      } catch (err: any) {
        console.error("Failed to start session:", err);
        setIsConnecting(false);
        setConnectionState("error");
        setErrorMessage(err.message || "Failed to dial IVR line");
      }
    },
    [callerInfo, disconnectSession, selectedVoice, connectionState, speakText]
  );

  // Browser Speech Recognition during active call
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    let isDisposed = false;

    if (connectionState === "connected" && !isMuted) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "hi-IN";

        recognition.onresult = (event: any) => {
          if (isIshaSpeakingRef.current) return;
          const results = event.results;
          if (results && results.length > 0) {
            const last = results[results.length - 1];
            if (last && last[0] && last[0].transcript) {
              const text = last[0].transcript.trim();
              if (text.length > 1) {
                handleSendMessage(text);
              }
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e);
        };

        recognition.onend = () => {
          if (
            !isDisposed &&
            connectionState === "connected" &&
            !isMutedRef.current &&
            !isIshaSpeakingRef.current
          ) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        speechRecRef.current = recognition;
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    } else {
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {}
        speechRecRef.current = null;
      }
    }

    return () => {
      isDisposed = true;
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {}
        speechRecRef.current = null;
      }
    };
  }, [connectionState, isMuted, handleSendMessage]);

  // Form Submission Handler: Transitions from Intake Form into iPhone Call
  const handleStartCallFromForm = (submittedCaller: CallerInfo) => {
    setCallerInfo(submittedCaller);
    if (submittedCaller.plan) {
      setSelectedPlan(submittedCaller.plan);
    }
    setCurrentView("calling");
    startLiveSession(submittedCaller);
  };

  // Speak entire conversation aloud
  const handleSpeakConversation = useCallback(async () => {
    if (isSpeakingAudio) {
      conversationAbortRef.current = true;
      stopSpeechSynthesis();
      livePlayerRef.current.stopAll();
      setIsSpeakingAudio(false);
      setIsIshaSpeaking(false);
      return;
    }

    if (transcripts.length === 0) {
      const promptText = `Hello ${callerInfo.name}, welcome to Venture Infotech Solution! Main Isha baat kar rahi hoon. Aaj aapki kya madad kar sakti hoon, kindly batayein?`;
      speakText(promptText);
      return;
    }

    conversationAbortRef.current = false;
    setIsSpeakingAudio(true);

    for (let i = 0; i < transcripts.length; i++) {
      if (conversationAbortRef.current) break;
      const turn = transcripts[i];
      const isUser = turn.role === "user";

      setCurrentCaption(turn.text);
      if (isUser) {
        setIsUserSpeaking(true);
        setIsIshaSpeaking(false);
      } else {
        setIsIshaSpeaking(true);
        setIsUserSpeaking(false);
      }

      await speakText(turn.text, undefined, isUser);
      if (conversationAbortRef.current) break;

      await new Promise((res) => {
        speakTimeoutRef.current = setTimeout(res, 500);
      });
    }

    setIsSpeakingAudio(false);
    setIsIshaSpeaking(false);
    setIsUserSpeaking(false);
  }, [isSpeakingAudio, transcripts, callerInfo.name, selectedPlan, speakText]);

  // Toggle Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Toggle Speaker
  const handleToggleSpeaker = () => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      livePlayerRef.current.setMuted(!next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#030914] text-white flex flex-col font-sans selection:bg-lime-400 selection:text-black antialiased relative overflow-x-hidden">
      {/* Background Ambience & Grid Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.07),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.07),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-30 w-full border-b border-white/10 bg-[#050f1d]/85 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Brand Monogram & Title */}
        <VentureLogo size="md" variant="horizontal" showSubtitle={true} />

        {/* Right Status Pill & Actions */}
        <div className="flex items-center gap-3">
          {/* Official IVR Line Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-950/40 border border-lime-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="font-semibold text-lime-200">1800-VI-247</span>
            <span className="text-white/40">• Official IVR</span>
          </div>

          {currentView === "calling" ? (
            <>
              {/* Return to Form / New Call */}
              <button
                type="button"
                onClick={() => {
                  disconnectSession();
                  setCurrentView("form");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10 cursor-pointer"
                title="Change caller credentials or start new call"
              >
                <UserPlus className="w-3.5 h-3.5 text-lime-400" />
                <span className="hidden sm:inline">New Call / Form</span>
              </button>

              {/* End Call Button */}
              {connectionState === "connected" && (
                <button
                  type="button"
                  onClick={disconnectSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End ({formatDuration(callDurationSeconds)})</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-lime-400/80 font-medium">
              <ShieldCheck className="w-4 h-4 text-lime-400" />
              <span>Verified Client Portal</span>
            </div>
          )}
        </div>
      </header>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="relative z-30 mx-4 sm:mx-8 mt-3 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-white/60 hover:text-white text-xs font-semibold px-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center p-3 sm:p-6">
        {currentView === "form" ? (
          /* PRE-CALL FORM: Name, Email, Phone */
          <PreCallIntakeForm
            onStartCall={handleStartCallFromForm}
            initialCaller={callerInfo}
          />
        ) : (
          /* IPHONE CALLING INTERFACE (No script visible to user!) */
          <div className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            {/* Top Quick Status Pill */}
            <div className="mb-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#071322] border border-lime-500/20 text-xs text-white/80 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
              <span>
                Caller: <strong className="text-white font-medium">{callerInfo.name}</strong>
                {callerInfo.phone ? ` • ${callerInfo.phone}` : ""}
              </span>
              <span className="text-white/30">•</span>
              <button
                onClick={() => {
                  disconnectSession();
                  setCurrentView("form");
                }}
                className="text-lime-300 hover:text-lime-200 underline text-xs font-medium cursor-pointer"
              >
                Change Details
              </button>
            </div>

            {/* Authentic Apple iPhone 15 Pro Titanium Frame */}
            <div className="w-full max-w-[400px]">
              <IPhoneFrame
                isConnected={connectionState === "connected"}
                callDuration={formatDuration(callDurationSeconds)}
                isIshaSpeaking={isIshaSpeaking}
                isMuted={isMuted}
              >
                <IPhoneInCallView
                  isConnected={connectionState === "connected"}
                  isConnecting={isConnecting}
                  callDuration={formatDuration(callDurationSeconds)}
                  isMuted={isMuted}
                  isSpeakerOn={isSpeakerOn}
                  isIshaSpeaking={isIshaSpeaking}
                  isUserSpeaking={isUserSpeaking}
                  selectedPlan={selectedPlan}
                  currentCaption={currentCaption}
                  callerInfo={callerInfo}
                  isSpeakingAudio={isSpeakingAudio}
                  onSpeakConversation={handleSpeakConversation}
                  onToggleMute={handleToggleMute}
                  onToggleSpeaker={handleToggleSpeaker}
                  onOpenKeypad={() => setIsKeypadOpen(true)}
                  onStartCall={() => startLiveSession(callerInfo)}
                  onEndCall={disconnectSession}
                  onReturnToForm={() => {
                    disconnectSession();
                    setCurrentView("form");
                  }}
                  onSendMessage={handleSendMessage}
                />

                {/* iPhone In-Call Keypad Modal */}
                <IPhoneKeypadModal
                  isOpen={isKeypadOpen}
                  onClose={() => setIsKeypadOpen(false)}
                  onSelectPlanByDigit={(plan) => {
                    setSelectedPlan(plan);
                    handleSendMessage(`Main verify kar raha hoon, mera ${plan} hai.`);
                  }}
                  onSendDigitMessage={(digit) => {
                    handleSendMessage(`Dialed digit ${digit}`);
                  }}
                  selectedPlan={selectedPlan}
                />
              </IPhoneFrame>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-20 border-t border-white/5 py-3 px-4 text-center text-[11px] text-white/40">
        <p>
          Venture Infotech Solution Support 24 • Official Recorded IVR Line 1800-VI-247 • Managed under Quality SOP
        </p>
      </footer>
    </div>
  );
}
