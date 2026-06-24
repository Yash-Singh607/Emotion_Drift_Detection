import {
  Activity,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Layers,
  Network,
  Play,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Users,
} from 'lucide-react';
import { TabName } from '../types';

interface LandingPageProps {
  setActiveTab: (tab: TabName) => void;
}

const featureCards = [
  {
    title: 'Live Emotion Detection',
    desc: 'Read customer emotion in real-time from each incoming message.',
    icon: Activity,
    tint: 'text-primary',
  },
  {
    title: 'Escalation Alerts',
    desc: 'Get notified before a conversation becomes high risk.',
    icon: BellRing,
    tint: 'text-error',
  },
  {
    title: 'Conversation Timeline',
    desc: 'See how sentiment changes from neutral to frustrated or resolved.',
    icon: Layers,
    tint: 'text-secondary',
  },
  {
    title: 'Team Collaboration',
    desc: 'Transfer sensitive chats to available human agents quickly.',
    icon: Users,
    tint: 'text-tertiary',
  },
];

export default function LandingPage({ setActiveTab }: LandingPageProps) {
  return (
    <div className="min-h-screen text-on-surface app-shell-bg relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-32 right-0 w-96 h-96 bg-secondary/15 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs tracking-wide text-on-surface-variant">
            Built for modern customer support teams
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-5">
              Turn customer conversations into
              <span className="shimmer-text"> clear action</span>
            </h1>
            <p className="text-lg text-on-surface-variant/80 max-w-xl mb-8">
              Detect rising frustration, respond faster, and keep support experiences calm and human.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('live-stream')}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-inverse-primary to-secondary-container text-white flex items-center gap-2 lift-on-hover"
              >
                Open Live Chat
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-6 py-3 rounded-xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                View Analytics
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="premium-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                    Active Ticket
                  </span>
                  <span>TKT-8492</span>
                </div>
                <div className="rounded-xl bg-[#0f1622] border border-white/10 p-4">
                  <p className="text-sm text-on-surface mb-2">
                    “I was charged twice and still haven’t received a refund.”
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-error font-semibold">Emotion: Frustrated</span>
                    <span className="text-on-surface-variant">Confidence 91%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-[11px] text-on-surface-variant">Risk</p>
                    <p className="font-bold text-error">High</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-[11px] text-on-surface-variant">Latency</p>
                    <p className="font-bold text-primary">42ms</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-[11px] text-on-surface-variant">Status</p>
                    <p className="font-bold text-secondary">Escalate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="premium-card rounded-2xl p-5 lift-on-hover">
                <Icon className={`w-5 h-5 mb-4 ${feature.tint}`} />
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant/80">{feature.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <div className="premium-card rounded-3xl p-8 md:p-10 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Why teams like this interface</h2>
            <p className="text-on-surface-variant/80">
              It is fast, simple, and visually clear. Agents can quickly understand what is happening and what to do next.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-primary" /> Clear risk labels</div>
            <div className="flex items-center gap-2 text-sm"><TimerReset className="w-4 h-4 text-secondary" /> Faster decisions</div>
            <div className="flex items-center gap-2 text-sm"><Network className="w-4 h-4 text-tertiary" /> Live status visibility</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="premium-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Quick Start Checklist</h3>
            <div className="space-y-3 text-sm">
              <button
                onClick={() => setActiveTab('live-stream')}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Open live queue and monitor active customers
                </span>
                <ArrowRight className="w-4 h-4 text-on-surface-variant" />
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tertiary" />
                  Review high-risk alerts and assign follow-up
                </span>
                <ArrowRight className="w-4 h-4 text-on-surface-variant" />
              </button>
              <button
                onClick={() => setActiveTab('drift-history')}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Learn from past escalations and improve responses
                </span>
                <ArrowRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

          <div className="premium-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Productivity Tips</h3>
            <ul className="space-y-2 text-sm text-on-surface-variant/85">
              <li>Use alert filters to focus only on critical and unread tickets.</li>
              <li>Use "Copy Summary" from Live Chat to quickly hand off cases to teammates.</li>
              <li>Monitor emotion trend before customers ask for escalation to reduce churn.</li>
              <li>Review analytics weekly to identify recurring operational issues.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-sm text-on-surface-variant/70">
          <div className="inline-flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-primary" />
            Emotion Assist
          </div>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
            <span>Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
