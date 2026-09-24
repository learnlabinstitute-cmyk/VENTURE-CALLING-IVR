import React from "react";
import { Wifi, Battery, Signal, PhoneCall, Disc } from "lucide-react";

interface IPhoneFrameProps {
  children: React.ReactNode;
  isConnected?: boolean;
  callDuration?: string;
  isIshaSpeaking?: boolean;
  isMuted?: boolean;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  isConnected = false,
  callDuration = "00:00",
  isIshaSpeaking = false,
  isMuted = false,
}) => {
  return (
    <div className="relative mx-auto flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Outer iPhone Titanium Rim */}
      <div className="relative w-[340px] sm:w-[380px] h-[700px] sm:h-[760px] rounded-[52px] bg-[#1a1c22] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.15),0_0_40px_rgba(0,210,255,0.15)] ring-1 ring-white/10 transition-all duration-300">
        
        {/* Antenna bands */}
        <div className="absolute top-28 -left-[2px] w-[2px] h-3 bg-white/20" />
        <div className="absolute top-28 -right-[2px] w-[2px] h-3 bg-white/20" />
        <div className="absolute bottom-28 -left-[2px] w-[2px] h-3 bg-white/20" />
        <div className="absolute bottom-28 -right-[2px] w-[2px] h-3 bg-white/20" />

        {/* Hardware buttons on edges */}
        {/* Mute toggle / Action button */}
        <div className="absolute top-20 -left-[13px] w-[3px] h-7 bg-[#2e3340] rounded-l-md border-y border-l border-white/20" />
        {/* Volume Up */}
        <div className="absolute top-32 -left-[13px] w-[3px] h-11 bg-[#2e3340] rounded-l-md border-y border-l border-white/20" />
        {/* Volume Down */}
        <div className="absolute top-48 -left-[13px] w-[3px] h-11 bg-[#2e3340] rounded-l-md border-y border-l border-white/20" />
        {/* Power / Lock Button */}
        <div className="absolute top-36 -right-[13px] w-[3px] h-16 bg-[#2e3340] rounded-r-md border-y border-r border-white/20" />

        {/* Inner Glass Bezel Screen */}
        <div className="relative w-full h-full rounded-[44px] bg-[#020611] overflow-hidden flex flex-col border border-white/5 shadow-inner">
          
          {/* iOS Top Status Bar */}
          <div className="relative z-30 h-11 px-7 pt-2 flex items-center justify-between text-white text-[12px] font-medium tracking-tight">
            {/* Time */}
            <span className="font-semibold text-[13px] tracking-tight pl-1">9:41</span>

            {/* Dynamic Island Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-7 px-3 bg-black rounded-full flex items-center gap-2 border border-white/10 shadow-lg transition-all duration-300">
              {/* Ear Speaker Micro-slit */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#111827] border border-white/20" />
              
              {isConnected ? (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/80 font-sans text-[9px] font-semibold">1800-VI-247</span>
                  <span className="text-emerald-400 text-[9px] font-mono">{callDuration}</span>
                  {isIshaSpeaking && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <span className="w-0.5 h-2.5 bg-lime-400 animate-pulse" />
                      <span className="w-0.5 h-3.5 bg-lime-400 animate-pulse delay-75" />
                      <span className="w-0.5 h-1.5 bg-lime-400 animate-pulse delay-150" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[9px] text-white/50 tracking-wider">
                  <PhoneCall className="w-2.5 h-2.5 text-lime-400" />
                  <span className="font-semibold text-[8px] uppercase tracking-widest text-lime-300">IVR 24</span>
                </div>
              )}

              {/* Front Camera Sensor */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f1d] border border-white/20" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 pr-1">
              <Signal className="w-3.5 h-3.5 text-white/90" />
              <span className="text-[10px] font-bold text-white/80">5G</span>
              <Wifi className="w-3.5 h-3.5 text-white/90" />
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-[1px] flex items-center">
                  <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
                </div>
                <div className="w-[1.5px] h-1 bg-white/70 rounded-r-[1px]" />
              </div>
            </div>
          </div>

          {/* Screen Content Container */}
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="relative z-30 h-5 flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-white/40 rounded-full hover:bg-white/60 transition-colors cursor-pointer" />
          </div>

          {/* Glossy Diagonal Screen Glare */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-80" />
        </div>
      </div>
    </div>
  );
};
