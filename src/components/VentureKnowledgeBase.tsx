import React from "react";
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  FileCheck2,
  AlertOctagon,
  PhoneCall,
  ExternalLink,
  Zap,
} from "lucide-react";
import { SupportPlan } from "../types";

interface VentureKnowledgeBaseProps {
  selectedPlan: SupportPlan;
  onSelectPlan: (plan: SupportPlan) => void;
}

export const VentureKnowledgeBase: React.FC<VentureKnowledgeBaseProps> = ({
  selectedPlan,
  onSelectPlan,
}) => {
  const planEarnings: Record<SupportPlan, { benchmark: string; target: string }> = {
    "Silver Plan": { benchmark: "₹2,000 / day", target: "Cosmofeed / Razorpay" },
    "Gold Plan": { benchmark: "₹3,500 / day", target: "Cosmofeed / Razorpay" },
    "Platinum Plan": { benchmark: "₹5,500 / day", target: "Cosmofeed / Razorpay" },
  };

  return (
    <div className="w-full flex flex-col rounded-3xl bg-[#090f1e]/90 border border-white/10 shadow-2xl backdrop-blur-md p-4 sm:p-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Venture Infotech Support Operations & Ticket
            </h3>
            <p className="text-[11px] text-white/50">
              Live IVR integration with Ad Manager, Cosmofeed payouts & SOP rules
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[9.5px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          IVR Queue: Active
        </span>
      </div>

      {/* Ticket Details & 48h Ad Testing Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
        {/* Active Ticket Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] text-white/60 mb-2">
              <span className="font-mono text-cyan-300 font-bold">Ticket #VI-8924</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9px] font-semibold">
                Store ID: #STORE-992
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">Enrolled Package:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {selectedPlan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">Capability Benchmark:</span>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">
                  {planEarnings[selectedPlan].benchmark} (Top Clients)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">Direct Payout Gateway:</span>
                <span className="font-semibold text-sky-200 text-[11px]">
                  Cosmofeed / Razorpay
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-white/60">
            <span>Daily Reporting:</span>
            <span className="text-white font-medium">Official End-of-Day Email</span>
          </div>
        </div>

        {/* 48-Hour Ad Algorithm Testing Window Card */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                48-Hour Ad Testing Window
              </span>
              <span className="text-[10px] font-mono text-cyan-200 font-bold">19 / 48 hrs</span>
            </div>
            <p className="text-[10.5px] text-white/70 leading-snug mb-2">
              Ad system algorithm is testing audience segments to find high-converting buyers.
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-[1px] border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: "40%" }}
              />
            </div>
          </div>

          {/* Backup Plan Trigger Status */}
          <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[9.5px]">
            <span className="text-cyan-200 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Backup Execution Plan:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              Ready to Deploy If Sales Slow
            </span>
          </div>
        </div>
      </div>

      {/* SOP Executive Rules Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-bold text-rose-300 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            Strictly Non-Refundable
          </span>
          <p className="text-white/60 text-[9px] leading-relaxed">
            Digital services are non-refundable once store credentials and ad manager are active.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-bold text-sky-300 flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-sky-400" />
            Dedicated IVR System
          </span>
          <p className="text-white/60 text-[9px] leading-relaxed">
            All calls are routed through recorded official IVR lines. Personal offline numbers blocked.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-bold text-purple-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            Anti-Harassment 2-Warning
          </span>
          <p className="text-white/60 text-[9px] leading-relaxed">
            1st warning for abuse; 2nd warning clean disconnect & ticket escalation.
          </p>
        </div>
      </div>
    </div>
  );
};
