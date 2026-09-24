import React from "react";

interface VentureLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "full" | "horizontal" | "emblem";
  className?: string;
  showSubtitle?: boolean;
}

export const VentureLogo: React.FC<VentureLogoProps> = ({
  size = "md",
  variant = "horizontal",
  className = "",
  showSubtitle = true,
}) => {
  const emblemSizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    xs: { main: "text-xs tracking-[0.12em]", sub: "text-[7px] tracking-[0.2em]" },
    sm: { main: "text-sm tracking-[0.14em]", sub: "text-[8px] tracking-[0.22em]" },
    md: { main: "text-base tracking-[0.16em]", sub: "text-[9px] tracking-[0.25em]" },
    lg: { main: "text-xl tracking-[0.18em]", sub: "text-xs tracking-[0.28em]" },
    xl: { main: "text-2xl tracking-[0.2em]", sub: "text-sm tracking-[0.3em]" },
  };

  // 3D Twisted Helix Ribbon Logo (matching Venture Infotech Solution uploaded image)
  const renderEmblem = () => (
    <div className={`${emblemSizes[size]} flex-shrink-0 relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)] select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top fold gradient */}
          <linearGradient id="topRibbonGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Bottom fold gradient */}
          <linearGradient id="bottomRibbonGrad" x1="80%" y1="100%" x2="20%" y2="0%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Left loop chartreuse accent */}
          <linearGradient id="leftLoopGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="60%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          {/* Right loop chartreuse accent */}
          <linearGradient id="rightLoopGrad" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="60%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          {/* Center twist inner shadow */}
          <linearGradient id="innerShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14532d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0.3" />
          </linearGradient>

          <radialGradient id="greenAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Soft Glow */}
        <circle cx="60" cy="60" r="50" fill="url(#greenAura)" />

        {/* Outer Helix Ribbon Fold - Top Leaf to Left Loop */}
        <path
          d="M60,10 C68,10 75,20 70,36 C64,52 42,54 36,66 C30,78 36,92 50,96 C32,94 22,80 25,64 C28,48 48,46 56,34 C62,24 58,12 60,10 Z"
          fill="url(#topRibbonGrad)"
        />

        {/* S-Ribbon Upper Loop */}
        <path
          d="M60,10 C50,12 36,24 38,40 C40,54 58,56 64,68 C70,80 66,94 60,110 C70,108 84,96 82,80 C80,66 62,64 56,52 C50,40 54,26 60,10 Z"
          fill="url(#leftLoopGrad)"
        />

        {/* Lower Leaf to Right Loop */}
        <path
          d="M60,110 C52,110 45,100 50,84 C56,68 78,66 84,54 C90,42 84,28 70,24 C88,26 98,40 95,56 C92,72 72,74 64,86 C58,96 62,108 60,110 Z"
          fill="url(#bottomRibbonGrad)"
        />

        {/* Right Chartreuse Outer Curl */}
        <path
          d="M84,54 C92,62 96,74 88,88 C80,102 68,108 60,110 C68,104 76,94 76,82 C76,70 68,64 64,56 C74,52 80,52 84,54 Z"
          fill="url(#rightLoopGrad)"
        />

        {/* 3D Center Crease Highlights */}
        <path
          d="M48,50 C54,58 64,62 70,70 C64,66 56,60 50,54 Z"
          fill="#bef264"
          opacity="0.8"
        />
        <path
          d="M62,40 C56,48 46,52 40,60 C46,54 54,50 60,44 Z"
          fill="url(#innerShadowGrad)"
        />
      </svg>
    </div>
  );

  if (variant === "emblem") {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderEmblem()}</div>;
  }

  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {renderEmblem()}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black text-white tracking-[0.14em] uppercase leading-none font-sans ${textSizes[size].main}`}
            >
              VENTURE <span className="text-[#84cc16]">INFOTECH</span> <span className="text-white/80 text-[80%] font-light">SOLUTION</span>
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span
                className={`font-semibold text-lime-300 tracking-[0.24em] uppercase leading-none ${textSizes[size].sub}`}
              >
                SUPPORT 24 • CALLING IVR
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {renderEmblem()}
      <div className="mt-2.5 flex flex-col items-center">
        <h1
          className={`font-black text-white tracking-[0.16em] uppercase leading-tight font-sans ${textSizes[size].main}`}
        >
          VENTURE <span className="text-[#84cc16]">INFOTECH</span>
        </h1>
        <span className="text-xs text-lime-400/90 font-semibold tracking-[0.24em] uppercase mt-0.5">
          SOLUTION
        </span>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#84cc16] to-transparent my-1.5 opacity-90" />
        {showSubtitle && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <p
              className={`font-semibold text-emerald-300 tracking-[0.24em] uppercase leading-snug ${textSizes[size].sub}`}
            >
              SUPPORT 24 • CALLING IVR
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

