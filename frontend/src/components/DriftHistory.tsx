import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HistoricalDriftRecord } from '../types';

interface DriftHistoryProps {
  records?: HistoricalDriftRecord[];
}

export default function DriftHistory({ records = [] }: DriftHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const filteredRecords = records.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.peakEmotion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedRecordId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Tab Header */}
      <div className="premium-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h2 className="font-sans text-xl md:text-2xl font-bold text-white">Conversation History</h2>
          <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
            Past conversations with emotion trend summaries
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/55" />
          <input
            type="text"
            placeholder="Search by name, issue, emotion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-xs text-white placeholder:text-on-surface-variant/40 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="premium-card rounded-2xl p-12 text-center font-sans text-sm text-on-surface-variant/60 select-none">
            No archived records found matching search filters.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedRecordId === record.id;
            
            return (
              <div 
                key={record.id}
                className={`rounded-2xl border transition-all duration-300 lift-on-hover ${
                  isExpanded 
                    ? 'premium-card border-primary/30 shadow-[0_8px_24px_rgba(99,102,241,0.10)]'
                    : 'premium-card border-white/12 hover:border-white/20'
                }`}
              >
                {/* Trigger Row Summary */}
                <div 
                  onClick={() => toggleExpand(record.id)}
                  className="p-5 flex flex-wrap justify-between items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-mono text-xs text-primary font-bold border border-white/10">
                      {record.id}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-sm text-white group-hover:text-primary transition-colors">
                        {record.customerName}
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant/75 mt-0.5 leading-none">
                        {record.issue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Peak Emotion Tag */}
                    <div className="text-right">
                      <span className="font-mono text-[9px] text-[#94a3b8]/30 block uppercase font-bold">Peak Emotion</span>
                      <span className={`text-xs font-sans font-extrabold ${
                        (record.peakEmotion === 'ANGRY' || record.peakEmotion === 'FRUSTRATED') 
                          ? 'text-error' 
                          : (record.peakEmotion === 'STRESSED' || record.peakEmotion === 'OVERWHELMED')
                            ? 'text-secondary font-bold'
                            : 'text-tertiary'
                      }`}>
                        {record.peakEmotion}
                      </span>
                    </div>

                    {/* Mean Drift Score */}
                    <div className="text-right hidden sm:block">
                      <span className="font-mono text-[9px] text-[#94a3b8]/30 block uppercase font-bold">Avg Risk</span>
                      <span className="font-mono text-xs text-white font-bold">
                        {record.meanDriftScore}
                      </span>
                    </div>

                    {/* Status Marker */}
                    <div>
                      {record.wasHandled ? (
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold px-2 py-1 rounded">
                          Handled
                        </span>
                      ) : (
                        <span className="bg-error/10 text-error border border-error/20 text-[10px] uppercase font-bold px-2 py-1 rounded">
                          SLIP
                        </span>
                      )}
                    </div>

                    {/* Expand Chevron Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-on-surface-variant/50" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-on-surface-variant/50" />
                    )}
                  </div>
                </div>

                {/* Expanded Deep Analysis Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-sans">
                      
                      {/* Left: General timestamp detail */}
                      <div className="md:col-span-4 space-y-2 select-none">
                        <div className="flex items-center gap-2.5 text-on-surface-variant/70">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>Trigger Time: {record.triggerTime}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-on-surface-variant/70">
                          <User className="w-4 h-4 text-[#ddb7ff]" />
                          <span>Representative involved: {record.agentInvolved || 'Unassigned (AI auto-snooze)'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-on-surface-variant/70">
                          <Clock className="w-4 h-4 text-tertiary" />
                          <span>Ticket Identifier: {record.ticketId}</span>
                        </div>
                      </div>

                      {/* Right: AI Synthesis dialogue recap summary */}
                      <div className="md:col-span-8 bg-white/3 border border-white/5 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">AI Summary</span>
                        </div>
                        <p className="text-on-surface-variant/90 leading-relaxed text-xs">
                          {record.conversationSummary}
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
