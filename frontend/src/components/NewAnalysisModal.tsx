import React from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  Megaphone, 
  Briefcase, 
  AlertTriangle,
  Play,
  Activity
} from 'lucide-react';
import { SIMULATION_TEMPLATES } from '../data/mockData';

interface NewAnalysisModalProps {
  onClose: () => void;
  onSelectScenario: (scenario: typeof SIMULATION_TEMPLATES[0]) => void;
}

export default function NewAnalysisModal({ onClose, onSelectScenario }: NewAnalysisModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none font-sans">
      
      {/* Absolute Backdrop close click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Dialog box wrapper */}
      <div 
        className="w-full max-w-xl bg-[#1b2029] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-scaleUp text-left"
        id="new-analysis-modal"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-sans font-bold text-base text-white">Initialize New Analysis Stream</span>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal List Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-on-surface-variant/75 leading-relaxed">
            Select an escalation template or friction scenario to feed into the active monitoring pipeline. Sentience AI will automatically process dialogue vectors and predict real-time emotions.
          </p>

          <div className="space-y-3">
            {SIMULATION_TEMPLATES.map((item, idx) => {
              const isHighRisk = item.title.includes('rage') || item.title.includes('Cancel') || item.title.includes('Broken');
              
              return (
                <div 
                  key={idx}
                  onClick={() => onSelectScenario(item)}
                  className="p-5 bg-white/3 border border-white/5 hover:border-primary/30 rounded-2xl cursor-pointer hover:bg-white/5 group transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        <span>{item.title}</span>
                        {isHighRisk && (
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                        )}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant/70 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Launch Play Button style */}
                    <div className="p-2 border border-white/5 rounded-xl bg-white/3 text-on-surface-variant/50 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>

                  {/* Seed text content preview */}
                  <div className="mt-3.5 px-3 py-2 bg-[#090e17]/55 border border-white/5 rounded-xl font-mono text-[10px] text-on-surface-variant/60 truncate">
                    SEED_TEXT: "{item.startText}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 border-t border-white/5 bg-white/3 flex justify-end font-sans text-xs">
          <button 
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-white/5 text-on-surface-variant/70 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>

    </div>
  );
}
