import React from "react";
import { Sliders, Mic, Phone, Headphones } from "lucide-react";
import { CompanionPersona, ConnectionState, VoiceName } from "../types";
import { VentureLogo } from "./VentureLogo";

interface HeaderProps {
  connectionState: ConnectionState;
  persona: CompanionPersona;
  voice: VoiceName;
  onOpenSettings?: () => void;
  latencyMs?: number;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  persona,
  voice,
  onOpenSettings,
}) => {
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  return (
    <header className="w-full border-b border-white/10 bg-[#060c1c]/90 backdrop-blur-md z-30 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-2.5">
        {/* Left: Branding with VentureLogo */}
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isConnected
                ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.8)]"
                : isConnecting
                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"
                : "bg-white/30"
            }`}
          />
          <VentureLogo size="sm" variant="horizontal" />
        </div>

        {/* Center: Dedicated IVR Status */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs">
          <Headphones className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-cyan-200">1800-VI-247</span>
          <span className="text-white/50">• Official Calling IVR</span>
        </div>

        {/* Right: Persona Badge */}
        <div className="flex items-center gap-2.5">
          <div
            title={`Persona: ${persona.name} • Voice: ${voice}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider text-white/70"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-medium text-white">{persona.name}</span>
            <span className="text-[10px] text-cyan-300 uppercase">({voice})</span>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Voice Settings"
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
