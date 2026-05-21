import { Emotion, Ticket, TeamMember, HistoricalDriftRecord, AlertTrigger } from '../types';

export const EMOTIONS: Record<string, Emotion> = {
  neutral: {
    name: 'NEUTRAL',
    icon: 'sentiment_neutral',
    color: 'bg-on-surface-variant/40',
    textClass: 'text-on-surface-variant',
    borderClass: 'border-white/10',
    glowClass: 'transparent',
    isNegative: false,
    intensity: 92
  },
  confusion: {
    name: 'CONFUSED',
    icon: 'sentiment_neutral',
    color: 'bg-tertiary',
    textClass: 'text-tertiary',
    borderClass: 'border-tertiary/20',
    glowClass: 'rgba(217, 119, 33, 0.2)',
    isNegative: true,
    intensity: 78
  },
  danger: {
    name: 'ANGRY',
    icon: 'sentiment_very_dissatisfied',
    color: 'bg-error',
    textClass: 'text-error',
    borderClass: 'border-error/30',
    glowClass: 'rgba(255, 180, 171, 0.4)',
    isNegative: true,
    intensity: 98
  },
  happy: {
    name: 'SATISFIED',
    icon: 'sentiment_satisfied',
    color: 'bg-primary',
    textClass: 'text-primary',
    borderClass: 'border-primary/20',
    glowClass: 'rgba(192, 193, 255, 0.3)',
    isNegative: false,
    intensity: 85
  },
  puzzled: {
    name: 'CONFUSED',
    icon: 'sentiment_neutral',
    color: 'bg-tertiary',
    textClass: 'text-tertiary',
    borderClass: 'border-tertiary/20',
    glowClass: 'rgba(217, 119, 33, 0.2)',
    isNegative: true,
    intensity: 90
  }
};

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-8492',
    subject: 'Delayed Shipping & Delivery Issue',
    customerName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    status: 'escalated',
    driftScore: 0.95,
    dominantEmotion: 'ANGRY',
    latencyMs: 42,
    createdAt: '2026-05-21T12:01:00Z',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        text: "I'm having trouble with my order. It says delivered but I don't see anything.",
        timestamp: '12:01 PM',
        emotion: EMOTIONS.neutral,
        latencyMs: 38
      },
      {
        id: 'msg-2',
        sender: 'ai',
        text: 'I understand how frustrating that can be. Let me check the carrier logs for you immediately. Can you confirm the address?',
        timestamp: '12:02 PM',
        latencyMs: 44
      },
      {
        id: 'msg-3',
        sender: 'customer',
        text: 'Wait, why is this so difficult? I already gave my address twice in the automated prompt before this.',
        timestamp: '12:03 PM',
        emotion: EMOTIONS.confusion,
        latencyMs: 41
      },
      {
        id: 'msg-4',
        sender: 'customer',
        text: "This is ridiculous. I need to talk to a person who actually knows what they're doing. Now.",
        timestamp: '12:05 PM',
        emotion: EMOTIONS.danger,
        latencyMs: 45
      }
    ]
  },
  {
    id: 'TKT-1084',
    subject: 'Billing discrepancy on upgrade premium tier',
    customerName: 'Marcus Alva',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    status: 'active',
    driftScore: 0.44,
    dominantEmotion: 'CONFUSED',
    latencyMs: 51,
    createdAt: '2026-05-21T13:10:00Z',
    messages: [
      {
        id: 'msg-5',
        sender: 'customer',
        text: 'Hello, my card was charged twice for the monthly renewal. Can you cross-check?',
        timestamp: '01:10 PM',
        emotion: EMOTIONS.neutral,
        latencyMs: 49
      },
      {
        id: 'msg-6',
        sender: 'ai',
        text: 'Certainly! I am searching the stripe billing records. Ah, I see a transient charge that will be reversed. One second...',
        timestamp: '01:11 PM',
        latencyMs: 50
      },
      {
        id: 'msg-7',
        sender: 'customer',
        text: "Wait, so is it reversed already or will it happen later? I don't want to get overdrawn.",
        timestamp: '01:12 PM',
        emotion: EMOTIONS.confusion,
        latencyMs: 48
      }
    ]
  },
  {
    id: 'TKT-9021',
    subject: 'API integration returning 502 Bad Gateway',
    customerName: 'Aria Thompson',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    status: 'resolved',
    driftScore: 0.12,
    dominantEmotion: 'SATISFIED',
    latencyMs: 38,
    createdAt: '2026-05-21T09:15:00Z',
    messages: [
      {
        id: 'msg-8',
        sender: 'customer',
        text: "Hi, our backend systems are seeing a flood of 502 errors when calling your webhook endpoints.",
        timestamp: '09:15 AM',
        emotion: EMOTIONS.puzzled,
        latencyMs: 40
      },
      {
        id: 'msg-9',
        sender: 'ai',
        text: 'This was a known incident regarding our East Coast DNS servers. We just deployed a redirection patch.',
        timestamp: '09:17 AM',
        latencyMs: 35
      },
      {
        id: 'msg-10',
        sender: 'customer',
        text: "Wow, that solved it immediately! Calls are green now. Appreciate the high response speed!",
        timestamp: '09:19 AM',
        emotion: EMOTIONS.happy,
        latencyMs: 39
      }
    ]
  }
];

export const MOCK_DRIFT_HISTORY: HistoricalDriftRecord[] = [
  {
    id: 'DR-01',
    ticketId: 'TKT-8492',
    customerName: 'Sarah Jenkins',
    issue: 'Delayed Shipping & Delivery Issue',
    peakEmotion: 'ANGRY',
    meanDriftScore: 0.88,
    triggerTime: '2026-05-21 12:05:42',
    wasHandled: true,
    agentInvolved: 'Jason Statham',
    conversationSummary: 'Customer stated delivery notification showed but package missing. Frustration amplified when system requested address verification twice. Gracefully transferred to Jason for manual log analysis.'
  },
  {
    id: 'DR-02',
    ticketId: 'TKT-7612',
    customerName: 'David Zhang',
    issue: 'Wrong items inside custom order box',
    peakEmotion: 'CONFUSED',
    meanDriftScore: 0.65,
    triggerTime: '2026-05-20 18:42:12',
    wasHandled: true,
    agentInvolved: 'Emily Blunt',
    conversationSummary: 'Customer ordered dynamic telemetry widgets but received structural frames. Transfer triggered at second repetition of mismatch phrases.'
  },
  {
    id: 'DR-03',
    ticketId: 'TKT-4122',
    customerName: 'Oliver Smith',
    issue: 'Cancellation link leads to blank dashboard page',
    peakEmotion: 'ANGRY',
    meanDriftScore: 0.79,
    triggerTime: '2026-05-20 14:10:05',
    wasHandled: false,
    conversationSummary: 'Frustration grew when AI replied with automated template directions to cancellation routes that were currently broken. Escalation alert snoozed twice before breaching standard SLAs.'
  }
];

export const MOCK_ALERTS: AlertTrigger[] = [
  {
    id: 'AL-1',
    ticketId: 'TKT-8492',
    customerName: 'Sarah Jenkins',
    severity: 'critical',
    driftScore: 0.95,
    description: "SLA Drift Velocity peaked. Sentiment vector shifted 80% to 'Hostile' in 140s.",
    timestamp: '2026-05-21T12:05:00Z',
    isRead: false
  },
  {
    id: 'AL-2',
    ticketId: 'TKT-1084',
    customerName: 'Marcus Alva',
    severity: 'medium',
    driftScore: 0.44,
    description: "Double charge friction detected with repeated 'wait, is it' phrases.",
    timestamp: '2026-05-21T13:12:00Z',
    isRead: false
  }
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'TM-1',
    name: 'Emily Blunt',
    role: 'Senior Retentions Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    status: 'available',
    avgResponseTimeSec: 14,
    satisfactionScore: 4.8,
    activeTickets: 2
  },
  {
    id: 'TM-2',
    name: 'Jason Statham',
    role: 'Logistics Supervisor',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    status: 'busy',
    avgResponseTimeSec: 28,
    satisfactionScore: 4.9,
    activeTickets: 4
  },
  {
    id: 'TM-3',
    name: 'Hugh Jackman',
    role: 'Technical Support Tier-2',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    status: 'available',
    avgResponseTimeSec: 19,
    satisfactionScore: 4.7,
    activeTickets: 1
  }
];

export const SIMULATION_TEMPLATES = [
  {
    title: 'Subscription Cancel Rage',
    description: 'High-risk cancellations turning highly defensive due to refund limits.',
    startText: "I am trying to cancel my subscription and get my money back. Your website is extremely opaque.",
    steps: [
      {
        sender: 'customer',
        text: "I am trying to cancel my subscription and get my money back. Your website is extremely opaque.",
        emotionName: 'neutral',
        driftScore: 0.15
      },
      {
        sender: 'ai',
        text: "I understand you wish to cancel your subscription. I can certainly help guide you through the process. May I ask what is prompting the cancellation today so we can improve?"
      },
      {
        sender: 'customer',
        text: "Your chatbot is just copy-pasting policies. Give me my refund now! I've been a loyal customer for 2 years and this billing barrier is ridiculous.",
        emotionName: 'frustrated',
        driftScore: 0.55
      },
      {
        sender: 'ai',
        text: "I sincerely apologize for the automated template. I am checking our billing records right now to see if we can process an immediate exception refund for you."
      },
      {
        sender: 'customer',
        text: "This is flat out theft. If I don't see a live human in 10 seconds I am filing a credit chargeback! This cancellation system is a scam!",
        emotionName: 'danger',
        driftScore: 0.95,
        escalate: true
      },
      {
        sender: 'ai',
        text: "I completely understand your frustration and urgency. I have escalated this issue directly to Emily Blunt, our Senior Retentions Lead, who is joining this chat immediately."
      }
    ]
  },
  {
    title: 'Broken Checkout Friction',
    description: 'Customer fails to pay twice on mobile during checkout.',
    startText: "Hey, the payment portal is throwing an error 'ERR_STRIPE_DECLINED'...",
    steps: [
      {
        sender: 'customer',
        text: "Hey, the payment portal is throwing an error 'ERR_STRIPE_DECLINED' but my bank says they approved it.",
        emotionName: 'confusion',
        driftScore: 0.28
      },
      {
        sender: 'ai',
        text: "Let me search our stripe billing gateway logs. The transaction was blocked by our gateway security checks. Can you verify your card billing zip code?"
      },
      {
        sender: 'customer',
        text: "This is the third time it timed out. Can you take my credit card details over this chat conversation? I need to complete this order today.",
        emotionName: 'stressed',
        driftScore: 0.62
      },
      {
        sender: 'ai',
        text: "For security compliance, I am not permitted to accept credit card numbers over clear text. Let me generate a secure checkout link or transfer you to a specialist."
      },
      {
        sender: 'customer',
        text: "Forget it. I will buy this on Amazon instead. This checkout system is completely useless and I have wasted 45 minutes trying to buy this single item!",
        emotionName: 'danger',
        driftScore: 0.88,
        escalate: true
      },
      {
        sender: 'ai',
        text: "I am extremely sorry for this checkout failure. I have logged this incident to our engineering team and escalated your profile to our VIP Support representative."
      }
    ]
  },
  {
    title: 'Empathetic Happy Rescue',
    description: 'Warm recovery from a slight issue resulting in high delight score.',
    startText: "Is it possible to migrate my team of 15 members to the enterprise discount plan?",
    steps: [
      {
        sender: 'customer',
        text: "Hi there, is it possible to migrate my team of 15 members to the enterprise discount plan? The upgrade portal is quite confusing.",
        emotionName: 'confusion',
        driftScore: 0.22
      },
      {
        sender: 'ai',
        text: "Certainly! I would be happy to help migrate your team. We offer a 20% volume discount for teams of 10 or more. Let me fetch the direct migration link."
      },
      {
        sender: 'customer',
        text: "Wow, your system automatically applied the coupon and migrated all 15 members! This is incredible, thank you so much!",
        emotionName: 'happy',
        driftScore: 0.05
      },
      {
        sender: 'ai',
        text: "You are very welcome! I'm glad everything migrated smoothly. Let me know if you need anything else to onboard your team."
      }
    ]
  }
];

