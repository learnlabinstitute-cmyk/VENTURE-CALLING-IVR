import React, { useState } from "react";
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Radio,
  Disc,
  Hand,
  MessageSquare,
} from "lucide-react";
import { CompanionMode, ConnectionState } from "../types";

interface ControlBarProps {
  connectionState: ConnectionState;
  onStartSession: () => void;
  onEndSession: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onInterrupt: () => void;
  isGeminiSpeaking: boolean;
  onSendMessage: (text: string) => void;
  mode: CompanionMode;
  onToggleMode: (mode: CompanionMode) => void;
  suggestedTopics: string[];
  onSelectTopic: (topic: string) => void;
  isPushToTalk?: boolean;
  onTogglePushToTalk?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  connectionState,
  onStartSession,
  onEndSession,
  isMuted,
  onToggleMute,
  isAudioMuted,
  onToggleAudioMute,
  onInterrupt,
  isGeminiSpeaking,
  onSendMessage,
  mode,
  onToggleMode,
  suggestedTopics,
  onSelectTopic,
}) => {
  const [inputText, setInputText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div id="control-bar-container" className="w-full max-w-2xl mx-auto space-y-5">
      {/* Topic Suggestions Carousel */}
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none mask-fade">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40 font-medium whitespace-nowrap pl-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Intake Scenarios:</span>
          </div>
          {suggestedTopics.map((topic, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectTopic(topic)}
              className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer shadow-sm"
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {/* Main Interaction Control Module ("Elegant Dark") */}
      <div className="relative flex flex-col items-center">
        {/* Interrupt prompt button if Gemini is speaking */}
        {isGeminiSpeaking && isConnected && (
          <div className="mb-3">
            <button
              id="interrupt-gemini-btn"
              type="button"
              onClick={onInterrupt}
              title="Interrupt Gemini speech"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs tracking-wider uppercase font-medium hover:bg-amber-500/20 transition-all animate-pulse cursor-pointer shadow-sm"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Tap to Interrupt</span>
            </button>
          </div>
        )}

        {/* Primary Controls Row */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 w-full">
          {/* Left: Speaker Audio Output Mute */}
          <button
            id="toggle-speaker-mute-btn"
            type="button"
            onClick={onToggleAudioMute}
            title={isAudioMuted ? "Unmute Audio Output" : "Mute Audio Output"}
            className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
              isAudioMuted
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Center: Main Tactile Call / Mic Toggle */}
          <div className="relative flex flex-col items-center">
            {!isConnected ? (
              <div className="relative group">
                <div className="absolute -inset-2 bg-blue-600/30 rounded-full blur-lg group-hover:bg-blue-600/50 transition-all pointer-events-none" />
                <button
                  id="start-voice-session-btn"
                  type="button"
                  disabled={isConnecting}
                  onClick={onStartSession}
                  className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <PhoneCall className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <div
                  className={`absolute -inset-2 rounded-full blur-lg transition-all pointer-events-none ${
                    isMuted ? "bg-rose-600/30" : "bg-blue-600/30"
                  }`}
                />
                <button
                  id="toggle-mic-mute-btn"
                  type="button"
                  onClick={onToggleMute}
                  title={isMuted ? "Tap to Unmute Mic" : "Tap to Mute Mic"}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 text-white ${
                    isMuted
                      ? "bg-rose-600 hover:bg-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.4)]"
                      : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
            )}

            {/* Sub-label below main button */}
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 mt-2">
              {!isConnected
                ? isConnecting
                  ? "Connecting..."
                  : "Tap to Connect"
                : isMuted
                ? "Muted"
                : "Mic Active"}
            </span>
          </div>

          {/* Right: End Session or Text Mode Toggle */}
          {isConnected ? (
            <button
              id="end-voice-session-btn"
              type="button"
              onClick={onEndSession}
              title="End Voice Call"
              className="w-12 h-12 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="toggle-text-input-mode-btn"
              type="button"
              onClick={() => setShowTextInput(!showTextInput)}
              title="Toggle Text Input"
              className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                showTextInput
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Streaming Mode and Controls Bar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center p-0.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => onToggleMode("live")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-wider font-medium transition-all cursor-pointer ${
                mode === "live"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Live Stream</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleMode("recorded")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-wider font-medium transition-all cursor-pointer ${
                mode === "recorded"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Disc className="w-3 h-3" />
              <span>Turn Voice</span>
            </button>
          </div>
        </div>

        {/* Text Input Drawer (for typing prompts to Gemini) */}
        {(showTextInput || isConnected) && (
          <form
            onSubmit={handleSendText}
            className="w-full max-w-xl flex items-center gap-2 mt-4 transition-all"
          >
            <input
              id="text-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isConnected
                  ? "Type a query (Gemini speaks the answer)..."
                  : "Type a prompt to start conversation..."
              }
              className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-colors font-light"
            />
            <button
              id="send-text-message-btn"
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Elegant Telemetry Strip */}
      <div className="w-full max-w-xl mx-auto pt-4 border-t border-white/5 grid grid-cols-3 text-center text-[10px] uppercase tracking-widest text-white/30 select-none">
        <div>
          <span>Engine</span>
          <p className="text-white/60 font-medium mt-0.5">Gemini 3.1 Live</p>
        </div>
        <div>
          <span>Audio HD</span>
          <p className="text-white/60 font-medium mt-0.5">24kHz PCM</p>
        </div>
        <div>
          <span>Latency</span>
          <p className="text-white/60 font-medium mt-0.5">Real-time</p>
        </div>
      </div>
    </div>
  );
};

