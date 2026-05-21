import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  ShieldAlert, 
  AlertOctagon, 
  ChevronRight, 
  MailOpen,
  Calendar
} from 'lucide-react';
import { AlertTrigger } from '../types';
import { MOCK_ALERTS } from '../data/mockData';

interface AlertsProps {
  alerts: AlertTrigger[];
  onMarkAllRead: () => void;
  onClearAlert: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export default function Alerts({ 
  alerts, 
  onMarkAllRead, 
  onClearAlert, 
  onMarkRead 
}: AlertsProps) {
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const visibleAlerts = filterType === 'unread' 
    ? alerts.filter(a => !a.isRead) 
    : alerts;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 select-none">
        <div>
          <h2 className="font-sans text-xl md:text-2xl font-bold text-white">Alert Dispatch Room</h2>
          <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
            Real-time proactive SLA alarms & drift predictions
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Read markers toggle */}
          <button 
            onClick={onMarkAllRead}
            disabled={alerts.every(a => a.isRead)}
            className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/3 hover:bg-white/5 font-sans font-semibold text-xs text-on-surface hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          
          <div className="flex bg-white/3 p-1 rounded-xl border border-white/5 text-xs font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-primary/15 text-primary border border-primary/5 font-bold'
                  : 'text-on-surface-variant/60 hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'unread'
                  ? 'bg-primary/15 text-primary border border-primary/5 font-bold'
                  : 'text-on-surface-variant/60 hover:text-white'
              }`}
            >
              UNREAD
            </button>
          </div>
        </div>
      </div>

      {/* Grid view of active warnings log */}
      <div className="space-y-3.5">
        {visibleAlerts.length === 0 ? (
          <div className="p-16 text-center bg-white/3 rounded-2xl border border-white/5 font-sans text-sm text-on-surface-variant/60 select-none">
            <Bell className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
            <p>Perfect score! No pending emotion drift warnings flagged currently.</p>
          </div>
        ) : (
          visibleAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical' || alert.severity === 'high';
            
            return (
              <div 
                key={alert.id}
                className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all duration-300 ${
                  !alert.isRead 
                    ? isCritical 
                      ? 'bg-error/5 border-error/25 shadow-[0_0_15px_rgba(255,180,171,0.06)]' 
                      : 'bg-[#1b2029]/80 border-primary/20'
                    : 'bg-white/3 border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Visual Icon indicator col (1/12) */}
                <div className="md:col-span-1 flex justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isCritical 
                      ? 'bg-error/10 border-error/30 text-error' 
                      : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                  }`}>
                    {isCritical ? (
                      <AlertOctagon className="w-5 h-5 animate-pulse" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Main text col (8/12) */}
                <div className="md:col-span-8 space-y-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans font-bold text-sm text-white">
                      {alert.customerName}
                    </span>
                    <span className="opacity-30 text-[10px] text-on-surface-variant">•</span>
                    <span className="font-mono text-[9px] text-[#94a3b8]/50 uppercase tracking-widest leading-none">
                      STREAM_REF: {alert.ticketId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none tracking-widest font-extrabold uppercase ${
                      alert.severity === 'critical' 
                        ? 'bg-error-container text-error' 
                        : 'bg-white/5 text-on-surface-variant border border-white/5'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant/80">
                    {alert.description}
                  </p>
                </div>

                {/* Signal score stats col (2/12) */}
                <div className="md:col-span-2 text-center md:text-right">
                  <span className="font-mono text-[9px] text-[#94a3b8]/30 block uppercase font-bold">DRIFT VERDICT</span>
                  <span className={`font-mono text-base font-bold ${isCritical ? 'text-error' : 'text-primary'}`}>
                    {alert.driftScore} Score
                  </span>
                </div>

                {/* Operations dismissal actions col (1/12) */}
                <div className="md:col-span-1 flex justify-center md:justify-end gap-3 select-none">
                  {!alert.isRead && (
                    <button 
                      onClick={() => onMarkRead(alert.id)}
                      className="p-2 border border-white/5 hover:border-primary/20 hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded-xl transition-all cursor-pointer"
                      title="Mark as read"
                    >
                      <MailOpen className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => onClearAlert(alert.id)}
                    className="p-2 border border-white/5 hover:border-error/20 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-xl transition-all cursor-pointer"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
