import React from "react";
import { Volume2, Check } from "lucide-react";
import { VOICES } from "../data/personas";
import { VoiceName } from "../types";

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
  onPreviewVoice?: (voice: VoiceName) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
  onPreviewVoice,
}) => {
  return (
    <div id="voice-selector" className="space-y-2 select-none">
      <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
        Gemini 3.1 Voice Model
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <div
              key={v.id}
              onClick={() => !disabled && onSelectVoice(v.id)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-950/40 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-white"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] text-white/70"
              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSelected ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" : "bg-white/30"
                    }`}
                  />
                  <span className="font-normal text-sm text-white/90">
                    {v.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                    {v.gender}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onPreviewVoice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewVoice(v.id);
                      }}
                      title={`Preview sample of ${v.name}`}
                      className="p-1 rounded-md text-white/40 hover:text-blue-400 hover:bg-white/10 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
              </div>

              <div className="mt-2 text-xs text-white/40 flex items-center justify-between font-light">
                <span className="italic">{v.tone}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

