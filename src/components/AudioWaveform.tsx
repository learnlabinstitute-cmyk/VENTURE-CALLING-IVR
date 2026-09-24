import React from "react";

interface AudioWaveformProps {
  userLevel: number;
  geminiLevel: number;
  isUserSpeaking: boolean;
  isGeminiSpeaking: boolean;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  userLevel,
  geminiLevel,
  isUserSpeaking,
  isGeminiSpeaking,
  barCount = 32,
}) => {
  const activeLevel = isGeminiSpeaking ? geminiLevel : isUserSpeaking ? userLevel : 0.05;
  const isSpeaking = isGeminiSpeaking || isUserSpeaking;

  return (
    <div
      id="audio-waveform-meter"
      className="flex items-center justify-center gap-1 h-7 w-full max-w-xs px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm shadow-inner"
    >
      {Array.from({ length: barCount }).map((_, index) => {
        // Symmetric bell-curve distribution
        const centerOffset = Math.abs(index - barCount / 2) / (barCount / 2);
        const curveFactor = 1 - centerOffset * 0.7;

        // Dynamic jitter on voice activity
        const jitter = isSpeaking ? (Math.sin(index * 1.6 + Date.now() / 120) + 1) * 0.15 : 0;
        const heightPercent = Math.max(
          14,
          Math.min(100, (activeLevel * 95 * curveFactor + jitter * 20))
        );

        let barColor = "bg-white/20";
        if (isGeminiSpeaking) {
          barColor = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
        } else if (isUserSpeaking) {
          barColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]";
        }

        return (
          <div
            key={index}
            className="flex-1 max-w-[3px] h-full flex items-center justify-center"
          >
            <div
              className={`w-full rounded-full transition-all duration-75 ${barColor}`}
              style={{
                height: `${heightPercent}%`,
                opacity: isSpeaking ? 0.95 : 0.25,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

