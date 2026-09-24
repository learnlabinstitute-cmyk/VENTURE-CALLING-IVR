import React, { useState } from "react";
import { User, Mail, Phone, ShieldCheck, Headphones, ArrowRight, Sparkles } from "lucide-react";
import { CallerInfo } from "../types";
import { VentureLogo } from "./VentureLogo";

interface PreCallIntakeFormProps {
  onStartCall: (caller: CallerInfo) => void;
  initialCaller?: Partial<CallerInfo>;
}

export const PreCallIntakeForm: React.FC<PreCallIntakeFormProps> = ({
  onStartCall,
  initialCaller,
}) => {
  const [name, setName] = useState(initialCaller?.name || "Rohan Sharma");
  const [email, setEmail] = useState(initialCaller?.email || "rohan.sharma@venturestore.in");
  const [phone, setPhone] = useState(initialCaller?.phone || "+91 98765 43210");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Please enter your name";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Valid email required";
    if (!phone.trim() || phone.length < 8) newErrors.phone = "Valid phone number required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onStartCall({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  const handleQuickDemoFill = (presetName: string, presetEmail: string, presetPhone: string) => {
    setName(presetName);
    setEmail(presetEmail);
    setPhone(presetPhone);
    setErrors({});
  };

  return (
    <div className="w-full max-w-xl mx-auto my-auto p-4 sm:p-6">
      {/* Container Card */}
      <div className="relative rounded-3xl bg-[#07111e]/90 border border-lime-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(132,204,22,0.1)] backdrop-blur-xl p-6 sm:p-8 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-lime-500/15 via-emerald-500/5 to-transparent pointer-events-none rounded-full blur-2xl" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center relative z-10">
          <VentureLogo size="lg" variant="full" showSubtitle={false} />
          
          <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/25 text-lime-300 text-[11px] font-semibold tracking-wider uppercase">
            <Headphones className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
            <span>Support 24 • Client Verification Portal</span>
          </div>

          <p className="mt-2 text-xs sm:text-sm text-white/60 font-light max-w-md leading-relaxed">
            Please verify your client credentials to connect directly with <strong className="text-white font-medium">Isha</strong> on the official recorded IVR line.
          </p>
        </div>

        {/* Quick Demo Pre-fill Pill (Helpful for quick test) */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-center gap-2 text-[10px]">
          <span className="text-white/40 flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3 text-lime-400" /> Quick profiles:
          </span>
          <button
            type="button"
            onClick={() => handleQuickDemoFill("Rohan Sharma", "rohan.sharma@venturestore.in", "+91 98765 43210")}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-lime-500/15 text-white/70 hover:text-lime-300 border border-white/10 transition-colors cursor-pointer"
          >
            Rohan Sharma
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoFill("Priya Verma", "priya.verma@mybrand.com", "+91 98112 34567")}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-lime-500/15 text-white/70 hover:text-lime-300 border border-white/10 transition-colors cursor-pointer"
          >
            Priya Verma
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
          {/* 1. Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Client Name <span className="text-lime-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Vikram Malhotra"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border ${
                  errors.name ? "border-rose-500/80" : "border-white/10 focus:border-lime-400"
                } text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-lime-400/50 transition-all font-sans`}
              />
            </div>
            {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* 2. Email & Phone (2 Cols on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Registered Email <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="name@mybrand.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border ${
                    errors.email ? "border-rose-500/80" : "border-white/10 focus:border-lime-400"
                  } text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-lime-400/50 transition-all`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Calling Phone Number <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border ${
                    errors.phone ? "border-rose-500/80" : "border-white/10 focus:border-lime-400"
                  } text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-lime-400/50 transition-all font-mono`}
                />
              </div>
              {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Compliance & SOP Notice */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-[10.5px] text-white/50 leading-relaxed font-light">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>
              Calls are connected to <strong className="text-white/80 font-medium">1800-VI-247</strong> on an encrypted line. Executive conversations are logged under Venture Infotech Solution Quality SOP & Anti-Harassment policy.
            </p>
          </div>

          {/* Submit & Dial Button */}
          <div className="pt-2">
            <button
              id="dial-ivr-btn"
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 hover:from-lime-400 hover:to-teal-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-200 shadow-[0_10px_30px_rgba(132,204,22,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Dial Support 24 • Connect with Isha</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
