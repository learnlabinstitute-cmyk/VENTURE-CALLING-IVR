import React, { useEffect, useRef } from "react";
import { Copy, Trash2, Check, ChevronDown, ChevronUp, FileText, Headphones, Volume2 } from "lucide-react";
import { TranscriptEntry } from "../types";

interface TranscriptViewProps {
  entries: TranscriptEntry[];
  liveSubtitles?: string;
  onClear: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSpeakConversation?: () => void;
  onSpeakTurn?: (text: string, role: string) => void;
  isSpeaking?: boolean;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  entries,
  liveSubtitles,
  onClear,
  isOpen,
  onToggleOpen,
  onSpeakConversation,
  onSpeakTurn,
  isSpeaking = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, liveSubtitles, isOpen]);

  const handleCopyTranscript = () => {
    const text = entries
      .map(
        (e) =>
          `[${e.timestamp.toLocaleTimeString()}] ${
            e.role === "user" ? "Client" : "Isha (Venture Infotech Support 24)"
          }: ${e.text}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="transcript-container"
      className="w-full flex flex-col rounded-2xl bg-[#090f1d]/90 border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 select-none"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <button
          id="toggle-transcript-button"
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-bold text-sky-200 hover:text-white transition-colors cursor-pointer"
        >
          <Headphones className="w-3.5 h-3.5 text-cyan-400" />
          <span>Official IVR Call Log & Transcript</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 font-mono tracking-normal border border-cyan-500/20">
            {entries.length} turns
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Speak Conversation Header Button */}
          {onSpeakConversation && (
            <button
              type="button"
              onClick={onSpeakConversation}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                isSpeaking
                  ? "bg-rose-500 hover:bg-rose-400 text-white shadow-md animate-pulse"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-md active:scale-95"
              }`}
              title="Speak entire conversation out loud"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-bounce" : ""}`} />
              <span>{isSpeaking ? "Stop" : "Speak Conversation"}</span>
            </button>
          )}

          {entries.length > 0 && (
            <>
              <button
                id="copy-transcript-btn"
                type="button"
                onClick={handleCopyTranscript}
                title="Copy entire call log"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                id="clear-transcript-btn"
                type="button"
                onClick={onClear}
                title="Clear call transcript"
                className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Transcript Scroll Area */}
      {isOpen && (
        <div
          ref={scrollRef}
          className="p-4 space-y-3.5 max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin select-text"
        >
          {entries.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-xs uppercase tracking-widest">
              <FileText className="w-6 h-6 mx-auto mb-2 text-white/20" />
              <p>No recorded call dialogue yet</p>
              <p className="text-[10px] text-white/30 mt-1 lowercase font-mono">
                Start the call or choose a scenario to view recorded audio log.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const isGemini = entry.role === "gemini";
              return (
                <div
                  key={entry.id}
                  className={`flex flex-col text-xs sm:text-sm ${
                    isGemini ? "items-start" : "items-end"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[9.5px] uppercase tracking-wider text-white/40">
                    <span className={`font-semibold ${isGemini ? "text-cyan-300" : "text-emerald-300"}`}>
                      {isGemini ? "Isha (Support 24 IVR)" : "Caller (Client)"}
                    </span>
                    <span className="font-mono text-white/30">
                      {entry.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    {onSpeakTurn && (
                      <button
                        type="button"
                        onClick={() => onSpeakTurn(entry.text, entry.role)}
                        title="Speak this dialogue aloud"
                        className="text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer flex items-center gap-0.5 ml-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="text-[8.5px] lowercase">speak</span>
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed font-light ${
                      isGemini
                        ? "bg-[#0d172e] text-sky-100 border border-cyan-500/20 shadow-md"
                        : "bg-cyan-600/30 text-white border border-cyan-400/40 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{entry.text}</p>

                    {entry.audioBlobUrl && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                        <audio
                          src={entry.audioBlobUrl}
                          controls
                          className="h-7 w-48 max-w-full opacity-80"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Active Live Subtitle stream within transcript */}
          {liveSubtitles && (
            <div className="flex flex-col items-start text-xs sm:text-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-1 text-[9.5px] uppercase tracking-wider text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold">Isha (Speaking...)</span>
              </div>
              <div className="max-w-[90%] rounded-2xl px-3.5 py-2.5 bg-cyan-950/40 border border-cyan-400/30 text-white/90 text-xs sm:text-sm font-light italic leading-relaxed">
                <p>{liveSubtitles}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
