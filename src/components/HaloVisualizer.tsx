import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ConnectionState, VoiceName } from "../types";

interface HaloVisualizerProps {
  connectionState: ConnectionState;
  isUserSpeaking: boolean;
  isGeminiSpeaking: boolean;
  userLevel: number;
  geminiLevel: number;
  voice: VoiceName;
  personaColor?: string;
  isMuted: boolean;
  onClickToggle?: () => void;
}

export const HaloVisualizer: React.FC<HaloVisualizerProps> = ({
  connectionState,
  isUserSpeaking,
  isGeminiSpeaking,
  userLevel,
  geminiLevel,
  voice,
  isMuted,
  onClickToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Determine current active state
  let stateLabel = "Tap to speak with Legal Assistant";
  let stateSubtitle = "Bail & Custody • FIR & Notices • Lawyer Consultations";
  let statusBadgeColor = "text-white/40";

  if (connectionState === "connecting") {
    stateLabel = "Connecting to Legal Assistant...";
    stateSubtitle = "Gemini 3.1 Live Voice Stream";
    statusBadgeColor = "text-amber-400";
  } else if (connectionState === "connected") {
    if (isMuted) {
      stateLabel = "Microphone muted";
      stateSubtitle = "Tap center button or mic to unmute";
      statusBadgeColor = "text-rose-400";
    } else if (isGeminiSpeaking) {
      stateLabel = `Priya (Capital Legal Defence)`;
      stateSubtitle = "Listening & Logging Intake Details";
      statusBadgeColor = "text-blue-400";
    } else if (isUserSpeaking) {
      stateLabel = "Listening to your voice...";
      stateSubtitle = "Aap aaram se bataiye...";
      statusBadgeColor = "text-emerald-400";
    } else {
      stateLabel = "Listening • Aaram se bataiye";
      stateSubtitle = "Bataiye ji, kya help chahiye?";
      statusBadgeColor = "text-blue-400";
    }
  } else if (connectionState === "error") {
    stateLabel = "Connection offline";
    stateSubtitle = "Tap to reconnect";
    statusBadgeColor = "text-rose-400";
  }

  // Draw subtle harmonic canvas ripples
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 420);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      phaseRef.current += 0.025;

      const activeLevel = isGeminiSpeaking
        ? geminiLevel
        : isUserSpeaking
        ? userLevel
        : connectionState === "connected"
        ? 0.08
        : 0.02;

      const baseRadius = Math.min(width, height) * 0.28;
      const ringCount = 3;

      for (let i = ringCount; i >= 1; i--) {
        const ringRadius = baseRadius + i * 22 * (0.8 + activeLevel * 1.2);
        const waveCount = 5 + i * 2;
        const waveAmp = (4 + i * 3) * (0.4 + activeLevel * 2.0);

        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const distortion =
            Math.sin(a * waveCount + phaseRef.current * (i % 2 === 0 ? 1 : -1) + i) * waveAmp;
          const r = ringRadius + distortion;
          const x = centerX + Math.cos(a) * r;
          const y = centerY + Math.sin(a) * r;

          if (a === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const alpha = Math.max(0.02, (0.16 / i) * (0.5 + activeLevel));
        ctx.strokeStyle = isGeminiSpeaking
          ? `rgba(59, 130, 246, ${alpha * 1.4})`
          : isUserSpeaking
          ? `rgba(52, 211, 153, ${alpha * 1.2})`
          : `rgba(99, 102, 241, ${alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [connectionState, isUserSpeaking, isGeminiSpeaking, userLevel, geminiLevel]);

  const orbScale =
    connectionState === "connected"
      ? isGeminiSpeaking
        ? 1.04 + geminiLevel * 0.25
        : isUserSpeaking
        ? 1.02 + userLevel * 0.2
        : 1
      : 0.98;

  return (
    <div
      id="halo-visualizer-container"
      className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto aspect-square select-none my-2"
    >
      {/* Background Concentric Orbital Rings ("Elegant Dark") */}
      <div className="absolute w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] rounded-full border border-white/[0.05] pointer-events-none" />
      <div className="absolute w-[190px] h-[190px] sm:w-[260px] sm:h-[260px] rounded-full border border-white/[0.08] pointer-events-none" />

      {/* Canvas harmonics layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Main Interactive Center Voice Orb */}
      <motion.button
        id="voice-orb-button"
        type="button"
        onClick={onClickToggle}
        aria-label={stateLabel}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        animate={{
          scale: orbScale,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_100px_rgba(79,70,229,0.3)] cursor-pointer flex items-center justify-center focus:outline-none transition-shadow duration-500 group"
      >
        {/* Inner Dark Surface */}
        <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center overflow-hidden relative border border-white/5">
          {/* Luminous Top Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

          {/* Subtly Rotating Radial Core */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none opacity-40"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, rgba(59, 130, 246, 0.45) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 80%)",
            }}
            animate={{
              rotate: [0, 360],
              opacity: isGeminiSpeaking ? [0.6, 0.9, 0.6] : isUserSpeaking ? [0.5, 0.8, 0.5] : 0.35,
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 16, ease: "linear" },
              opacity: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
            }}
          />

          {/* Vertical Voice Spectrum Bars inside Orb */}
          <div className="relative z-20 flex items-end justify-center gap-1.5 h-12">
            {[4, 8, 12, 7, 10, 5].map((baseH, i) => {
              const activeMul = isGeminiSpeaking
                ? Math.max(1, geminiLevel * 3.5)
                : isUserSpeaking
                ? Math.max(1, userLevel * 3)
                : connectionState === "connected"
                ? 1 + Math.sin(Date.now() / 400 + i) * 0.4
                : 0.6;

              const heightPx = Math.min(36, Math.max(4, baseH * activeMul));

              return (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isGeminiSpeaking
                      ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
                      : isUserSpeaking
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                      : "bg-blue-400/80"
                  }`}
                  animate={{
                    height: `${heightPx}px`,
                    opacity: connectionState === "connected" ? 0.9 : 0.4,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 18,
                  }}
                />
              );
            })}
          </div>
        </div>
      </motion.button>

      {/* State Text & Tracking Typography */}
      <div className="relative z-10 mt-6 text-center">
        <motion.p
          key={stateLabel}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs uppercase tracking-[0.25em] font-medium ${statusBadgeColor}`}
        >
          {stateLabel}
        </motion.p>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">
          {stateSubtitle}
        </p>
      </div>
    </div>
  );
};

