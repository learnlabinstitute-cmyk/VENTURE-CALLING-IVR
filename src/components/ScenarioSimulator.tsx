import React, { useState } from "react";
import { Play, Send, Mic, MicOff, Sparkles, MessageSquare, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { SupportPlan } from "../types";

interface ScenarioSimulatorProps {
  onTriggerScenario: (userMessage: string) => void;
  onSendCustomMessage: (message: string) => void;
  isCallConnected: boolean;
  onStartCallAndSend: (message: string) => void;
  selectedPlan: SupportPlan;
  onSelectPlan: (plan: SupportPlan) => void;
}

interface TestScenario {
  id: string;
  category: string;
  title: string;
  clientMessage: string;
  badge: string;
  color: string;
  expectedFlow: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: "sc-sales-promises",
    category: "Sales Promises vs Reality",
    title: "Daily Thousands Sales Promise",
    clientMessage: "Sales executive ne toh mujhe bola tha ki daily thousands ki sales aayegi! Unhone jhoot bola tha kya?",
    badge: "Empathetic Pivot",
    color: "border-sky-500/40 text-sky-300 bg-sky-950/20",
    expectedFlow: "Explains top-client benchmark without blame game. Pivots to 48h ad testing & Backup Plan.",
  },
  {
    id: "sc-ad-off",
    category: "Zero Sales & Ad Control",
    title: "Zero Sales - Turn Ad OFF Now",
    clientMessage: "Mera ad chal raha hai par sales nahi aa rahi, ad abhi OFF kar do!",
    badge: "48h Algorithm Window",
    color: "border-cyan-500/40 text-cyan-300 bg-cyan-950/20",
    expectedFlow: "Explains why stopping ads within 48h resets audience discovery. Assures Backup Plan if slow.",
  },
  {
    id: "sc-offline-num",
    category: "Communication Channels",
    title: "Number Offline After Disconnect",
    clientMessage: "Mera phone disconnect hone par number offline kyu batata hai?",
    badge: "Dedicated IVR",
    color: "border-blue-500/40 text-blue-300 bg-blue-950/20",
    expectedFlow: "Clarifies dedicated official IVR recording & quality control policy.",
  },
  {
    id: "sc-ad-update",
    category: "Reporting & Revenue",
    title: "Where to Check Daily Ad Updates",
    clientMessage: "Ad ka daily performance update aur spend report kahan milta hai?",
    badge: "End-of-Day Email",
    color: "border-emerald-500/40 text-emerald-300 bg-emerald-950/20",
    expectedFlow: "Points to official End-of-Day email report & live Cosmofeed/Razorpay dashboard revenue.",
  },
  {
    id: "sc-backup-plan",
    category: "Resolution Strategy",
    title: "How Backup Plan Works",
    clientMessage: "Backup Execution Plan kya hai aur mere store par kaise execute hoga?",
    badge: "Winning Product Copy-Paste",
    color: "border-indigo-500/40 text-indigo-300 bg-indigo-950/20",
    expectedFlow: "Explains instant import of hot-selling top-client products + tested creatives + direct payout.",
  },
  {
    id: "sc-refund",
    category: "Policies & Terms",
    title: "Cancel & Demand Full Refund",
    clientMessage: "Mujhe store cancel karke poora refund chahiye, mujhe nahi chalana!",
    badge: "Strictly Non-Refundable",
    color: "border-rose-500/40 text-rose-300 bg-rose-950/20",
    expectedFlow: "Explains non-refundable digital service agreement & offers to execute Backup Plan.",
  },
  {
    id: "sc-abuse",
    category: "Anti-Harassment SOP",
    title: "Angry Shouting & Abusive Language",
    clientMessage: "Tum log fraud ho! Mujhe mera paisa wapas karo warna sabki aisi taisi kar dunga!",
    badge: "First Warning SOP",
    color: "border-purple-500/40 text-purple-300 bg-purple-950/20",
    expectedFlow: "Issues polite First Warning under Anti-Harassment & Zero Tolerance Policy.",
  },
];

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  onTriggerScenario,
  onSendCustomMessage,
  isCallConnected,
  onStartCallAndSend,
  selectedPlan,
  onSelectPlan,
}) => {
  const [customInput, setCustomInput] = useState("");

  const handleRun = (scenario: TestScenario) => {
    if (!isCallConnected) {
      onStartCallAndSend(scenario.clientMessage);
    } else {
      onTriggerScenario(scenario.clientMessage);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!isCallConnected) {
      onStartCallAndSend(customInput.trim());
    } else {
      onSendCustomMessage(customInput.trim());
    }
    setCustomInput("");
  };

  return (
    <div className="w-full flex flex-col rounded-3xl bg-[#090f1e]/90 border border-white/10 shadow-2xl backdrop-blur-md p-4 sm:p-5 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              IVR Scenario Simulation Deck
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300 font-mono">
                7 Scenarios
              </span>
            </h3>
            <p className="text-[11px] text-white/50">
              Click any scenario to simulate caller query in authentic Hinglish with Isha
            </p>
          </div>
        </div>

        {/* Selected Plan Selector Chip */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] uppercase font-bold text-white/40 px-2">Plan:</span>
          {(["Silver Plan", "Gold Plan", "Platinum Plan"] as SupportPlan[]).map((plan) => (
            <button
              key={plan}
              onClick={() => onSelectPlan(plan)}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                selectedPlan === plan
                  ? "bg-cyan-500 text-black font-bold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {plan.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-3.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
        {TEST_SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className={`p-3 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${sc.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-white/60">
                  {sc.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase bg-black/40 border border-white/10 text-white/90">
                  {sc.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{sc.title}</h4>
              <p className="text-[11px] text-white/80 italic line-clamp-2 mb-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
                "{sc.clientMessage}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9.5px]">
              <span className="text-white/50 line-clamp-1">{sc.expectedFlow}</span>
              <button
                onClick={() => handleRun(sc)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-cyan-500 hover:text-black font-bold uppercase tracking-wider text-[9px] transition-all flex-shrink-0 ml-2"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Simulate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Caller Message Input */}
      <form
        onSubmit={handleCustomSubmit}
        className="mt-1 pt-3 border-t border-white/10 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type custom client query (e.g. 'Mera Platinum plan verify karo')..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Speak</span>
        </button>
      </form>
    </div>
  );
};
