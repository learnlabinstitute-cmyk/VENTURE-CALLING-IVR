import React from "react";
import { X, ShieldAlert, FileText, AlertTriangle, Clock, RefreshCw, Lock } from "lucide-react";

interface IPhonePolicySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IPhonePolicySheet: React.FC<IPhonePolicySheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border-t border-white/15 rounded-t-[32px] p-4 text-white max-h-[85%] overflow-y-auto scrollbar-thin">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              Company Legal & Operational SOP
            </span>
            <h3 className="text-sm font-bold text-white">Venture Infotech Policies</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-3 my-3 text-[10.5px]">
          {/* 1. Cancellation & Refund Policy */}
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                1. Cancellation & Refund Policy
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[8px] font-bold uppercase">
                Strictly Non-Refundable
              </span>
            </div>
            <p className="text-white/70 text-[10px] leading-relaxed">
              Jab client project start karne ke liye agree kar leta hai, fee pay kar deta hai, aur unhe store credentials, website, ya ad manager access mil jata hai, tab project officially operational ho jata hai. Digital services non-refundable category mein aati hain. Personal change of mind ya initial days mein immediate sales na aane par refund nahi milta. Legal chargeback agreement ka breach maana jata hai.
            </p>
          </div>

          {/* 2. 48-Hour Ad Testing & Backup Plan */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-[11px] flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                2. 48-Hour Ad Testing & Backup Plan
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-bold uppercase">
                Algorithm Window
              </span>
            </div>
            <p className="text-white/70 text-[10px] leading-relaxed">
              Ad system algorithm ko target audience fetch karne ke liye minimum 48 hours lagte hain. Is dauran ad pause karne se testing reset ho jati hai. Agar 48h testing ke baad bhi Cosmofeed/Razorpay dashboard mein sales slow rehti hain, toh instant Backup Plan execute hoga: Top clients ke Hot-Selling Winning Products direct store par copy-paste import honge + tested ad creatives deploy honge.
            </p>
          </div>

          {/* 3. Earning Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                3. Earning Disclaimer
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold uppercase">
                Benchmark Only
              </span>
            </div>
            <p className="text-white/70 text-[10px] leading-relaxed">
              Sales projections (Silver ₹2k, Gold ₹3.5k, Platinum ₹5.5k/day) hamaare top-performing existing normal clients ke live records par based aspirational capability potential hain. Ye koi fixed guaranteed income nahi hai. Individual results market response par depend karte hain.
            </p>
          </div>

          {/* 4. Anti-Harassment & Zero Tolerance */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 text-[11px] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-purple-400" />
                4. Anti-Harassment & Zero Tolerance
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[8px] font-bold uppercase">
                2-Warning SOP
              </span>
            </div>
            <p className="text-white/70 text-[10px] leading-relaxed">
              Support calling par gaali-galoch, abusive language, continuous shouting, ya personal attacks strictly prohibited hain. First Warning di jayegi; repeated misbehavior par active ticket suspend karke call disconnect kar di jayegi aur matter Legal Escalation Cell ko forward hoga.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Close Policies
        </button>
      </div>
    </div>
  );
};
