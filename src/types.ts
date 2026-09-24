export interface CallerInfo {
  name: string;
  email: string;
  phone: string;
  plan?: SupportPlan;
  category?: string;
}

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export type CompanionMode = "live" | "recorded";

export type VoiceName = "Kore" | "Zephyr" | "Puck" | "Fenrir" | "Charon";

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: "Female" | "Male" | "Neutral";
  description: string;
  tone: string;
  color: string;
}

export interface CompanionPersona {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  accentColor: string;
  systemPrompt: string;
  suggestedTopics: string[];
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "gemini" | "system";
  text: string;
  timestamp: Date;
  audioBlobUrl?: string;
  isStreaming?: boolean;
}

export interface AudioMetrics {
  userLevel: number; // 0 - 1
  geminiLevel: number; // 0 - 1
  isUserSpeaking: boolean;
  isGeminiSpeaking: boolean;
}

// Venture Infotech Support Types
export type SupportPlan = "Silver Plan" | "Gold Plan" | "Platinum Plan";

export interface PlanDetails {
  id: SupportPlan;
  name: string;
  dailyPotential: string;
  keyFeatures: string[];
  recommendedFor: string;
  cosmofeedTarget: string;
}

export interface SupportTicket {
  id: string;
  clientName: string;
  clientPhone: string;
  plan: SupportPlan;
  concernCategory:
    | "Sales Promises vs Reality"
    | "Zero Sales / 48h Ad Testing"
    | "Offline Number Explanation"
    | "Ad Performance & Spend Update"
    | "Backup Execution Plan"
    | "Cancellation & Refund Request"
    | "Abuse / Policy Warning"
    | "General Enquiry";
  status: "Testing Active (48h)" | "Backup Plan Triggered" | "Escalation Queue" | "Closed / Resolved";
  adTestingWindow: {
    hoursElapsed: number;
    hoursTotal: number;
    statusText: string;
  };
  backupPlanExecuted: boolean;
  notes: string;
  createdAt: string;
}

export interface PolicyReference {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  rule: string;
  executiveAction: string;
}
