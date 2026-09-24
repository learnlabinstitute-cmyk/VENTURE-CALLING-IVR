import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  PhoneOff,
  Phone,
  UserPlus,
  Video,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Volume1,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { CallerInfo, SupportPlan } from "../../types";
import { VentureLogo } from "../VentureLogo";

interface IPhoneInCallViewProps {
  isConnected: boolean;
  isConnecting: boolean;
  callDuration: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isIshaSpeaking: boolean;
  isUserSpeaking: boolean;
  selectedPlan: SupportPlan;
  currentCaption: string;
  callerInfo?: CallerInfo;
  isSpeakingAudio?: boolean;
  onSpeakConversation?: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onOpenKeypad: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
  onReturnToForm?: () => void;
  onSendMessage?: (message: string) => void;
}

export const IPhoneInCallView: React.FC<IPhoneInCallViewProps> = ({
  isConnected,
  isConnecting,
  callDuration,
  isMuted,
  isSpeakerOn,
  isIshaSpeaking,
  isUserSpeaking,
  selectedPlan,
  currentCaption,
  callerInfo,
  isSpeakingAudio = false,
  onSpeakConversation,
  onToggleMute,
  onToggleSpeaker,
  onOpenKeypad,
  onStartCall,
  onEndCall,
  onReturnToForm,
  onSendMessage,
}) => {
  const [showCaptions, setShowCaptions] = useState(true);
  const [customText, setCustomText] = useState("");
  const [showQueryBox, setShowQueryBox] = useState(false);

  const quickScenarios = [
    {
      label: "🖥️ Personal Ads / UltraViewer",
      prompt: "Mujhe agency account nahi chahiye, mujhe mere khud ke account me ads run karwana hai. Aap kaise slot book karoge? UltraViewer se access loge kya?",
    },
    {
      label: "⚖️ Police / Cyber Threat",
      prompt: "Main police aur cyber cell me direct legal complaint karunga fraud ke liye!",
    },
    {
      label: "💳 Payment Dispute & Mail",
      prompt: "Mujhe bilkul koi service nahi mili, payment turant resolve karwana hai!",
    },
    {
      label: "⏳ Zero Sales / 48h Testing",
      prompt: "Sales bilkul zero hai store me, Meta ad spend ho raha hai lekin order nahi aa raha.",
    },
  ];

  const handleSendQuickPrompt = (prompt: string) => {
    if (onSendMessage) {
      onSendMessage(prompt);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    if (onSendMessage) {
      onSendMessage(customText.trim());
      setCustomText("");
      setShowQueryBox(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between px-5 pt-3 pb-5 text-white overflow-hidden select-none">
      {/* Top Caller Information */}
      <div className="flex flex-col items-center text-center space-y-1">
        {/* Line / Connection Status */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-[10px] font-semibold text-lime-300">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span>1800-VI-247 • Recorded Line</span>
        </div>

        {/* Company & Executive Name */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans mt-0.5">
          Venture Infotech Solution
        </h2>

        <p className="text-xs text-lime-300/80 font-medium">
          Isha <span className="text-white/40">• Senior Support Executive</span>
        </p>

        {/* Call Status / Timer */}
        <p className="text-[12px] font-mono tracking-wider text-white/60">
          {isConnected ? (
            <span className="text-emerald-400 font-semibold">{callDuration}</span>
          ) : isConnecting ? (
            <span className="text-lime-300 animate-pulse">Calling Executive Isha...</span>
          ) : (
            <span className="text-white/40">Call Ended</span>
          )}
        </p>

        {/* Verified Caller Pill */}
        {callerInfo && (
          <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[9.5px] text-white/70">
            <User className="w-3 h-3 text-lime-400" />
            <span className="font-medium text-white">{callerInfo.name}</span>
            {callerInfo.phone && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-lime-300 font-mono">{callerInfo.phone}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center 3D Logo Avatar & Live Audio Waveform */}
      <div className="flex flex-col items-center justify-center my-auto py-2 space-y-3">
        {/* 3D Ribbon Logo Avatar */}
        <div className="relative">
          {/* Audio reactive pulse glow rings */}
          {isIshaSpeaking && (
            <>
              <div className="absolute -inset-4 rounded-full bg-lime-500/20 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-600 animate-pulse opacity-70 pointer-events-none" />
            </>
          )}

          {/* Avatar Container with glowing border */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-lime-400/40 p-1.5 flex items-center justify-center shadow-[0_10px_35px_rgba(132,204,22,0.25)]">
            <div className="w-full h-full rounded-full bg-[#05101c] flex flex-col items-center justify-center overflow-hidden relative">
              {/* 3D Helix Emblem */}
              <VentureLogo size="lg" variant="emblem" />

              {/* In-Call Status Tag */}
              <div className="absolute bottom-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-lime-500/30 text-[8.5px] font-bold text-lime-300">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span>SUPPORT 24</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Dynamic Waveform Bars */}
        <div className="flex flex-col items-center space-y-1 min-h-[36px]">
          {isConnected && (
            <div className="flex items-center gap-1.5 h-6 px-4">
              {[...Array(14)].map((_, i) => {
                const isSpeaking = isIshaSpeaking || isUserSpeaking;
                const waveHeight = isSpeaking
                  ? `${Math.max(6, ((i * 11) % 22) + 6)}px`
                  : "4px";
                return (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isIshaSpeaking
                        ? "bg-lime-400 shadow-[0_0_8px_#84cc16]"
                        : isUserSpeaking
                        ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                        : "bg-white/20"
                    }`}
                    style={{ height: waveHeight }}
                  />
                );
              })}
            </div>
          )}

          {/* Real-time Voice Status */}
          <span className="text-[11px] font-medium tracking-wide text-white/70">
            {isIshaSpeaking ? (
              <span className="text-lime-300 font-semibold animate-pulse">Isha is speaking...</span>
            ) : isUserSpeaking ? (
              <span className="text-emerald-300 font-semibold">Listening to you...</span>
            ) : isConnected ? (
              <span>HD Voice Active • Speak anytime</span>
            ) : isConnecting ? (
              <span className="text-lime-300 animate-pulse">Connecting...</span>
            ) : (
              <span>Call Disconnected</span>
            )}
          </span>
        </div>

        {/* Quick Voice Playback Pill */}
        {isConnected && onSpeakConversation && (
          <button
            type="button"
            onClick={onSpeakConversation}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer ${
              isSpeakingAudio
                ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30 animate-pulse"
                : "bg-lime-500 hover:bg-lime-400 text-black shadow-lime-500/30 hover:scale-105 active:scale-95"
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeakingAudio ? "animate-spin" : ""}`} />
            <span>{isSpeakingAudio ? "Stop Voice" : "Hear Isha"}</span>
          </button>
        )}

        {/* Minimal Live Caption Pill (Strictly Audio Captioning for Accessibility, NO scripts) */}
        {isConnected && currentCaption && showCaptions && (
          <div className="w-full max-w-[290px] p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-lime-500/20 text-[10px] leading-relaxed text-white/90 text-center shadow-lg relative">
            <p className="line-clamp-2 font-light italic">"{currentCaption}"</p>
            <button
              onClick={() => setShowCaptions(false)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 text-white/60 hover:text-white flex items-center justify-center text-[9px] border border-white/20"
              title="Hide captions"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Authentic iOS In-Call Control Buttons (Grid of 6) */}
      <div className="grid grid-cols-3 gap-y-3 gap-x-2 max-w-[280px] mx-auto w-full mb-3">
        {/* 1. Mute */}
        <div className="flex flex-col items-center">
          <button
            onClick={onToggleMute}
            disabled={!isConnected}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isMuted
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 hover:bg-white/20 text-white active:scale-95 disabled:opacity-30"
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <span className="text-[10px] mt-1 text-white/70">
            {isMuted ? "Unmute" : "Mute"}
          </span>
        </div>

        {/* 2. Keypad */}
        <div className="flex flex-col items-center">
          <button
            onClick={onOpenKeypad}
            disabled={!isConnected}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-lime-500/30 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 cursor-pointer"
          >
            <Grid className="w-6 h-6" />
          </button>
          <span className="text-[10px] mt-1 text-white/70">Keypad</span>
        </div>

        {/* 3. Speaker */}
        <div className="flex flex-col items-center">
          <button
            onClick={onToggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isSpeakerOn
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 hover:bg-white/20 text-white active:scale-95"
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <span className="text-[10px] mt-1 text-white/70">
            {isSpeakerOn ? "Speaker" : "Ear"}
          </span>
        </div>

        {/* 4. Captions Toggle */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showCaptions
                ? "bg-lime-500/20 text-lime-300 border border-lime-500/30"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {showCaptions ? <Eye className="w-6 h-6 text-lime-400" /> : <EyeOff className="w-6 h-6 text-white/40" />}
          </button>
          <span className="text-[10px] mt-1 text-white/70">Captions</span>
        </div>

        {/* 5. Ask Isha / SOP Queries */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowQueryBox(!showQueryBox)}
            disabled={!isConnected}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showQueryBox
                ? "bg-lime-500 text-black shadow-lg shadow-lime-500/40 scale-105"
                : "bg-white/10 hover:bg-white/20 text-white active:scale-95 disabled:opacity-30"
            }`}
            title="Ask Isha or test executive SOP scripts"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <span className="text-[10px] mt-1 text-white/70">Ask Isha</span>
        </div>

        {/* 6. Change Client Profile */}
        <div className="flex flex-col items-center">
          {onReturnToForm ? (
            <button
              onClick={onReturnToForm}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-lime-500/30 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Edit client credentials or start new call"
            >
              <UserPlus className="w-6 h-6 text-lime-300" />
            </button>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <span className="text-[10px] mt-1 text-white/70">New Call</span>
        </div>
      </div>

      {/* Interactive Quick Query / SOP Scenarios Drawer */}
      {isConnected && showQueryBox && (
        <div className="absolute inset-x-2 bottom-24 z-50 bg-[#071322]/95 backdrop-blur-xl border border-lime-500/40 rounded-3xl p-3.5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-lime-300">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>Official Executive Protocols</span>
            </div>
            <button
              onClick={() => setShowQueryBox(false)}
              className="w-5 h-5 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="grid grid-cols-2 gap-1.5 my-2.5">
            {quickScenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleSendQuickPrompt(sc.prompt);
                  setShowQueryBox(false);
                }}
                className="text-left p-2 rounded-xl bg-white/[0.06] hover:bg-lime-500/20 active:bg-lime-500/30 border border-white/10 hover:border-lime-500/40 transition-colors cursor-pointer"
              >
                <p className="text-[10px] font-semibold text-white leading-tight">
                  {sc.label}
                </p>
                <p className="text-[8.5px] text-white/50 truncate mt-0.5">
                  {sc.prompt}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Query Input */}
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type message to Executive Isha..."
              className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-lime-400"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="p-2 rounded-xl bg-lime-500 hover:bg-lime-400 active:scale-95 text-black disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Main Bottom Call Button (Red End Call or Green Redial) */}
      <div className="flex justify-center pt-1 pb-1">
        {isConnected ? (
          <button
            id="hangup-call-btn"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-90 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(244,63,94,0.45)] transition-all cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        ) : (
          <button
            id="start-call-btn"
            onClick={onStartCall}
            disabled={isConnecting}
            className="w-16 h-16 rounded-full bg-lime-500 hover:bg-lime-400 active:scale-90 flex items-center justify-center text-black shadow-[0_8px_25px_rgba(132,204,22,0.5)] transition-all disabled:opacity-50 cursor-pointer"
            title="Dial Isha"
          >
            <Phone className="w-7 h-7 fill-black" />
          </button>
        )}
      </div>
    </div>
  );
};
