import { 
  Play, 
  Layers, 
  Activity, 
  Database,
  Cpu, 
  Terminal, 
  FileCode, 
  BellRing,
  ArrowRight,
  ShieldCheck,
  Code,
  FileJson,
  Network,
  Sparkles
} from 'lucide-react';
import { TabName } from '../types';

interface LandingPageProps {
  setActiveTab: (tab: TabName) => void;
}

export default function LandingPage({ setActiveTab }: LandingPageProps) {
  return (
    <div className="min-h-screen text-on-surface bg-[#090e17] selection:bg-primary selection:text-black">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 blur-[120px] rounded-full pointer-events-none" style={{ animationDelay: '-1.5s' }}></div>

      {/* Hero Section Container */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 md:px-12 md:max-w-5xl mx-auto pt-12 pb-24">
        
        {/* Active Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/3 border border-white/10 mb-8 backdrop-blur-md animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_12px_#ffb4ab] animate-pulse"></span>
          <span className="font-mono text-[10px] text-on-surface-variant/80 tracking-wider uppercase font-medium">
            Live Emotion Drift Detection Active
          </span>
        </div>

        {/* Master Heading */}
        <h1 className="font-sans text-4xl md:text-[62px] md:leading-[1.15] font-extrabold tracking-tight mb-6">
          Emotion Drift Detection for <br />
          <span className="bg-gradient-to-r from-primary via-[#ddb7ff] to-tertiary bg-clip-text text-transparent">
            Customer Support Escalation
          </span>
        </h1>

        {/* Subtext */}
        <p className="font-sans text-lg md:text-xl text-on-surface-variant/80 max-w-2xl mx-auto leading-relaxed mb-10">
          An AI-powered system that tracks customer emotions in real time and alerts support teams before conversations escalate into negative outcomes.
        </p>

        {/* Interactive Call to Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => setActiveTab('live-stream')}
            className="px-8 py-4 rounded-xl font-sans font-bold text-base text-white bg-gradient-to-r from-inverse-primary to-secondary-container hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            Try Live Demo
            <Play className="w-4 h-4 fill-white" />
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className="px-8 py-4 rounded-xl font-sans font-bold text-base text-on-surface bg-white/3 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:border-white/20"
          >
            View Dashboard
          </button>
        </div>

        {/* Embedded Interactive UI Mock Preview */}
        <div className="w-full max-w-5xl mt-20 relative px-2">
          {/* Edge Glow */}
          <div className="absolute -inset-1 bg-gradient-to-t from-primary/20 via-transparent to-white/5 rounded-2xl blur-xl opacity-60 pointer-events-none"></div>
          
          <div className="relative rounded-2xl p-3 border border-white/10 bg-surface-container-lowest shadow-2xl overflow-hidden aspect-[16/9.5] group">
            {/* Top window headers */}
            <div className="absolute top-0 left-0 w-full h-8 bg-white/3 flex items-center px-4 gap-1.5 z-20 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary/70"></div>
              <span className="font-mono text-[9px] text-on-surface-variant/55 ml-2">Sentience.ai Deployment Console</span>
            </div>

            {/* Dashboard Mock Content inside a sleek image layer or a responsive panel */}
            <div className="w-full h-full rounded-lg mt-6 bg-[#0c0f16] flex flex-col items-center justify-center p-8 border border-white/5 relative overflow-hidden select-none">
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                <span className="font-mono text-[10px] text-error font-medium tracking-wide uppercase">Active Incident: Ticket #8492</span>
              </div>
              
              <div className="space-y-6 max-w-lg text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-error/15 border border-error/40 flex items-center justify-center mx-auto animate-pulse">
                  <Activity className="w-8 h-8 text-error" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sans text-white mb-2">SLA Friction Breach Imminent</h3>
                  <p className="text-sm font-sans text-on-surface-variant/70">
                    Aura Trajectory drifted 80% to negative valence in 140s. Conversation transfer recommended.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('live-stream')}
                  className="px-6 py-2 rounded-lg bg-surface-container hover:bg-white/5 border border-white/10 font-bold text-xs text-primary transition-all cursor-pointer"
                >
                  Inspect Live Timeline
                </button>
              </div>

              {/* Graphical overlays representing drift chart and timeline bubbles */}
              <div className="absolute bottom-4 right-4 text-right">
                <span className="text-[10px] font-mono text-on-surface-variant/40 block">DRIFT GAIN SCORE</span>
                <span className="text-2xl font-mono font-bold text-primary">0.95</span>
              </div>
              
              <div className="absolute bottom-4 left-4 text-left font-mono text-[10px] text-on-surface-variant/40">
                STABLE_LATENCY: 42MS <br />
                GO_EMOTIONS CLASS: DISTILBERT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-20">
          <span className="font-mono text-xs text-primary font-semibold tracking-widest uppercase bg-primary-container/10 px-3 py-1 rounded-full">
            CORE CAPABILITIES
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight">
            Vigilant Emotional Oversight
          </h2>
          <p className="font-sans text-on-surface-variant/70 max-w-xl mx-auto">
            Our four-pillar approach ensures no customer interaction goes unmonitored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white/3 border border-white/8 hover:border-primary/20 transition-all duration-300 space-y-6 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-white mb-2">Real-time Detection</h3>
              <p className="font-sans text-sm text-on-surface-variant/75 leading-relaxed">
                Instant mapping of 28 distinct emotional nuances from text streams using our high-fidelity, fine-tuned model.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white/3 border border-white/8 hover:border-[#ddb7ff]/20 transition-all duration-300 space-y-6 group">
            <div className="w-12 h-12 rounded-xl bg-[#ddb7ff]/10 flex items-center justify-center border border-[#ddb7ff]/20 group-hover:scale-110 transition-transform duration-300">
              <Layers className="w-5 h-5 text-[#ddb7ff]" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-white mb-2">Drift Timeline</h3>
              <p className="font-sans text-sm text-on-surface-variant/75 leading-relaxed">
                Visualize the sequential aura journey of any dialogue to pinpoint exactly when customer friction escalated.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white/3 border border-white/8 hover:border-error/20 transition-all duration-300 space-y-6 group">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center border border-error/20 group-hover:scale-110 transition-transform duration-300">
              <BellRing className="w-5 h-5 text-error" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-white mb-2">Escalation Alert</h3>
              <p className="font-sans text-sm text-on-surface-variant/75 leading-relaxed">
                Predictive indicators automatically triggers alerts when frustration velocity passes SLA thresholds.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white/3 border border-white/8 hover:border-tertiary/20 transition-all duration-300 space-y-6 group">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center border border-tertiary/20 group-hover:scale-110 transition-transform duration-300">
              <Network className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-white mb-2">Support Analytics</h3>
              <p className="font-sans text-sm text-on-surface-variant/75 leading-relaxed">
                Macro-level telemetry records mapping top triggers, agent performance coefficients, and customer relief scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Flow / Pipeline */}
      <section className="py-24 px-6 md:px-12 bg-white/[0.01]/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="font-mono text-xs text-primary font-semibold tracking-widest uppercase">THE CLASSIFIER BACKEND</span>
            <h2 className="font-sans text-3xl font-extrabold text-white">Emotion Intelligence Pipeline</h2>
          </div>

          {/* Steps Horizontal Connection (Lg Grid) */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-10 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1b2029] flex items-center justify-center border border-white/10 text-on-surface hover:border-primary/50 transition-colors">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm font-sans">1. Dataset</h4>
                  <p className="font-mono text-[11px] text-on-surface-variant/60">GoEmotions Corpus</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1b2029] flex items-center justify-center border border-white/10 text-on-surface hover:border-primary/50 transition-colors">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm font-sans">2. Preprocessing</h4>
                  <p className="font-mono text-[11px] text-on-surface-variant/60">Python Tokenizers</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 -mt-2 rounded-full bg-primary/10 flex items-center justify-center border border-primary shadow-[0_0_25px_rgba(192,193,255,0.25)] text-primary">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm font-sans text-primary">3. DistilBERT</h4>
                  <p className="font-mono text-[11px] text-primary/80">Transformer Model</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1b2029] flex items-center justify-center border border-white/10 text-on-surface hover:border-primary/50 transition-colors">
                  <Network className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm font-sans">4. Classification</h4>
                  <p className="font-mono text-[11px] text-on-surface-variant/60">28 Class Inference</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1b2029] flex items-center justify-center border border-white/10 text-on-surface hover:border-primary/50 transition-colors">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm font-sans">5. Drift Analysis</h4>
                  <p className="font-mono text-[11px] text-on-surface-variant/60">Velocity Scoring</p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/30 text-error">
                  <BellRing className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm font-sans text-error">6. Escalation</h4>
                  <p className="font-mono text-[11px] text-error">Support Transfers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-8 text-on-surface-variant/60 text-xs">
            <div className="flex items-center gap-2 bg-white/3 px-4 py-2 rounded-xl border border-white/5">
              <Code className="w-4 h-4 text-primary" />
              <span>Native Python SDK Deployment</span>
            </div>
            <div className="flex items-center gap-2 bg-white/3 px-4 py-2 rounded-xl border border-white/5">
              <Layers className="w-4 h-4 text-[#ddb7ff]" />
              <span>PyTorch Backend Inference</span>
            </div>
            <div className="flex items-center gap-2 bg-white/3 px-4 py-2 rounded-xl border border-white/5">
              <FileJson className="w-4 h-4 text-tertiary" />
              <span>HuggingFace Optimized Embeddings</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-10 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-[#1b2029]/80 to-[#0f131d]/90 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-[#ddb7ff]/5 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="font-sans text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Detect emotional escalation before it becomes a support incident.
            </h2>
            <p className="font-sans text-base text-on-surface-variant/80">
              Join the next generation of highly predictive, empathetic enterprise support pipelines.
            </p>
            <button 
              onClick={() => setActiveTab('live-stream')}
              className="px-8 py-4 rounded-xl font-sans font-bold text-base text-white bg-gradient-to-r from-inverse-primary to-secondary-container shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer inline-flex items-center gap-2 hover:shadow-primary/20"
            >
              Start Stream Classifier
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#090e17] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-sans text-sm text-on-surface-variant/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-sans text-base font-bold text-white">Sentience AI</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#privacy" onClick={(e) => {e.preventDefault(); alert("Sentience Privacy Protocol Active - Mock Mode");}} className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#terms" onClick={(e) => {e.preventDefault(); alert("Sentience Terms of SLA Protocol active");}} className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#security" onClick={(e) => {e.preventDefault(); alert("Sentience operates client-side GoEmotions Sandbox.");}} className="hover:text-primary transition-colors">Security Metrics</a>
            <a href="#docs" onClick={(e) => {e.preventDefault(); alert("Sentience Python SDK Documentation is mocked in Settings.");}} className="hover:text-primary transition-colors">Model Documentation</a>
          </div>

          <div className="text-[11px] text-on-surface-variant/40">
            © 2026 Sentience AI. All rights reserved. GoEmotions v2.4.
          </div>
        </div>
      </footer>

    </div>
  );
}
