import React from "react";
import { X, Sliders, Volume2, Sparkles, HeartHandshake, Zap, Languages, BookOpen, RotateCcw } from "lucide-react";
import { PERSONAS } from "../data/personas";
import { CompanionPersona, VoiceName } from "../types";
import { VoiceSelector } from "./VoiceSelector";

interface CompanionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: CompanionPersona;
  onSelectPersona: (persona: CompanionPersona) => void;
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  onPreviewVoice?: (voice: VoiceName) => void;
  onApplySettings?: () => void;
}

const PERSONA_ICONS: Record<string, React.ReactNode> = {
  HeartHandshake: <HeartHandshake className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Languages: <Languages className="w-3.5 h-3.5" />,
  BookOpen: <BookOpen className="w-3.5 h-3.5" />,
};

export const CompanionSettingsModal: React.FC<CompanionSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedPersona,
  onSelectPersona,
  selectedVoice,
  onSelectVoice,
  customPrompt,
  onChangeCustomPrompt,
  volume,
  onChangeVolume,
  onPreviewVoice,
  onApplySettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="companion-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        id="companion-settings-modal-content"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#08080a] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-[#f0f0f0]">
              Companion Personality & Audio
            </h2>
          </div>
          <button
            id="close-settings-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin">
          {/* Persona selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
              Companion Archetype & Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPersona(p);
                      onChangeCustomPrompt(p.systemPrompt);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-950/40 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-white"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] text-white/70"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-md bg-white/5 text-blue-400">
                        {PERSONA_ICONS[p.iconName] || <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-medium text-sm text-white/90">
                        {p.name}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-light">
                      {p.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Selector */}
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={onSelectVoice}
            onPreviewVoice={onPreviewVoice}
          />

          {/* System Prompt Customization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                System Instructions
              </label>
              <button
                type="button"
                onClick={() => onChangeCustomPrompt(selectedPersona.systemPrompt)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset default</span>
              </button>
            </div>
            <textarea
              id="custom-system-prompt-textarea"
              rows={3}
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              placeholder="Define how Gemini 3.1 should speak, sound, or roleplay..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-colors resize-none leading-relaxed font-light"
            />
          </div>

          {/* Audio Output Volume */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Output Audio Volume</span>
              <span className="font-mono text-white/80">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="apply-settings-btn"
            type="button"
            onClick={() => {
              if (onApplySettings) onApplySettings();
              onClose();
            }}
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

