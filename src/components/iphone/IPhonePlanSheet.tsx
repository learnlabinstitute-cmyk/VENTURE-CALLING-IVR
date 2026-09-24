import React from "react";
import { X, CheckCircle2, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { SupportPlan } from "../../types";

interface IPhonePlanSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SupportPlan;
  onSelectPlan: (plan: SupportPlan) => void;
}

const PLANS_DATA: {
  id: SupportPlan;
  title: string;
  badge: string;
  dailyPotential: string;
  features: string[];
  cosmofeedTarget: string;
}[] = [
  {
    id: "Silver Plan",
    title: "Silver Package",
    badge: "Starter",
    dailyPotential: "₹2,000 / day potential",
    features: [
      "Standard E-com Store Setup",
      "48-Hour Ad Algorithm Testing Window",
      "Top-Client Winning Product Backup Eligible",
      "Daily End-of-Day Email Report",
    ],
    cosmofeedTarget: "Direct Cosmofeed / Razorpay Payout",
  },
  {
    id: "Gold Plan",
    title: "Gold Package",
    badge: "Popular Growth",
    dailyPotential: "₹3,500 / day potential",
    features: [
      "Targeted Audience Testing (48h)",
      "High-Converting Ad Creatives Suite",
      "Priority Winning Product Copy-Paste Import",
      "Cosmofeed Live Revenue Tracking",
    ],
    cosmofeedTarget: "Direct Cosmofeed / Razorpay Payout",
  },
  {
    id: "Platinum Plan",
    title: "Platinum Package",
    badge: "Enterprise Scale",
    dailyPotential: "₹5,500 / day potential",
    features: [
      "Agency Ad Account Setup",
      "Instant Winning & Hot-Selling Product Import",
      "Fast-Track Backup Execution Plan",
      "Dedicated IVR Support Escalation",
    ],
    cosmofeedTarget: "Direct Cosmofeed / Razorpay Payout",
  },
];

export const IPhonePlanSheet: React.FC<IPhonePlanSheetProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onSelectPlan,
}) => {
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
              <Zap className="w-3 h-3 text-cyan-400" />
              Client Plan Verification
            </span>
            <h3 className="text-sm font-bold text-white">Select Your Package</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Plan Cards */}
        <div className="space-y-2.5 my-3">
          {PLANS_DATA.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => {
                  onSelectPlan(plan.id);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-cyan-300" : "text-white"
                      }`}
                    >
                      {plan.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-semibold bg-white/10 text-white/70">
                      {plan.badge}
                    </span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/30" />
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold font-mono">
                    {plan.dailyPotential}
                  </span>
                  <span className="text-[9px] text-white/50">Aspirational Benchmark</span>
                </div>

                <div className="mt-2 text-[9.5px] text-white/60 space-y-0.5">
                  {plan.features.slice(0, 2).map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] text-white/50 space-y-1">
          <p className="flex items-center gap-1 text-sky-300 font-medium">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            Earning Disclaimer:
          </p>
          <p>
            Figures represent live capability benchmarks of top-performing clients, not a fixed guaranteed daily return. Results depend on 48h market testing.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
        >
          Confirm Plan & Verify with Isha
        </button>
      </div>
    </div>
  );
};
