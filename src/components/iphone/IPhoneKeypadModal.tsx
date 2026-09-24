import React, { useState } from "react";
import { X, Delete, CheckCircle2 } from "lucide-react";
import { playDTMFTone } from "../../utils/audioUtils";
import { SupportPlan } from "../../types";

interface IPhoneKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlanByDigit?: (plan: SupportPlan) => void;
  onSendDigitMessage?: (digit: string) => void;
  selectedPlan: SupportPlan;
}

const KEYS = [
  { num: "1", sub: "SILVER PLAN", plan: "Silver Plan" as SupportPlan },
  { num: "2", sub: "ABC • GOLD", plan: "Gold Plan" as SupportPlan },
  { num: "3", sub: "DEF • PLATINUM", plan: "Platinum Plan" as SupportPlan },
  { num: "4", sub: "GHI" },
  { num: "5", sub: "JKL" },
  { num: "6", sub: "MNO" },
  { num: "7", sub: "PQRS" },
  { num: "8", sub: "TUV" },
  { num: "9", sub: "WXYZ" },
  { num: "*", sub: "" },
  { num: "0", sub: "+" },
  { num: "#", sub: "" },
];

export const IPhoneKeypadModal: React.FC<IPhoneKeypadModalProps> = ({
  isOpen,
  onClose,
  onSelectPlanByDigit,
  onSendDigitMessage,
  selectedPlan,
}) => {
  const [dialedString, setDialedString] = useState("");

  if (!isOpen) return null;

  const handleKeyPress = (key: typeof KEYS[0]) => {
    playDTMFTone(key.num);
    const newDialed = dialedString + key.num;
    setDialedString(newDialed);

    if (key.plan && onSelectPlanByDigit) {
      onSelectPlanByDigit(key.plan);
    }
    if (onSendDigitMessage) {
      onSendDigitMessage(key.num);
    }
  };

  const handleBackspace = () => {
    setDialedString((prev) => prev.slice(0, -1));
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col justify-between p-5 text-white animate-in fade-in duration-200">
      {/* Top Keypad Bar */}
      <div className="flex items-center justify-between pt-3 pb-2 border-b border-white/10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-lime-400">
            IVR Touch Tone Keypad
          </span>
          <span className="text-[11px] text-white/50">Press 1, 2, or 3 to verify plan</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          title="Close Keypad"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Dialed Display */}
      <div className="min-h-[50px] flex items-center justify-center relative px-4">
        <span className="text-3xl font-light tracking-[0.25em] text-white font-mono">
          {dialedString || <span className="text-white/20">Press digits...</span>}
        </span>
        {dialedString && (
          <button
            onClick={handleBackspace}
            className="absolute right-4 p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Plan IVR Quick Hints */}
      <div className="grid grid-cols-3 gap-1.5 px-2 py-1 bg-white/[0.03] rounded-xl border border-white/10 text-center text-[9px]">
        <div className={`p-1 rounded ${selectedPlan === "Silver Plan" ? "bg-lime-500/20 text-lime-300 font-bold border border-lime-500/30" : "text-white/60"}`}>
          [1] Silver
        </div>
        <div className={`p-1 rounded ${selectedPlan === "Gold Plan" ? "bg-lime-500/20 text-lime-300 font-bold border border-lime-500/30" : "text-white/60"}`}>
          [2] Gold
        </div>
        <div className={`p-1 rounded ${selectedPlan === "Platinum Plan" ? "bg-lime-500/20 text-lime-300 font-bold border border-lime-500/30" : "text-white/60"}`}>
          [3] Platinum
        </div>
      </div>

      {/* Keypad Grid (3 columns x 4 rows) */}
      <div className="grid grid-cols-3 gap-y-3 gap-x-4 px-3 max-w-[280px] mx-auto w-full my-auto">
        {KEYS.map((k) => (
          <button
            key={k.num}
            onClick={() => handleKeyPress(k)}
            className="group relative flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-white/25 active:bg-lime-500/40 border border-white/10 active:scale-95 transition-all shadow-md mx-auto cursor-pointer"
          >
            <span className="text-2xl font-normal leading-none tracking-tight text-white group-active:text-lime-200">
              {k.num}
            </span>
            {k.sub && (
              <span className="text-[7.5px] uppercase font-semibold tracking-wider text-white/50 group-active:text-lime-300 mt-0.5">
                {k.sub}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Hide Keypad Button */}
      <div className="pb-3 flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider uppercase text-white/80 transition-colors"
        >
          Hide Keypad
        </button>
      </div>
    </div>
  );
};
