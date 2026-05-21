import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  BarChart, 
  Award, 
  Activity, 
  Sparkles, 
  Gauge, 
  LineChart,
  AlertTriangle
} from 'lucide-react';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  // Interactive mock toggles
  const statCardData = {
    '24h': { chats: '1,242', escalations: '24', common: 'FRUSTRATED', accuracy: '94.2%' },
    '7d': { chats: '14,282', escalations: '412', common: 'CONFUSED', accuracy: '95.6%' },
    '30d': { chats: '58,901', escalations: '1,842', common: 'Delayed Delivery', accuracy: '96.1%' }
  };

  const selectedStats = statCardData[timeframe];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5 select-none">
        <div>
          <h2 className="font-sans text-xl md:text-2xl font-bold text-white">Sentiment Telemetry Desk</h2>
          <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
            Historical analytics & model classification accuracy
          </p>
        </div>

        {/* Timeframe Controller */}
        <div className="flex bg-white/3 p-1 rounded-xl border border-white/5 text-xs font-mono">
          {(['24h', '7d', '30d'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-primary/10 text-primary border border-primary/10 font-bold'
                  : 'text-on-surface-variant/60 hover:text-white'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Cards Stats Counters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between group hover:border-primary/25 transition-all">
          <div className="flex justify-between items-start opacity-75 mb-2">
            <span className="font-mono text-[10px] text-[#94a3b8] uppercase tracking-wider">Total Streams</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold text-white">{selectedStats.chats}</h3>
            <p className="text-[11px] text-primary font-bold mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% <span className="text-on-surface-variant/50 font-normal">vs prev range</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between group hover:border-[#ffb4ab]/25 transition-all">
          <div className="flex justify-between items-start opacity-75 mb-2">
            <span className="font-mono text-[10px] text-[#ffb4ab] uppercase tracking-wider">Escalation Triggers</span>
            <AlertTriangle className="w-4 h-4 text-error" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold text-white">{selectedStats.escalations}</h3>
            <p className="text-[11px] text-error font-bold mt-1 inline-flex items-center gap-1">
              +2.1% <span className="text-on-surface-variant/50 font-normal">friction velocity gain</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between group hover:border-[#ffb783]/25 transition-all">
          <div className="flex justify-between items-start opacity-75 mb-2">
            <span className="font-mono text-[10px] text-[#ffb783] uppercase tracking-wider">Common Trigger</span>
            <BarChart className="w-4 h-4 text-tertiary" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight">{selectedStats.common}</h3>
            <p className="text-[11px] text-on-surface-variant/40 mt-1">
              Parsed from top 100 clusters
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between group hover:border-secondary/25 transition-all">
          <div className="flex justify-between items-start opacity-75 mb-2">
            <span className="font-mono text-[10px] text-[#ddb7ff] uppercase tracking-wider">Model Accuracy</span>
            <Award className="w-4 h-4 text-[#ddb7ff]" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold text-[#ddb7ff]">{selectedStats.accuracy}</h3>
            <p className="text-[11px] text-[#ddb7ff] font-bold mt-1 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-secondary animate-pulse" /> Verified by human audits
            </p>
          </div>
        </div>
      </div>

      {/* Main Double Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        
        {/* Left Side: Escalation Drift Timeline Flow Chart */}
        <div className="p-6 rounded-2xl bg-[#1b2029]/40 border border-white/10 flex flex-col justify-between h-[320px] relative">
          <div>
            <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              Hourly Escalation Spikes
            </h3>
            <p className="font-sans text-[11px] text-on-surface-variant/40">Friction count mapped hour-by-hour across timeframe</p>
          </div>

          <div className="flex-1 relative mt-12 flex items-end justify-between px-4 pb-2 border-b border-white/5">
            {[45, 78, 62, 59, 90, 110, 85, 95, 70, 80, 55, 60].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group flex-1">
                <div 
                  className="relative w-full max-w-[12px] bg-white/3 border border-white/5 rounded-t group-hover:bg-primary-container/20 group-hover:border-primary/45 transition-all" 
                  style={{ height: `${val * 0.6}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1b2029] border border-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {val} spike
                  </div>
                </div>
                <span className="font-mono text-[8px] text-on-surface-variant/30">{idx * 2}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Latency Metrics and Confidence Bands Grid */}
        <div className="p-6 rounded-2xl bg-[#1b2029]/40 border border-white/10 h-[320px] flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              Class Confidence Telemetry
            </h3>
            <p className="font-sans text-[11px] text-on-surface-variant/40">Comparison accuracy levels across target classifiers</p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Metric Level 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-white font-medium">DistilBERT GoEmotions Classifier (Aura Stream)</span>
                <span className="font-mono text-primary font-bold">95.6%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '95.6%' }}></div>
              </div>
            </div>

            {/* Metric Level 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-white font-medium">Secondary Lexical Analyzer (Fallback Key-weight)</span>
                <span className="font-mono text-secondary font-bold">88.2%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '88.2%' }}></div>
              </div>
            </div>

            {/* Metric Level 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-white font-medium">Base VADER Sentiment Standardizer</span>
                <span className="font-mono text-tertiary font-bold">72.4%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-tertiary rounded-full" style={{ width: '72.4%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[11px] text-on-surface-variant/40 font-mono tracking-wide">
            RECALIBRATED 26 SECONDS AGO • STABLE SIGMA VARIANT
          </div>
        </div>

      </div>

    </div>
  );
}
