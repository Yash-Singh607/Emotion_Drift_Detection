import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  User, 
  Bot, 
  ShieldAlert, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRightLeft,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  MessageSquareWarning,
  Activity
} from 'lucide-react';
import { Ticket, Message, Emotion, TeamMember } from '../types';
import { EMOTIONS, MOCK_TICKETS, MOCK_TEAM_MEMBERS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper to map 28 GoEmotions labels to UI styled Emotion
const mapBackendEmotion = (backendEmotion: string, confidence: number, text: string = ''): Emotion => {
  const name = backendEmotion.toLowerCase();
  const intensity = Math.round(confidence * 100);
  const lowerText = text.toLowerCase();

  // A. Sarcasm Detection
  const hasEllipsis = lowerText.includes('...');
  const positiveWords = ['amazing', 'great', 'perfect', 'love', 'excellent', 'wow', 'wonderful', 'happy', 'solved', 'thanks'];
  const negativeOps = [
    'pending', 'delayed', 'delay', 'not working', 'issue', 'failed', 'stuck', 'error', 
    'refund', 'nobody helped', 'unresolved', 'frustrated', 'exhausted', 'overwhelmed', 
    'broken', 'unacceptable', 'bad', 'cancellation', 'poor', 'slow', 'horrible', 'waste'
  ];
  
  const hasPositive = positiveWords.some(w => lowerText.includes(w));
  const hasNegativeOp = negativeOps.some(w => lowerText.includes(w));
  const hasRepeatedIssues = (lowerText.match(/issue/g) || []).length >= 2 || lowerText.includes('another issue') || lowerText.includes('issue again') || lowerText.includes('repeated');

  const isSarcastic = (hasPositive && hasNegativeOp) || (hasPositive && hasEllipsis) || (hasEllipsis && hasNegativeOp) || hasRepeatedIssues;

  if (isSarcastic && hasNegativeOp) {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity: 88
    };
  }

  // B. Smart Emotion Overrides (runs under any confidence if these strong directives are present)
  // 1. manager/escalate/legal -> ANGRY (HIGH RISK ESCALATION)
  if (lowerText.includes('manager') || lowerText.includes('escalate') || lowerText.includes('legal') || lowerText.includes('supervisor')) {
    return {
      name: 'ANGRY',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-error',
      textClass: 'text-error',
      borderClass: 'border-error/30',
      glowClass: 'rgba(255, 180, 171, 0.4)',
      isNegative: true,
      intensity: 99
    };
  }

  // 2. refund + unacceptable -> ANGRY
  if (lowerText.includes('refund') && lowerText.includes('unacceptable')) {
    return {
      name: 'ANGRY',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-error',
      textClass: 'text-error',
      borderClass: 'border-error/30',
      glowClass: 'rgba(255, 180, 171, 0.4)',
      isNegative: true,
      intensity: 95
    };
  }

  // 3. pending + payment/order -> CONFUSED
  if (lowerText.includes('pending') && (lowerText.includes('payment') || lowerText.includes('order'))) {
    return {
      name: 'CONFUSED',
      icon: 'sentiment_neutral',
      color: 'bg-tertiary',
      textClass: 'text-tertiary',
      borderClass: 'border-tertiary/20',
      glowClass: 'rgba(217, 119, 33, 0.2)',
      isNegative: true,
      intensity: 75
    };
  }

  // 4. repeated delays/issues -> FRUSTRATED
  const countDelays = (lowerText.match(/delay/g) || []).length;
  const countIssues = (lowerText.match(/issue/g) || []).length;
  const countErrors = (lowerText.match(/error/g) || []).length;
  const countFailed = (lowerText.match(/failed/g) || []).length;
  if (countDelays + countIssues + countErrors + countFailed >= 2 || lowerText.includes('repeated') || lowerText.includes('another issue') || lowerText.includes('multiple delays')) {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity: 85
    };
  }

  // 5. overwhelmed + workload/deadlines -> OVERWHELMED
  if (lowerText.includes('overwhelmed') && (lowerText.includes('workload') || lowerText.includes('deadline') || lowerText.includes('deadlines') || lowerText.includes('stress') || lowerText.includes('stressed'))) {
    return {
      name: 'OVERWHELMED',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-secondary/80',
      textClass: 'text-[#e8c3ff]',
      borderClass: 'border-[#e8c3ff]/30',
      glowClass: 'rgba(221, 183, 255, 0.4)',
      isNegative: true,
      intensity: 88
    };
  }

  // C. Low Confidence Fallback Heuristics
  // Trigger if confidence is below 40%
  if (confidence < 0.40) {
    if (hasNegativeOp) {
      if (['angry', 'mad', 'unacceptable', 'refund', 'nobody helped', 'unresolved'].some(w => lowerText.includes(w))) {
        const isAngry = lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('unacceptable');
        return {
          name: isAngry ? 'ANGRY' : 'FRUSTRATED',
          icon: isAngry ? 'sentiment_very_dissatisfied' : 'sentiment_dissatisfied',
          color: isAngry ? 'bg-error' : 'bg-error/80',
          textClass: isAngry ? 'text-error' : 'text-[#ffb4ab]',
          borderClass: isAngry ? 'border-error/30' : 'border-[#ffb4ab]/30',
          glowClass: isAngry ? 'rgba(255, 180, 171, 0.4)' : 'rgba(255, 180, 171, 0.25)',
          isNegative: true,
          intensity: 80
        };
      }

      if (['overwhelmed', 'exhausted', 'tired', 'workload', 'deadlines'].some(w => lowerText.includes(w))) {
        return {
          name: 'OVERWHELMED',
          icon: 'sentiment_very_dissatisfied',
          color: 'bg-secondary/80',
          textClass: 'text-[#e8c3ff]',
          borderClass: 'border-[#e8c3ff]/30',
          glowClass: 'rgba(221, 183, 255, 0.4)',
          isNegative: true,
          intensity: 78
        };
      }

      if (['sad', 'upset', 'disappointed'].some(w => lowerText.includes(w))) {
        return {
          name: 'OVERWHELMED',
          icon: 'sentiment_very_dissatisfied',
          color: 'bg-secondary/80',
          textClass: 'text-[#e8c3ff]',
          borderClass: 'border-[#e8c3ff]/30',
          glowClass: 'rgba(221, 183, 255, 0.4)',
          isNegative: true,
          intensity: 75
        };
      }

      if (['pending', 'delayed', 'delay', 'issue', 'stuck', 'error', 'failed', 'not working'].some(w => lowerText.includes(w))) {
        const isFrustrated = ['failed', 'stuck', 'error', 'not working'].some(w => lowerText.includes(w));
        return {
          name: isFrustrated ? 'FRUSTRATED' : 'CONFUSED',
          icon: isFrustrated ? 'sentiment_dissatisfied' : 'sentiment_neutral',
          color: isFrustrated ? 'bg-error/80' : 'bg-tertiary',
          textClass: isFrustrated ? 'text-[#ffb4ab]' : 'text-tertiary',
          borderClass: isFrustrated ? 'border-[#ffb4ab]/30' : 'border-tertiary/20',
          glowClass: isFrustrated ? 'rgba(255, 180, 171, 0.25)' : 'rgba(217, 119, 33, 0.2)',
          isNegative: true,
          intensity: 70
        };
      }
    }

    // Default fallbacks if no specific negative operational keywords matched but we have base keywords
    if (['stressed', 'overwhelmed', 'workload', 'tired'].some(w => lowerText.includes(w))) {
      const isOverwhelmed = lowerText.includes('overwhelmed') || lowerText.includes('workload');
      return {
        name: isOverwhelmed ? 'OVERWHELMED' : 'STRESSED',
        icon: isOverwhelmed ? 'sentiment_very_dissatisfied' : 'sentiment_dissatisfied',
        color: isOverwhelmed ? 'bg-secondary/80' : 'bg-secondary',
        textClass: isOverwhelmed ? 'text-[#e8c3ff]' : 'text-[#ddb7ff]',
        borderClass: isOverwhelmed ? 'border-[#e8c3ff]/30' : 'border-[#ddb7ff]/20',
        glowClass: isOverwhelmed ? 'rgba(221, 183, 255, 0.4)' : 'rgba(221, 183, 255, 0.3)',
        isNegative: true,
        intensity: 75
      };
    }

    if (['happy', 'resolved', 'thanks', 'good'].some(w => lowerText.includes(w))) {
      return {
        name: 'SATISFIED',
        icon: 'sentiment_satisfied',
        color: 'bg-primary',
        textClass: 'text-primary',
        borderClass: 'border-primary/20',
        glowClass: 'rgba(192, 193, 255, 0.3)',
        isNegative: false,
        intensity: 75
      };
    }
  }

  // D. Strong base keyword checks (even under high confidence)
  if (lowerText.includes('extremely frustrated')) {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity: 98
    };
  }

  if (lowerText.includes('frustrated') || lowerText.includes('frustrating') || lowerText.includes('frustration')) {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity: Math.max(intensity, 85)
    };
  }

  if (lowerText.includes('not happy') || lowerText.includes('not satisfied') || lowerText.includes('not good')) {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity: Math.max(intensity, 70)
    };
  }

  // E. Standard GoEmotions Mappings (from original models)
  // 3. ANGRY (standard GoEmotions fallback if none of above matches)
  if (name === 'anger') {
    return {
      name: 'ANGRY',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-error',
      textClass: 'text-error',
      borderClass: 'border-error/30',
      glowClass: 'rgba(255, 180, 171, 0.4)',
      isNegative: true,
      intensity
    };
  }

  // 2. FRUSTRATED
  if (['annoyance', 'disapproval', 'disgust', 'embarrassment', 'disappointment'].includes(name)) {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity
    };
  }

  // 3. CONFUSED
  if (['confusion', 'curiosity', 'puzzled', 'realization', 'surprise'].includes(name)) {
    return {
      name: 'CONFUSED',
      icon: 'sentiment_neutral',
      color: 'bg-tertiary',
      textClass: 'text-tertiary',
      borderClass: 'border-tertiary/20',
      glowClass: 'rgba(217, 119, 33, 0.2)',
      isNegative: true,
      intensity
    };
  }

  // 4. STRESSED
  if (['nervousness', 'fear'].includes(name)) {
    return {
      name: 'STRESSED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-secondary',
      textClass: 'text-[#ddb7ff]',
      borderClass: 'border-[#ddb7ff]/20',
      glowClass: 'rgba(221, 183, 255, 0.3)',
      isNegative: true,
      intensity
    };
  }

  // 5. OVERWHELMED
  if (['sadness', 'grief', 'remorse'].includes(name)) {
    return {
      name: 'OVERWHELMED',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-secondary/80',
      textClass: 'text-[#e8c3ff]',
      borderClass: 'border-[#e8c3ff]/30',
      glowClass: 'rgba(221, 183, 255, 0.4)',
      isNegative: true,
      intensity
    };
  }

  // 6. RELIEVED
  if (name === 'relief') {
    return {
      name: 'RELIEVED',
      icon: 'sentiment_satisfied',
      color: 'bg-primary/80',
      textClass: 'text-[#b4c5ff]',
      borderClass: 'border-[#b4c5ff]/30',
      glowClass: 'rgba(192, 193, 255, 0.25)',
      isNegative: false,
      intensity
    };
  }

  // 7. SATISFIED
  if (['joy', 'amusement', 'approval', 'caring', 'excitement', 'gratitude', 'love', 'optimism', 'pride', 'admiration'].includes(name)) {
    return {
      name: 'SATISFIED',
      icon: 'sentiment_satisfied',
      color: 'bg-primary',
      textClass: 'text-primary',
      borderClass: 'border-primary/20',
      glowClass: 'rgba(192, 193, 255, 0.3)',
      isNegative: false,
      intensity
    };
  }

  // Default: NEUTRAL
  return {
    name: 'NEUTRAL',
    icon: 'sentiment_neutral',
    color: 'bg-on-surface-variant/40',
    textClass: 'text-on-surface-variant',
    borderClass: 'border-white/10',
    glowClass: 'transparent',
    isNegative: false,
    intensity
  };
};

// Helper to map emotion string name to UI Emotion object
const getEmotionByName = (name: string, intensity: number = 85): Emotion => {
  const normalized = name.toLowerCase();
  if (normalized === 'angry' || normalized === 'danger') {
    return {
      name: 'ANGRY',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-error',
      textClass: 'text-error',
      borderClass: 'border-error/30',
      glowClass: 'rgba(255, 180, 171, 0.4)',
      isNegative: true,
      intensity
    };
  }
  if (normalized === 'frustrated') {
    return {
      name: 'FRUSTRATED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-error/80',
      textClass: 'text-[#ffb4ab]',
      borderClass: 'border-[#ffb4ab]/30',
      glowClass: 'rgba(255, 180, 171, 0.25)',
      isNegative: true,
      intensity
    };
  }
  if (normalized === 'confused' || normalized === 'puzzled' || normalized === 'confusion') {
    return {
      name: 'CONFUSED',
      icon: 'sentiment_neutral',
      color: 'bg-tertiary',
      textClass: 'text-tertiary',
      borderClass: 'border-tertiary/20',
      glowClass: 'rgba(217, 119, 33, 0.2)',
      isNegative: true,
      intensity
    };
  }
  if (normalized === 'stressed') {
    return {
      name: 'STRESSED',
      icon: 'sentiment_dissatisfied',
      color: 'bg-secondary',
      textClass: 'text-[#ddb7ff]',
      borderClass: 'border-[#ddb7ff]/20',
      glowClass: 'rgba(221, 183, 255, 0.3)',
      isNegative: true,
      intensity
    };
  }
  if (normalized === 'overwhelmed') {
    return {
      name: 'OVERWHELMED',
      icon: 'sentiment_very_dissatisfied',
      color: 'bg-secondary/80',
      textClass: 'text-[#e8c3ff]',
      borderClass: 'border-[#e8c3ff]/30',
      glowClass: 'rgba(221, 183, 255, 0.4)',
      isNegative: true,
      intensity
    };
  }
  if (normalized === 'relieved') {
    return {
      name: 'RELIEVED',
      icon: 'sentiment_satisfied',
      color: 'bg-primary/80',
      textClass: 'text-[#b4c5ff]',
      borderClass: 'border-[#b4c5ff]/30',
      glowClass: 'rgba(192, 193, 255, 0.25)',
      isNegative: false,
      intensity
    };
  }
  if (normalized === 'satisfied' || normalized === 'happy') {
    return {
      name: 'SATISFIED',
      icon: 'sentiment_satisfied',
      color: 'bg-primary',
      textClass: 'text-primary',
      borderClass: 'border-primary/20',
      glowClass: 'rgba(192, 193, 255, 0.3)',
      isNegative: false,
      intensity
    };
  }
  // Default: NEUTRAL
  return {
    name: 'NEUTRAL',
    icon: 'sentiment_neutral',
    color: 'bg-on-surface-variant/40',
    textClass: 'text-on-surface-variant',
    borderClass: 'border-white/10',
    glowClass: 'transparent',
    isNegative: false,
    intensity
  };
};

// Helper for context-aware, trajectory-driven, conversational AI response selection

const getAIResponse = (messages: Message[]): string => {
  if (messages.length === 0) {
    return "Thanks for reaching out. How can I help you today?";
  }

  const latestMsg = messages[messages.length - 1];
  const userText = latestMsg.text || '';
  const normalizedText = userText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
  const lowerText = userText.toLowerCase();
  
  // Specific fallback requirement
  if (normalizedText === "i want to be happy") {
    return "I'm glad to hear you're feeling better. Let me know if there's anything else I can help you with.";
  }

  // Workload/stress-related response override
  if (normalizedText.includes("workload") || normalizedText.includes("stressed") || normalizedText.includes("overwhelmed") || normalizedText.includes("stress")) {
    return "I'm sorry you're feeling overwhelmed. I'll do my best to help make this easier.";
  }

  // Smart Context-Aware Empathetic Responses
  // 1. Pending payment/order processing check
  if (lowerText.includes("pending") && (lowerText.includes("payment") || lowerText.includes("order"))) {
    return "I understand the concern. Your payment may still be processing. Let me help check the order status for you.";
  }

  // 2. Manager/legal/escalation directive check
  if (lowerText.includes('manager') || lowerText.includes('escalate') || lowerText.includes('legal') || lowerText.includes('supervisor')) {
    return "I understand this is frustrating. I am looping in my supervisor immediately to assist you with this matter.";
  }

  // 3. Sarcasm detection check
  const hasEllipsis = lowerText.includes('...');
  const positiveWords = ['amazing', 'great', 'perfect', 'love', 'excellent', 'wow', 'wonderful', 'happy', 'solved', 'thanks'];
  const negativeOps = [
    'pending', 'delayed', 'delay', 'not working', 'issue', 'failed', 'stuck', 'error', 
    'refund', 'nobody helped', 'unresolved', 'frustrated', 'exhausted', 'overwhelmed', 
    'broken', 'unacceptable', 'bad', 'cancellation', 'poor', 'slow', 'horrible', 'waste'
  ];
  const hasPositive = positiveWords.some(w => lowerText.includes(w));
  const hasNegativeOp = negativeOps.some(w => lowerText.includes(w));
  const hasRepeatedIssues = (lowerText.match(/issue/g) || []).length >= 2 || lowerText.includes('another issue') || lowerText.includes('issue again') || lowerText.includes('repeated');
  const isSarcastic = (hasPositive && hasNegativeOp) || (hasPositive && hasEllipsis) || (hasEllipsis && hasNegativeOp) || hasRepeatedIssues;

  if (isSarcastic && hasNegativeOp) {
    return "I see there's some frustration here despite the wording. Let me get right on this and sort out the issue.";
  }

  // 4. Billing/refunds/cancellations check
  if (lowerText.includes('refund') || lowerText.includes('cancel') || lowerText.includes('charge') || lowerText.includes('billing')) {
    return "I understand you're requesting a refund or cancellation. Let me check your account details immediately to see how we can process this.";
  }

  // 5. General operational error/issues check
  if (['pending', 'delayed', 'delay', 'not working', 'issue', 'failed', 'stuck', 'error', 'nobody helped', 'unresolved', 'slow', 'broken'].some(w => lowerText.includes(w))) {
    return "I apologize for the issue you're experiencing with our system. I am investigating the operational error now to resolve this for you.";
  }


  // 1. Repetition detection
  const customerMessages = messages.filter(m => m.sender === 'customer');
  const prevCustomerMessages = customerMessages.slice(0, -1);
  
  let isRepeatingInput = false;
  let repeatedTopic = '';

  if (prevCustomerMessages.length > 0) {
    for (const prevMsg of prevCustomerMessages) {
      const prevNormalized = (prevMsg.text || '').toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
      if (prevNormalized === normalizedText && normalizedText.length > 3) {
        isRepeatingInput = true;
        break;
      }
      
      const criticalKeywords = ['refund', 'cancel', 'manager', 'slow', 'error', 'broken', 'billing', 'charge'];
      for (const kw of criticalKeywords) {
        if (normalizedText.includes(kw) && prevNormalized.includes(kw)) {
          isRepeatingInput = true;
          repeatedTopic = kw;
          break;
        }
      }
    }
  }

  // 2. Emotional Trajectory sequence analysis
  const emotionHistory = customerMessages
    .map(m => m.emotion?.name || 'NEUTRAL');
  
  const currentEmotion = latestMsg.emotion?.name || 'NEUTRAL';
  const prevEmotion = emotionHistory.length > 1 ? emotionHistory[emotionHistory.length - 2] : 'NEUTRAL';
  
  const isEscalatingFrustration = (prevEmotion === 'NEUTRAL' || prevEmotion === 'CONFUSED' || prevEmotion === 'STRESSED' || prevEmotion === 'OVERWHELMED') && (currentEmotion === 'ANGRY' || currentEmotion === 'FRUSTRATED');
  const isPersistentConfusion = prevEmotion === 'CONFUSED' && currentEmotion === 'CONFUSED';
  const isReliefTransition = (prevEmotion === 'ANGRY' || prevEmotion === 'FRUSTRATED' || prevEmotion === 'CONFUSED' || prevEmotion === 'STRESSED' || prevEmotion === 'OVERWHELMED') && (currentEmotion === 'SATISFIED' || currentEmotion === 'RELIEVED');

  // 3. Conversational adaptive responses (Human support agent tone)
  
  // Rule A: Acknowledge repetition
  if (isRepeatingInput) {
    if (currentEmotion === 'ANGRY' || currentEmotion === 'FRUSTRATED') {
      return "I completely understand, and I'm really sorry you have to repeat this. I'm escalating this directly to a supervisor right now to get this resolved for you.";
    }
    if (currentEmotion === 'CONFUSED') {
      return "I hear you, and I want to make sure we don't go in circles. Let me check the previous details so we don't repeat any questions. I'm bringing in a specialist to guide you directly.";
    }
    return "Got it. I see you've mentioned this concern. I'm making sure our team has this context so we can get it sorted out.";
  }

  // Rule B: Trajectory-driven responses
  
  // Case 1: Escalating Frustration / Anger
  if (isEscalatingFrustration || currentEmotion === 'ANGRY' || currentEmotion === 'FRUSTRATED') {
    return "I understand your frustration. I'm escalating this so we can resolve it quickly.";
  }

  // Case 2: Persistent Confusion loop
  if (isPersistentConfusion) {
    return "Sorry for the confusion. Let's make sure we get this right. Let me connect you directly with a support specialist who can look into this for you.";
  }

  // Case 3: Transition to Happiness/Relief
  if (isReliefTransition || currentEmotion === 'SATISFIED' || currentEmotion === 'RELIEVED') {
    return "I'm glad everything is working now. Let me know if you need anything else.";
  }

  // Case 4: Stressed/Overwhelmed
  if (currentEmotion === 'STRESSED' || currentEmotion === 'OVERWHELMED') {
    return "I'm sorry you're feeling overwhelmed. I'll do my best to help make this easier.";
  }

  // Case 5: Confused
  if (currentEmotion === 'CONFUSED') {
    return "Sorry for the confusion. Let me double check these details for you, or I can connect you directly with a support agent.";
  }

  // Case 6: Neutral/Default Support Agent
  return "Understood. Let me look into this for you.";
};

interface LiveStreamProps {
  onAddEscalation: (ticketId: string, customer: string, score: number) => void;
  teamMembers: TeamMember[];
  activeScenario: any;
  onClearScenario: () => void;
}

export default function LiveStream({ 
  onAddEscalation, 
  teamMembers,
  activeScenario,
  onClearScenario
}: LiveStreamProps) {
  // Simulator State
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TKT-8492');
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentTimeText, setCurrentTimeText] = useState<string>('12:05 PM');

  // Live Telemetry Logs Terminal State
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Live Telemetry Engine active.`,
    `[${new Date().toLocaleTimeString()}] Tracked model parameters: GoEmotions V2 DistilBERT.`,
    `[${new Date().toLocaleTimeString()}] Dynamic Drift Memory compounded check active.`
  ]);

  const addTelemetryLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 40));
  };

  
  // Escalation flow state
  const [actionStatusText, setActionStatusText] = useState<string>('Required');
  const [riskValue, setRiskValue] = useState<number>(95);
  const [isTransferred, setIsTransferred] = useState<boolean>(false);
  const [transferredTo, setTransferredTo] = useState<string>('');

  // Simulation player states
  const [isCustomerTyping, setIsCustomerTyping] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [currentScenarioTitle, setCurrentScenarioTitle] = useState<string>('');

  // Simulation player refs
  const simTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const simStepsRef = useRef<any[]>([]);
  const simIndexRef = useRef<number>(0);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Stop active simulation
  const stopActiveSimulation = () => {
    if (simTimerRef.current) {
      clearTimeout(simTimerRef.current as NodeJS.Timeout);
      simTimerRef.current = null;
    }
    setSimulationActive(false);
    setIsCustomerTyping(false);
    setIsTyping(false);
    onClearScenario();
    if (selectedTicketId === 'TKT-SIM') {
      setSelectedTicketId('TKT-8492');
    }
  };

  // Step runner recursion
  const executeNextSimulationStep = () => {
    const currentIndex = simIndexRef.current;
    const steps = simStepsRef.current;

    if (currentIndex >= steps.length) {
      setSimulationActive(false);
      setIsCustomerTyping(false);
      setIsTyping(false);
      return;
    }

    const step = steps[currentIndex];

    if (step.sender === 'customer') {
      setIsCustomerTyping(true);
      const delay = Math.floor(Math.random() * 1000) + 1500; // 1.5s - 2.5s delay

      simTimerRef.current = setTimeout(() => {
        setIsCustomerTyping(false);

        const emotion = getEmotionByName(step.emotionName || 'neutral');
        const userMsg: Message = {
          id: `msg-sim-${Date.now()}`,
          sender: 'customer',
          text: step.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emotion: emotion,
          latencyMs: Math.floor(Math.random() * 10 + 35)
        };

        setTickets(prev => prev.map(t => {
          if (t.id === 'TKT-SIM') {
            return {
              ...t,
              messages: [...t.messages, userMsg],
              driftScore: step.driftScore !== undefined ? step.driftScore : t.driftScore,
              dominantEmotion: emotion.name
            };
          }
          return t;
        }));

        if (step.escalate || emotion.name === 'ANGRY' || emotion.name === 'FRUSTRATED') {
          const finalScore = step.driftScore !== undefined ? step.driftScore : 0.95;
          onAddEscalation('TKT-SIM', 'Sarah Jenkins', parseFloat(finalScore.toFixed(2)));
        }

        simIndexRef.current = currentIndex + 1;
        simTimerRef.current = setTimeout(() => {
          executeNextSimulationStep();
        }, 1000);
      }, delay);

    } else if (step.sender === 'ai') {
      setIsTyping(true);
      const delay = Math.floor(Math.random() * 1000) + 1800; // 1.8s - 2.8s delay

      simTimerRef.current = setTimeout(() => {
        setIsTyping(false);

        const aiMsg: Message = {
          id: `msg-sim-${Date.now()}`,
          sender: 'ai',
          text: step.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          latencyMs: Math.floor(Math.random() * 10 + 40)
        };

        setTickets(prev => prev.map(t => {
          if (t.id === 'TKT-SIM') {
            return {
              ...t,
              messages: [...t.messages, aiMsg]
            };
          }
          return t;
        }));

        simIndexRef.current = currentIndex + 1;
        simTimerRef.current = setTimeout(() => {
          executeNextSimulationStep();
        }, 1000);
      }, delay);
    }
  };

  // Start active simulation
  const startSimulation = (scenario: typeof import('../data/mockData').SIMULATION_TEMPLATES[0]) => {
    if (simTimerRef.current) {
      clearTimeout(simTimerRef.current as NodeJS.Timeout);
      simTimerRef.current = null;
    }

    setSimulationActive(true);
    setCurrentScenarioTitle(scenario.title);
    setIsCustomerTyping(false);
    setIsTyping(false);

    simStepsRef.current = scenario.steps;
    simIndexRef.current = 0;

    const newSimTicket: Ticket = {
      id: 'TKT-SIM',
      subject: scenario.title,
      customerName: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      status: 'active',
      driftScore: 0.0,
      dominantEmotion: 'NEUTRAL',
      latencyMs: 40,
      createdAt: new Date().toISOString(),
      messages: []
    };

    setTickets(prev => {
      const filtered = prev.filter(t => t.id !== 'TKT-SIM');
      return [newSimTicket, ...filtered];
    });
    setSelectedTicketId('TKT-SIM');

    simTimerRef.current = setTimeout(() => {
      executeNextSimulationStep();
    }, 500);
  };

  // Auto-scroll chat window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeTicket.messages, isTyping, isCustomerTyping]);

  // Read current system time for dynamic labels
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeText(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) {
        clearTimeout(simTimerRef.current as NodeJS.Timeout);
      }
    };
  }, []);

  // Trigger simulation when activeScenario updates
  useEffect(() => {
    if (activeScenario) {
      startSimulation(activeScenario);
    }
  }, [activeScenario]);

  // Stop simulation if user manually shifts to a different ticket
  useEffect(() => {
    if (selectedTicketId !== 'TKT-SIM' && simulationActive) {
      stopActiveSimulation();
    }
  }, [selectedTicketId, simulationActive]);


  // Sync risk bar and actions whenever messages change or ticket properties update
  useEffect(() => {
    if (!activeTicket) return;

    // Respect active state transfer and snooze
    if (activeTicket.status === 'resolved') {
      setActionStatusText('Snoozed');
      setRiskValue(5);
      return;
    }
    if (activeTicket.status === 'escalated') {
      setActionStatusText('Transferred');
      setRiskValue(0);
      return;
    }

    // Set risk value directly from drift score (0 - 1.0 scaled to 0 - 100)
    const scorePct = Math.round((activeTicket.driftScore || 0) * 100);
    setRiskValue(scorePct);

    // Determine status text based on active ticket fields
    if (activeTicket.driftScore > 0.45) {
      setActionStatusText('Required');
    } else if (activeTicket.driftScore > 0.25) {
      setActionStatusText('Warning');
    } else if (activeTicket.dominantEmotion === 'SATISFIED' || activeTicket.dominantEmotion === 'RELIEVED') {
      setActionStatusText('Stable');
    } else {
      setActionStatusText('Monitoring');
    }
  }, [activeTicket.messages, activeTicket.status, activeTicket.driftScore, activeTicket.dominantEmotion, isTransferred]);

  // Submit Simulated Client Prompt
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');

    // Start loading state (analyzing sentiment index)
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/predict-emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error status');
      }

      const data = await response.json();
      // Backend response keys: emotion, confidence, drift_score, risk_level, escalation_required
      let { emotion: backendEmotion, confidence, drift_score, risk_level, escalation_required } = data;
      const lowerText = userText.toLowerCase();

      // Custom keyword overrides to improve risk scoring
      // 1. Extremely frustrated
      if (lowerText.includes('extremely frustrated')) {
        drift_score = 0.95;
        risk_level = 'HIGH';
        escalation_required = true;
      }
      // 2. Anger/frustration keywords
      else if (['frustrated', 'frustrating', 'frustration', 'angry', 'mad', 'ridiculous', 'unacceptable', 'terrible', 'delay', 'refund', 'supervisor'].some(w => lowerText.includes(w))) {
        drift_score = Math.max(drift_score, 0.85);
        risk_level = 'HIGH';
        escalation_required = true;
      }
      // 3. Low confidence fallback with negative keywords
      else if (confidence < 0.40 && ['stressed', 'overwhelmed', 'workload', 'tired', 'sad', 'upset', 'disappointed', 'not happy', 'not satisfied', 'not good'].some(w => lowerText.includes(w))) {
        drift_score = Math.max(drift_score, 0.65);
        risk_level = 'MEDIUM';
        escalation_required = true;
      }

      // Map backend predicted emotion to UI styled Emotion
      const mappedEmotion = { ...mapBackendEmotion(backendEmotion, confidence, userText) };
      
      // Set low-confidence fallback flag
      if (confidence < 0.40) {
        mappedEmotion.isFallbackActive = true;
        addTelemetryLog(`[FALLBACK ACTIVE] Low confidence backend prediction (${Math.round(confidence * 100)}%). Heuristic mapping forced.`);
      }

      // Sarcasm logging
      const hasEllipsis = lowerText.includes('...');
      const positiveWords = ['amazing', 'great', 'perfect', 'love', 'excellent', 'wow', 'wonderful', 'happy', 'solved', 'thanks'];
      const negativeOps = [
        'pending', 'delayed', 'delay', 'not working', 'issue', 'failed', 'stuck', 'error', 
        'refund', 'nobody helped', 'unresolved', 'frustrated', 'exhausted', 'overwhelmed', 
        'broken', 'unacceptable', 'bad', 'cancellation', 'poor', 'slow', 'horrible', 'waste'
      ];
      const hasPositive = positiveWords.some(w => lowerText.includes(w));
      const hasNegativeOp = negativeOps.some(w => lowerText.includes(w));
      const hasRepeatedIssues = (lowerText.match(/issue/g) || []).length >= 2 || lowerText.includes('another issue') || lowerText.includes('issue again') || lowerText.includes('repeated');
      const isSarcastic = (hasPositive && hasNegativeOp) || (hasPositive && hasEllipsis) || (hasEllipsis && hasNegativeOp) || hasRepeatedIssues;
      if (isSarcastic && hasNegativeOp) {
        addTelemetryLog(`[SARCASM OVERRIDE] Conflicting emotion signals detected! Override mapped to FRUSTRATED.`);
      }

      // Operational keyword matches log
      if (lowerText.includes('pending') && (lowerText.includes('payment') || lowerText.includes('order'))) {
        addTelemetryLog(`[OVERRIDE] Pending payment/order override triggered. Mapped: CONFUSED.`);
      }

      // Define emotional severity helper
      const getSeverity = (emotionName: string) => {
        const n = emotionName.toUpperCase();
        if (n === 'ANGRY') return 6;
        if (n === 'FRUSTRATED') return 5;
        if (n === 'OVERWHELMED') return 4;
        if (n === 'STRESSED') return 3;
        if (n === 'CONFUSED') return 2;
        if (n === 'NEUTRAL') return 1;
        return 0; // positive or satisfied
      };

      // Extract conversation history for memory and decay checks
      const customerMsgs = activeTicket.messages.filter(m => m.sender === 'customer');

      // A. Recovery Decay check
      if (!mappedEmotion.isNegative && activeTicket.driftScore > 0.3) {
        const prevDrift = activeTicket.driftScore;
        drift_score = prevDrift * 0.5;
        addTelemetryLog(`[RECOVERY DECAY] Positive client signal (${mappedEmotion.name}). Decaying drift score by 50% from ${prevDrift.toFixed(2)} to ${drift_score.toFixed(2)}.`);
      }

      // B. Drift Memory compounding check
      if (mappedEmotion.isNegative && customerMsgs.length > 0) {
        const currSeverity = getSeverity(mappedEmotion.name);
        const prevSeverity = getSeverity(customerMsgs[customerMsgs.length - 1].emotion?.name || 'NEUTRAL');
        const prevPrevSeverity = customerMsgs.length > 1 ? getSeverity(customerMsgs[customerMsgs.length - 2].emotion?.name || 'NEUTRAL') : 0;
        let multiplier = 1.0;

        if (currSeverity > 1) {
          if (currSeverity > prevSeverity && prevSeverity > prevPrevSeverity) {
            multiplier = 1.40;
            addTelemetryLog(`[DRIFT MEMORY] Double Progressive escalation detected (${customerMsgs[customerMsgs.length - 2]?.emotion?.name || 'NONE'} -> ${customerMsgs[customerMsgs.length - 1]?.emotion?.name || 'NEUTRAL'} -> ${mappedEmotion.name}). Compounding with 1.40x multiplier.`);
          } else if (currSeverity > prevSeverity) {
            multiplier = 1.25;
            addTelemetryLog(`[DRIFT MEMORY] Single Progressive escalation detected (${customerMsgs[customerMsgs.length - 1]?.emotion?.name || 'NEUTRAL'} -> ${mappedEmotion.name}). Compounding with 1.25x multiplier.`);
          } else if (currSeverity === prevSeverity && currSeverity >= 4) {
            multiplier = 1.15;
            addTelemetryLog(`[DRIFT MEMORY] Persistent negative state detected (${mappedEmotion.name}). Compounding with 1.15x multiplier.`);
          }
        }

        if (multiplier > 1.0) {
          const oldDrift = drift_score;
          drift_score = Math.min(0.99, drift_score * multiplier);
          addTelemetryLog(`[DRIFT ENGINE] Final drift compounded from ${oldDrift.toFixed(2)} to ${drift_score.toFixed(2)}.`);
        }
      }

      // C. Escalation Intelligence Triggers
      const allCustomerText = (customerMsgs.map(m => m.text).join(' ') + ' ' + userText).toLowerCase();
      let opMatches = 0;
      negativeOps.forEach(op => {
        const matches = (allCustomerText.match(new RegExp(op, 'g')) || []).length;
        opMatches += matches;
      });
      const hasRepeatedHistoryOps = opMatches >= 3;

      const explicitKeywords = [
        "speak to manager", "cancel subscription", "nobody helped", 
        "this is ridiculous", "refund now", "unacceptable", 
        "escalate", "legal", "supervisor", "unresolved"
      ];
      const hasExplicitEscalationPhrase = explicitKeywords.some(phrase => lowerText.includes(phrase));
      const isHighAngryFrustrated = (mappedEmotion.name === 'ANGRY' || mappedEmotion.name === 'FRUSTRATED') && mappedEmotion.intensity > 70;

      let triggerReason = '';
      if (isHighAngryFrustrated) {
        triggerReason = `Negative emotion peaked (${mappedEmotion.name} @ ${mappedEmotion.intensity}%)`;
      } else if (hasRepeatedHistoryOps) {
        triggerReason = `Repeated operational keywords in stream history (${opMatches} matches)`;
      } else if (hasExplicitEscalationPhrase) {
        const matchedPhrase = explicitKeywords.find(phrase => lowerText.includes(phrase));
        triggerReason = `Explicit high-risk directive: "${matchedPhrase}"`;
      }

      if (triggerReason) {
        escalation_required = true;
        risk_level = 'HIGH';
        drift_score = Math.max(drift_score, 0.95);
        addTelemetryLog(`[ESCALATION ENFORCED] Reason: ${triggerReason}. Overriding drift score to 0.95.`);
      }

      // Append Customer message with mapped emotion
      const userMsg: Message = {
        id: `msg-user-${Date.now()}`,
        sender: 'customer',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: mappedEmotion,
        latencyMs: Math.floor(Math.random() * (45 - 35) + 35)
      };

      const updatedMessages = [...activeTicket.messages, userMsg];

      // Update active ticket state
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          const finalStatus = escalation_required ? 'active' : t.status;
          return {
            ...t,
            messages: updatedMessages,
            driftScore: drift_score,
            dominantEmotion: mappedEmotion.name,
            status: finalStatus
          };
        }
        return t;
      }));

      // Stop typing/loading for customer, then show typist indicator for AI response sequence
      setIsTyping(true);

      // Generate emotionally adaptive AI response text
      const aiText = getAIResponse(updatedMessages);

      setTimeout(() => {
        setIsTyping(false);

        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          latencyMs: Math.floor(Math.random() * (50 - 40) + 40)
        };

        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicketId) {
            return {
              ...t,
              messages: [...updatedMessages, aiMsg]
            };
          }
          return t;
        }));

        // Trigger escalation alert callback if required
        if (escalation_required || mappedEmotion.name === 'ANGRY' || mappedEmotion.name === 'FRUSTRATED') {
          onAddEscalation(activeTicket.id, activeTicket.customerName, parseFloat(drift_score.toFixed(2)));
        }
      }, 1000);

    } catch (error) {
      console.error('Connection to backend failed:', error);
      setIsTyping(false);

      // Add customer message anyway (so the text they typed is not lost), but with a neutral fallback or no emotion
      const userMsg: Message = {
        id: `msg-user-${Date.now()}`,
        sender: 'customer',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: 5
      };

      // Append backend offline error alert message
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Connection to Emotion Drift Detection backend failed. Please ensure your FastAPI server is running on ${API_BASE_URL} using 'uvicorn app:app --reload --port 8000'.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: 1
      };

      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            messages: [...t.messages, userMsg, errorMsg]
          };
        }
        return t;
      }));
    }
  };

  // Preset Scenario Activation
  const selectScenarioMessage = (msgText: string) => {
    setInputValue(msgText);
  };

  // Snooze active ticket alert
  const handleSnooze = () => {
    setRiskValue(15);
    setActionStatusText('Snoozed');
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return { ...t, status: 'snoozed', driftScore: 0.15 };
      }
      return t;
    }));
    alert("Escalation risk triggers snoozed for TKT-8492. Alerts reassigned to lower priority.");
  };

  // Transfer Ticket to Representative
  const handleExecuteTransfer = () => {
    // Choose available team member
    const targetAgent = teamMembers.find(m => m.status === 'available') || teamMembers[0];
    setIsTransferred(true);
    setTransferredTo(targetAgent.name);
    setRiskValue(0);
    setActionStatusText('Transferred');
    
    // Update ticket state to escalated / handed over
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return { 
          ...t, 
          status: 'escalated', 
          assignedAgent: targetAgent.name,
          driftScore: 0.05
        };
      }
      return t;
    }));

    alert(`Ticket TKT-8492 successfully handed over to ${targetAgent.name} (${targetAgent.role}). Real-time stream synchronized.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header telemetry display */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5 select-none">
        <div className="flex items-center gap-3">
          {/* Pulsing state orbit matched to risk value */}
          <div className="relative flex h-3.5 w-3.5">
            {riskValue > 50 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${riskValue > 50 ? 'bg-error' : riskValue > 30 ? 'bg-tertiary' : 'bg-primary'}`}></span>
          </div>
          <div>
            <h2 className="font-sans text-xl md:text-2xl font-bold text-white">
              Emotion Drift Active Monitor
            </h2>
            <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
              DistilBERT-powered GoEmotions live classification
            </p>
          </div>
        </div>

        {/* Global indicators */}
        <div className="flex items-center gap-4 bg-white/3 px-4 py-2 rounded-xl border border-white/5">
          <div className="text-right">
            <span className="font-mono text-[9px] text-on-surface-variant/40 block">SYS_STATUS</span>
            <span className={`font-mono text-xs font-bold ${riskValue > 70 ? 'text-error animate-pulse' : 'text-primary'}`}>
              {riskValue > 70 ? 'ATTENTION REQUIRED' : 'OPERATIONAL'}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="text-right">
            <span className="font-mono text-[9px] text-on-surface-variant/40 block">MODEL_ID</span>
            <span className="font-mono text-xs font-bold text-white">GOEMO_V2</span>
          </div>
        </div>
      </header>

      {/* Ticket quick filter selector tabs */}
      <div className="flex flex-wrap gap-2 py-1 select-none">
        {tickets.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedTicketId(t.id);
              setIsTransferred(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              selectedTicketId === t.id
                ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_2px_12px_rgba(192,193,255,0.06)]'
                : 'bg-white/3 text-on-surface-variant hover:bg-white/5 border-white/5 hover:text-white'
            }`}
          >
            <span>{t.id}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
            <span className="opacity-60 font-normal">{t.customerName}</span>
          </button>
        ))}
      </div>

      {/* 2-Column Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column Left: Live Chat Window (8/12 scope) */}
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Chat Window Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-white/3 flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-primary font-bold">
                #
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-white">
                  Live Stream Stream Classifier: {activeTicket.id}
                </h3>
                <p className="font-mono text-[10px] text-on-surface-variant/60 leading-none mt-1">
                  SUBJECT: {activeTicket.subject}
                </p>
              </div>
            </div>
            
            {/* Realtime telemetry latency display */}
            <div className="flex items-center gap-4">
              {simulationActive && (
                <button
                  type="button"
                  onClick={stopActiveSimulation}
                  className="px-3 py-1.5 rounded-lg text-xs font-sans font-bold bg-error/15 border border-error/30 text-error hover:bg-error/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                  Stop Simulation
                </button>
              )}
              <span className="font-sans text-[11px] font-bold text-on-surface-variant/40 border border-white/5 bg-white/3 px-2 rounded font-mono">
                LATENCY: {activeTicket.latencyMs}MS
              </span>
            </div>
          </div>

          {/* Chat Area Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#090e17]/30 to-[#0f131d]/20 scroll-smooth"
            id="chat-messages"
          >
            {activeTicket.messages.map((message) => {
              const isCustomer = message.sender === 'customer';
              const isAiModel = message.sender === 'ai';
              
              return (
                <div 
                  key={message.id} 
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end ml-auto'} max-w-[85%] group animate-fadeIn`}
                >
                  {/* Bubble content */}
                  <div className={`relative px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                    isCustomer 
                      ? message.emotion?.isNegative 
                        ? `${message.emotion.borderClass} ${(message.emotion?.name === 'ANGRY' || message.emotion?.name === 'FRUSTRATED') ? 'bg-error/5 shadow-[0_0_15px_rgba(255,180,171,0.05)]' : 'bg-tertiary/5'}` 
                        : 'bg-[#1b2029]/80 border-white/5'
                      : 'bg-primary-container/10 border-primary/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  }`}>
                    <p className={`font-sans text-sm outline-none ${isCustomer ? 'text-on-surface' : 'text-primary-fixed'}`}>
                      {message.text}
                    </p>
                  </div>

                  {/* Message Metadata */}
                  <div className="flex items-center gap-3 mt-1.5 px-1 font-mono text-[10px] text-on-surface-variant/50 tracking-wider">
                    {isCustomer && message.emotion ? (
                      <div className="flex items-center gap-2">
                        {/* Dominant emotion dot indicator */}
                        <span className={`w-2 h-2 rounded-full ${message.emotion.color} ${message.emotion.isNegative ? 'animate-pulse' : ''}`}></span>
                        <span className={`font-bold ${message.emotion.textClass} uppercase font-sans`}>
                          {message.emotion.name}
                        </span>
                        
                        {/* Dynamic SVG Gauge */}
                        <div className="flex items-center gap-1.5 ml-1 border-l border-white/10 pl-2">
                          <svg className="w-3.5 h-3.5 -rotate-90" viewBox="0 0 36 36">
                            <circle className="stroke-white/10" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                            <circle 
                              className={`${message.emotion.textClass} stroke-current`} 
                              cx="18" 
                              cy="18" 
                              fill="none" 
                              r="16" 
                              strokeWidth="3" 
                              strokeDasharray="100" 
                              strokeDashoffset={100 - message.emotion.intensity}
                            ></circle>
                          </svg>
                          <span className={`text-[10px] font-bold ${message.emotion.textClass}`}>
                            {message.emotion.intensity}%
                          </span>
                          {message.emotion.isFallbackActive && (
                            <span className="px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary text-[8px] font-sans font-bold border border-tertiary/30 ml-1.5 animate-pulse">
                              LOW CONFIDENCE (FALLBACK ACTIVE)
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="font-bold text-primary font-sans">
                        {isAiModel ? 'EMPATHETIC PROXY (AI)' : 'HUMAN REPRESENTATIVE'}
                      </span>
                    )}
                    <span className="opacity-50">•</span>
                    <span>{message.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {/* Customer Typist Indicator */}
            {isCustomerTyping && (
              <div className="flex items-center gap-2 px-1 text-[#ffb4ab]/80 font-mono text-[10px]" id="customer-typing">
                <div className="flex space-x-1 py-1">
                  <div className="w-1.5 h-1.5 bg-error rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-error rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-error rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="uppercase tracking-widest pl-1 font-sans text-error">Customer is typing...</span>
              </div>
            )}

            {/* Simulated Typist Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 px-1 text-on-surface-variant/50 font-mono text-[10px]" id="live-typing">
                <div className="flex space-x-1 py-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="uppercase tracking-widest pl-1 font-sans">Sentience is analyzing sentiment index...</span>
              </div>
            )}
          </div>

          {/* User input controller and quick prompt helper suggestions */}
          <div className="p-4 bg-white/3 border-t border-white/5 select-none text-left">
            {/* Helpers suggestions */}
            <div className="mb-3.5">
              <span className="font-mono text-[9px] text-on-surface-variant/40 block mb-1.5 uppercase">Simulate Customer Replies</span>
              <div className="flex flex-wrap gap-1.5">
                <button 
                  onClick={() => selectScenarioMessage("Wait, is this double renew? That is unacceptable cancellation barrier.")}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-on-surface-variant text-[11px] font-sans hover:text-white transition-colors cursor-pointer text-left"
                >
                  "Wait, is this double renew..."
                </button>
                <button 
                  onClick={() => selectScenarioMessage("This is ridiculously slow. I want full refund, transfer me to support supervisor immediately.")}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-on-surface-variant text-[11px] font-sans hover:text-white transition-colors cursor-pointer text-left"
                >
                  "This is ridiculously slow..."
                </button>
                <button 
                  onClick={() => selectScenarioMessage("Oh thank goodness, your automated solution works perfectly! Love it.")}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-on-surface-variant text-[11px] font-sans hover:text-white transition-colors cursor-pointer text-left"
                >
                  "Oh thank goodness, solved..."
                </button>
              </div>
            </div>

            {/* TextInput Form container */}
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter custom customer simulated response..."
                className="w-full bg-[#0a0f18] border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-on-surface-variant/40 outline-none transition-all pr-12"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="absolute right-2 top-2 p-1.5 rounded-lg text-primary bg-primary/5 hover:bg-primary/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Column Right: AI Trajectory & Immediate Transfer Trigger Pane (4/12 scope) */}
        <div className="lg:col-span-4 flex flex-col gap-6 select-none">
          
          {/* 1. Emotion Trajectory Widget Container */}
          <section className="p-5 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col relative overflow-hidden select-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Aura Trajectory
              </h3>
              
              <span className={`px-2.5 py-1 bg-white/3 text-[10px] font-mono font-bold rounded-lg border transition-all ${
                riskValue > 70 
                  ? 'text-error bg-error/15 border-error/20 animate-pulse' 
                  : riskValue > 30 
                    ? 'text-tertiary bg-tertiary/15 border-tertiary/20' 
                    : 'text-primary bg-primary/10 border-primary/20'
              }`}>
                {riskValue > 70 ? 'DRIFT DETECTED' : 'STABLE'}
              </span>
            </div>

            {/* Horizontal Timeline Chain Bubble */}
            <div className="relative py-4 mb-4">
              {/* Central axis line */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[calc(100%-32px)] h-[1px] bg-white/5 z-0"></div>
              
              <div className="flex justify-between items-center relative z-10">
                {/* Stage 1: NEUTRAL */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-white/3 flex items-center justify-center border border-white/10 hover:border-primary/50 transition-all">
                    <span className="w-2.5 h-2.5 rounded-full bg-on-surface-variant/40"></span>
                  </div>
                  <span className="font-mono text-[9px] text-on-surface-variant/40 uppercase">NEUTRAL</span>
                </div>

                {/* Stage 2: CONFUSED / STRESSED / OVERWHELMED */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    activeTicket.messages.some(m => m.emotion?.name === 'CONFUSED' || m.emotion?.name === 'STRESSED' || m.emotion?.name === 'OVERWHELMED')
                      ? 'bg-tertiary/10 border-tertiary text-tertiary shadow-[0_0_8px_rgba(217,119,33,0.15)]'
                      : 'bg-[#1b2029] border-white/5 opacity-40'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${activeTicket.messages.some(m => m.emotion?.name === 'CONFUSED' || m.emotion?.name === 'STRESSED' || m.emotion?.name === 'OVERWHELMED') ? 'bg-tertiary' : 'bg-white/10'}`}></span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase ${activeTicket.messages.some(m => m.emotion?.name === 'CONFUSED' || m.emotion?.name === 'STRESSED' || m.emotion?.name === 'OVERWHELMED') ? 'text-tertiary font-bold' : 'text-on-surface-variant/40'}`}>CONFUSED</span>
                </div>

                {/* Stage 3: ANGRY / FRUSTRATED */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className={`w-10 h-10 -mt-1 rounded-full flex items-center justify-center border-2 transition-all ${
                    activeTicket.messages.some(m => m.emotion?.name === 'ANGRY' || m.emotion?.name === 'FRUSTRATED')
                      ? 'bg-error/15 border-error text-error shadow-[0_0_12px_rgba(255,180,171,0.2)] animate-pulse'
                      : 'bg-[#1b2029] border-white/5 opacity-40'
                  }`}>
                    <span className={`w-3 h-3 rounded-full ${activeTicket.messages.some(m => m.emotion?.name === 'ANGRY' || m.emotion?.name === 'FRUSTRATED') ? 'bg-error' : 'bg-white/10'}`}></span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase ${activeTicket.messages.some(m => m.emotion?.name === 'ANGRY' || m.emotion?.name === 'FRUSTRATED') ? 'text-error font-bold text-xs' : 'text-on-surface-variant/40'}`}>ANGRY</span>
                </div>
              </div>
            </div>

            {/* Static context banner */}
            <div className={`p-3.5 rounded-xl border transition-colors ${
              riskValue > 70 
                ? 'bg-error/10 border-error/20' 
                : 'bg-white/3 border-white/5'
            }`}>
              <h4 className={`text-xs font-bold font-sans ${riskValue > 70 ? 'text-error' : 'text-white'}`}>
                {riskValue > 70 ? 'Sentiment Velocity Peaked' : 'Nominal Volatility Scale'}
              </h4>
              <p className="text-[11px] text-on-surface-variant/75 mt-1 leading-snug">
                {riskValue > 70 
                  ? 'SLA breach risk is Critical High. Multi-repeated prompt verification detected.' 
                  : 'Monitoring ticket queue stream for early signals of negative emotional drift.'}
              </p>
            </div>
          </section>

          {/* 2. Decision Panel Action Widget */}
          <section className="p-5 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex-1 flex flex-col justify-between select-none">
            <div>
              <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                Decision Panel
              </h3>

              <div className="space-y-4">
                {/* Row 1: Active Status */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/70 font-sans">Action Status</span>
                  <span className={`font-sans font-extrabold ${
                    actionStatusText === 'Transferred' 
                      ? 'text-primary' 
                      : actionStatusText === 'Required' 
                        ? 'text-error animate-pulse' 
                        : 'text-on-surface-variant'
                  }`}>
                    {actionStatusText}
                  </span>
                </div>

                {/* Row 2: Risk Meter */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/70 font-sans">Risk Level</span>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          riskValue > 70 ? 'bg-error shadow-[0_0_8px_#ffb4ab]' : riskValue > 30 ? 'bg-tertiary' : 'bg-primary'
                        }`} 
                        style={{ width: `${riskValue}%` }}
                      ></div>
                    </div>
                    <span className={`font-mono font-bold ${riskValue > 70 ? 'text-error' : 'text-on-surface-variant'}`}>
                      {riskValue}%
                    </span>
                  </div>
                </div>

                {/* Row 3: recommended layout */}
                <div className="bg-white/3 border border-white/5 p-4 rounded-xl relative overflow-hidden mt-2">
                  <span className="font-mono text-[9px] text-on-surface-variant/40 block mb-1 uppercase">Recommended Action</span>
                  <p className="font-sans font-bold text-xs text-white leading-snug">
                    {isTransferred 
                    ? `Conversation successfully re-routed to human agent: ${transferredTo}` 
                    : riskValue > 70 
                      ? 'Transfer conversation to direct senior human support supervisor' 
                      : riskValue > 30
                        ? 'Monitor closely. Offer empathetic automated renewal options.'
                        : 'Permit fully autonomous AI responses.'}
                  </p>
                </div>

                {/* Live Telemetry Terminal Console */}
                <div className="mt-4 border border-white/5 bg-black/45 rounded-xl p-3.5 flex flex-col h-[140px] overflow-hidden relative select-none">
                  <span className="font-mono text-[9px] text-primary block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-primary animate-pulse" />
                    Live System Telemetry Logs
                  </span>
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] text-on-surface-variant/90 space-y-1.5 pr-1 scrollbar-thin">
                    {telemetryLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed border-b border-white/[0.02] pb-1 font-mono break-words text-left">
                        <span className="text-[#a5b4fc]">{log.substring(0, log.indexOf(']') + 1)}</span>{' '}
                        <span className={log.includes('[ESCALATION') ? 'text-error font-semibold' : log.includes('[DRIFT') ? 'text-[#e8c3ff]' : log.includes('[RECOVERY') ? 'text-primary' : 'text-on-surface-variant/90'}>
                          {log.substring(log.indexOf(']') + 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Execute trigger actions */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button 
                onClick={handleSnooze}
                className="py-3 px-4 font-sans font-bold text-xs text-on-surface-variant bg-white/3 hover:bg-white/5 border border-white/5 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                Snooze
              </button>
              
              <button 
                onClick={handleExecuteTransfer}
                disabled={riskValue < 30 || isTransferred}
                className={`py-3 px-4 rounded-xl font-sans font-bold text-xs select-none transition-all cursor-pointer text-center text-white ${
                  isTransferred 
                    ? 'bg-white/5 border border-white/10 text-on-surface-variant font-normal opacity-50 cursor-not-allowed'
                    : riskValue >= 30
                      ? 'bg-gradient-to-r from-[#494bd6] to-[#6f00be] hover:shadow-[0_0_15px_rgba(111,0,190,0.3)] hover:scale-[1.02] cursor-pointer'
                      : 'bg-white/3 opacity-30 cursor-not-allowed text-on-surface-variant'
                }`}
              >
                {isTransferred ? 'Transferred' : 'Execute Transfer'}
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Embedded 2-Column Analytics Visualizations inside Live Stream to match Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none pt-4">
        
        {/* Graph Unit 1: Emotion Distribution Custom SVG */}
        <div className="p-6 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between h-64 relative">
          <div>
            <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              24h Emotion Distribution
            </h3>
          </div>
          
          <div className="flex-1 flex items-end justify-between px-2 pt-4 pb-2">
            {[
              { label: 'NEUTRAL', value: 40, color: 'bg-primary/20 hover:bg-primary/40 text-primary', fill: 'from-primary/30 to-primary/5' },
              { label: 'FRUSTRATED', value: 65, color: 'bg-tertiary/20 hover:bg-tertiary/40 text-tertiary', fill: 'from-tertiary/30 to-tertiary/5' },
              { label: 'ANGRY', value: 30, color: 'bg-error/20 hover:bg-error/40 text-error', fill: 'from-error/30 to-error/5' },
              { label: 'SATISFIED', value: 85, color: 'bg-primary-container/20 hover:bg-primary-container/40 text-white', fill: 'from-primary-container/30 to-primary-container/5' },
              { label: 'CONFUSED', value: 50, color: 'bg-on-surface-variant/20 hover:bg-on-surface-variant/30 text-on-surface-variant', fill: 'from-on-surface-variant/20 to-on-surface-variant/5' },
            ].map(col => (
              <div key={col.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="relative w-10 bg-white/3 border border-white/5 rounded-t-lg overflow-hidden transition-all duration-300" style={{ height: `${col.value}%` }}>
                  <div className={`absolute inset-0 bg-gradient-to-t ${col.fill}`}></div>
                </div>
                <span className="font-mono text-[9px] text-on-surface-variant/60 font-bold group-hover:text-white transition-colors">{col.label}</span>
              </div>
            ))}
          </div>
          
          <span className="absolute bottom-4 right-4 font-mono text-[9px] text-[#94a3b8]/40">TELEMETRY UPDATED: SECS AGO</span>
        </div>

        {/* Graph Unit 2: Global Sentiment Trendline Custom SVG Graph */}
        <div className="p-6 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between h-64 relative overflow-hidden">
          <div>
            <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              Global Sentiment Trendline
            </h3>
            <p className="font-sans text-[11px] text-on-surface-variant/40 leading-none">Mean empathetic indices across 14,282 streams</p>
          </div>

          <div className="flex-1 relative mt-4">
            <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="liveChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(192, 193, 255, 0.4)"></stop>
                  <stop offset="100%" stopColor="rgba(99, 102, 241, 0)"></stop>
                </linearGradient>
              </defs>
              <path d="M0 100 Q 50 20, 100 80 T 200 40 T 300 90 T 400 20 V 120 H 0 Z" fill="url(#liveChartFill)"></path>
              <path d="M0 100 Q 50 20, 100 80 T 200 40 T 300 90 T 400 20" fill="none" stroke="#c0c1ff" strokeWidth="2.5" strokeLinecap="round"></path>
            </svg>
            
            {/* Grid Lines mockup */}
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none opacity-20">
              <div className="border-t border-white/10"></div>
              <div className="border-t border-white/10"></div>
              <div className="border-t border-white/10"></div>
            </div>
          </div>

          {/* Floating trend marker */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="font-mono text-[10px] font-bold text-primary">+12.4%</span>
          </div>
        </div>

      </div>

    </div>
  );
}
