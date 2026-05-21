export interface Emotion {
  name: string;
  icon: string;
  color: string; // Tailwind bg color (e.g. 'bg-error')
  textClass: string; // Tailwind text color (e.g. 'text-error')
  borderClass: string; // Tailwind border color (e.g. 'border-error')
  glowClass: string; // CSS custom raw color for glowing drop shadows
  isNegative: boolean;
  intensity: number; // 0 - 100
  isFallbackActive?: boolean; // indicates fallback logic was active due to low confidence
}

export interface Message {
  id: string;
  sender: 'customer' | 'agent' | 'ai';
  text: string;
  timestamp: string;
  emotion?: Emotion;
  latencyMs?: number;
}

export interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  avatarUrl: string;
  status: 'active' | 'resolved' | 'escalated' | 'snoozed';
  messages: Message[];
  driftScore: number; // 0 - 1.00
  dominantEmotion: string;
  latencyMs: number;
  assignedAgent?: string;
  createdAt: string;
}

export interface HistoricalDriftRecord {
  id: string;
  ticketId: string;
  customerName: string;
  issue: string;
  peakEmotion: string;
  meanDriftScore: number;
  triggerTime: string;
  wasHandled: boolean;
  agentInvolved?: string;
  conversationSummary: string;
}

export interface AlertTrigger {
  id: string;
  ticketId: string;
  customerName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  driftScore: number;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  status: 'available' | 'busy' | 'offline';
  avgResponseTimeSec: number;
  satisfactionScore: number; // 0 - 5.0
  activeTickets: number;
}

export type TabName = 'live-stream' | 'landing-page' | 'analytics' | 'drift-history' | 'alerts' | 'team' | 'settings';
