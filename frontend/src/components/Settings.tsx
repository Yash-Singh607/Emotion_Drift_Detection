import React, { useState } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  ShieldAlert, 
  Activity, 
  RefreshCw, 
  BrainCircuit, 
  FileCode,
  CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const [sensitivityVal, setSensitivityVal] = useState<number>(85);
  const [gracePeriodSec, setGracePeriodSec] = useState<number>(140);
  const [enableAutonomousAI, setEnableAutonomousAI] = useState<boolean>(true);
  const [modelSelected, setModelSelected] = useState<'distilbert' | 'bert-large'>('distilbert');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="premium-card rounded-2xl px-5 py-4 flex justify-between items-center select-none">
        <div>
          <h2 className="font-sans text-xl md:text-2xl font-bold text-white">Settings</h2>
          <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
            Adjust analysis behavior and escalation preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Config Form Column (2/3 width) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="premium-card rounded-2xl p-6 space-y-6 select-none font-sans">
            
            {/* Setting Item 1: Classifier Sensitivity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-white font-bold inline-flex items-center gap-2">
                  <span>Escalation Sensitivity</span>
                  <HelpCircle className="w-3.5 h-3.5 text-on-surface-variant/50 cursor-help" title="Lower values trigger alerts earlier. Higher values reduce alert frequency." />
                </label>
                <span className="font-mono text-primary font-bold">{sensitivityVal}% Sensitivity</span>
              </div>
              <input 
                type="range"
                min="50"
                max="95"
                value={sensitivityVal}
                onChange={(e) => setSensitivityVal(parseInt(e.target.value))}
                className="w-full accent-primary bg-white/5 rounded-lg h-2 cursor-pointer outline-none"
              />
              <p className="text-[10px] text-on-surface-variant/60 leading-tight">
                Escalations will automatically prompt actions onto decision panels when negative sentiment intensity passes this threshold value.
              </p>
            </div>

            {/* Setting Item 2: SLA Alert Grace Period Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-white font-bold inline-flex items-center gap-2">
                  <span>Risk Tracking Window</span>
                </label>
                <span className="font-mono text-primary font-bold">{gracePeriodSec} seconds</span>
              </div>
              <input 
                type="range"
                min="60"
                max="240"
                step="10"
                value={gracePeriodSec}
                onChange={(e) => setGracePeriodSec(parseInt(e.target.value))}
                className="w-full accent-primary bg-white/5 rounded-lg h-2 cursor-pointer outline-none"
              />
              <p className="text-[10px] text-on-surface-variant/60 leading-tight">
                Defines how much recent conversation context is used while evaluating risk shifts.
              </p>
            </div>

            {/* Setting Item 3: Autonomous Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-xl">
              <div className="space-y-1 pr-6 text-left">
                <span className="font-bold text-sm text-white block">Enable Autonomous Replies</span>
                <span className="text-[11px] text-on-surface-variant/70 leading-relaxed block">
                  Allows AI to continue replying automatically until escalation thresholds are reached.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableAutonomousAI}
                  onChange={(e) => setEnableAutonomousAI(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Setting Item 4: Model Engine Switcher */}
            <div className="space-y-3 select-none text-left">
              <label className="text-xs text-white font-bold block">Model Selection</label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1 */}
                <div 
                  onClick={() => setModelSelected('distilbert')}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                    modelSelected === 'distilbert'
                      ? 'bg-primary/5 border-primary text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'bg-white/3 border-white/5 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs font-mono">DistilBERT (Fast)</span>
                  <span className="text-[10px] leading-relaxed mt-2 block opacity-70">
                    High responsiveness, nominal CPU/GPU footprints, 42ms processing benchmarks.
                  </span>
                </div>

                {/* Option 2 */}
                <div 
                  onClick={() => setModelSelected('bert-large')}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                    modelSelected === 'bert-large'
                      ? 'bg-primary/5 border-primary text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'bg-white/3 border-white/5 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs font-mono">BERT-Large (Deep)</span>
                  <span className="text-[10px] leading-relaxed mt-2 block opacity-70">
                    Deep contexts alignments, higher telemetry accuracy matrices, requires high-grade tensors.
                  </span>
                </div>
              </div>
            </div>

            {/* Submit save action */}
            <div className="pt-2 flex justify-between items-center bg-transparent">
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="flex items-center gap-1.5 font-sans font-bold text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settings saved</span>
                  </span>
                )}
              </div>

              <button 
                type="submit"
                className="py-3 px-6 font-sans font-bold text-xs text-white bg-gradient-to-r from-inverse-primary to-secondary-container hover:shadow-[0_0_15px_rgba(111,0,190,0.3)] hover:scale-105 rounded-xl cursor-pointer transition-all duration-200"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>

        {/* Developer Documentation Right Side Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-6 select-none font-sans">
          
          {/* Telemetry Status Metrics */}
          <div className="premium-card lift-on-hover rounded-2xl p-6 space-y-4">
            <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              System Status
            </h3>

            <div className="space-y-3 font-mono text-[11px] hover:text-on-surface transition-colors leading-relaxed">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50 uppercase">CLASSIFICATION_SIGMA</span>
                <span className="text-white font-bold">σ = 0.62</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50 uppercase font-mono">CONCURRENT_STREAMS</span>
                <span className="text-white font-bold">18 chats active</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50 uppercase">AVERAGE_STREAMS_SLA</span>
                <span className="text-white font-bold">98.42% nominal</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50 uppercase">BACKEND_VERSION</span>
                <span className="text-[#ddb7ff] font-bold">v2.4.92-Distil</span>
              </div>
            </div>
          </div>

          {/* Model Script API Snippet */}
          <div className="premium-card lift-on-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileCode className="w-4 h-4" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest leading-none">
                Model API Snippet
              </h3>
            </div>
            
            <div className="p-3 bg-[#0a0f18] rounded-xl border border-white/5 overflow-x-auto">
              <pre className="font-mono text-[10px] text-on-surface-variant leading-relaxed text-left">
{`from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="monologg/distilbert-goemotions-original",
    top_k=3
)

v = classifier("This chat is ridiculously slow.")
print(v[0][0])
# Expected Output: Anger [0.982]`}
              </pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
