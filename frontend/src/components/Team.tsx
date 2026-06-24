import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Star, 
  MessageSquare, 
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamProps {
  teamMembers: TeamMember[];
  onToggleStatus: (agentId: string) => void;
}

export default function Team({ teamMembers, onToggleStatus }: TeamProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="premium-card rounded-2xl px-5 py-4 flex justify-between items-center select-none">
        <div>
          <h2 className="font-sans text-xl md:text-2xl font-bold text-white">Support Team</h2>
          <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
            Agent availability, response speed, and conversation load
          </p>
        </div>
      </div>

      {/* Grid of Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div 
            key={member.id}
            className="premium-card lift-on-hover p-6 rounded-2xl flex flex-col justify-between space-y-6 relative group"
          >
            {/* Context Header */}
            <div className="flex justify-between items-start select-none">
              <div className="flex gap-3.5">
                {/* Profile Image with active Status Ring */}
                <div className="relative">
                  <img 
                    src={member.avatarUrl} 
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#090e17] ${
                    member.status === 'available' 
                      ? 'bg-primary' 
                      : member.status === 'busy' 
                        ? 'bg-tertiary shadow-[0_0_8px_#ffb783]' 
                        : 'bg-on-surface-variant/40'
                  }`}></span>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-sm text-white group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant/70 mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Status Toggler button */}
              <button
                onClick={() => onToggleStatus(member.id)}
                className="font-mono text-[9px] px-2.5 py-1 bg-white/5 hover:bg-white/12 border border-white/10 rounded text-on-surface-variant hover:text-white transition-all cursor-pointer"
                title="Change active roster status"
              >
                Change status
              </button>
            </div>

            {/* Performance telemetry parameters */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 font-sans text-left">
              {/* CSAT Score */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#94a3b8]/40 block uppercase font-bold select-none">CSAT</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  <span className="text-white text-xs font-bold font-mono">
                    {member.satisfactionScore} / 5.0
                  </span>
                </div>
              </div>

              {/* Reaction Latency */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#94a3b8]/40 block uppercase font-bold select-none">Avg Reply</span>
                <div className="flex items-center gap-1 text-on-surface-variant/80">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-white text-xs font-bold font-mono">
                    {member.avgResponseTimeSec} seconds
                  </span>
                </div>
              </div>
            </div>

            {/* Active chat workloads */}
            <div className="flex justify-between items-center flex-row select-none">
              <div className="flex items-center gap-2 font-sans text-xs text-on-surface-variant">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span>Active load:</span>
                <span className="text-white font-bold font-mono">{member.activeTickets} chats</span>
              </div>

              {/* Workload Indicator Progress Line */}
              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${member.activeTickets > 3 ? 'bg-tertiary' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(member.activeTickets * 22, 100)}%` }}
                ></div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Roster Guidelines note */}
      <div className="premium-card rounded-xl p-4 border border-primary/20 flex items-start gap-3 text-xs font-sans text-on-surface-variant select-none">
        <UserCheck className="w-4 h-4 text-primary animate-pulse shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The system monitors team status in real time. Escalated conversations are routed to agents with lower active load and <strong className="text-primary">Available</strong> status.
        </p>
      </div>

    </div>
  );
}
