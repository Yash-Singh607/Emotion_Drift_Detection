import { 
  Radio, 
  BarChart3, 
  History, 
  AlertTriangle, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  HelpCircle, 
  LogOut, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { TabName } from '../types';

interface SidebarProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  onNewAnalysisClick: () => void;
  unreadAlertsCount: number;
  onShowToast: (message: string, kind?: 'info' | 'success' | 'warning') => void;
  isDemoMode: boolean;
  onSignOut: () => void;
  userRole: 'admin' | 'agent' | 'viewer';
  userEmail: string;
  isVerified: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onNewAnalysisClick,
  unreadAlertsCount,
  onShowToast,
  isDemoMode,
  onSignOut,
  userRole,
  userEmail,
  isVerified
}: SidebarProps) {
  const emailPrefix = userEmail.split('@')[0] || 'user';
  const initials = emailPrefix.slice(0, 2).toUpperCase();
  return (
    <aside 
      className="flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#0b111d]/75 backdrop-blur-2xl border-r border-white/10 shadow-2xl shadow-black/40 p-5 z-50 select-none overflow-y-auto"
      id="sentience-sidebar"
    >
      {/* Brand Header */}
      <div 
        className="mb-6 cursor-pointer group premium-card rounded-2xl p-4"
        onClick={() => setActiveTab('landing-page')}
        title="Go to Product Overview"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse group-hover:scale-110 transition-transform duration-300" />
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            Emotion Assist
          </h1>
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant/75 uppercase tracking-widest mt-1">
          Customer Support Dashboard
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] text-primary bg-primary/12 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Role: {userRole}
        </div>
      </div>

      {/* Navigation Group */}
      <nav className="flex-1 space-y-1">
        <p className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 mb-2">
          MAIN MENU
        </p>
        
        {/* Landing Page Link */}
        <button
          onClick={() => setActiveTab('landing-page')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'landing-page'
              ? 'bg-primary/12 text-primary border border-primary/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
              : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" />
            <span>Overview</span>
          </div>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-on-surface-variant/60 font-semibold">Start</span>
        </button>

        {/* Live Stream Controller */}
        <button
          onClick={() => setActiveTab('live-stream')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'live-stream'
              ? 'bg-primary/12 text-primary border border-primary/30 shadow-[0_6px_14px_rgba(99,102,241,0.10)]'
              : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4" />
            <span>Live Chat</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
          </span>
        </button>

        <p className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 pt-6 mb-2">
          INSIGHTS
        </p>

        {/* Analytics View */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'analytics'
              ? 'bg-primary/12 text-primary border border-primary/30'
              : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        {/* Drift History */}
        <button
          onClick={() => setActiveTab('drift-history')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'drift-history'
              ? 'bg-primary/12 text-primary border border-primary/30'
              : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Conversation History</span>
        </button>

        {/* Alerts Center */}
        <button
          onClick={() => setActiveTab('alerts')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'alerts'
              ? 'bg-primary/12 text-primary border border-primary/30'
              : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Alerts</span>
          </div>
          {unreadAlertsCount > 0 && (
            <span className="bg-error/20 text-error font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Team roster */}
        {userRole !== 'viewer' && (
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
              activeTab === 'team'
                ? 'bg-primary/12 text-primary border border-primary/30'
                : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Support Team</span>
          </button>
        )}

        {/* System Settings */}
        {userRole !== 'viewer' && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-primary/12 text-primary border border-primary/30'
                : 'text-on-surface-variant/75 hover:bg-white/6 hover:text-white border border-transparent'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-white/10 space-y-3">
        <div className="premium-card rounded-xl px-3 py-3 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">Logged in as</p>
              <p className="text-xs text-white truncate">{userEmail}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-on-surface-variant uppercase">
              {userRole}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border uppercase ${
                isVerified
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-tertiary/10 border-tertiary/30 text-tertiary'
              }`}
            >
              {isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        {/* Dynamic New Support Simulation Prompt Button */}
        <button 
          onClick={onNewAnalysisClick}
          className="w-full font-sans font-bold text-sm text-white bg-gradient-to-r from-inverse-primary to-secondary-container hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] py-3 rounded-xl flex items-center justify-center gap-2 select-none border border-white/15 cursor-pointer transition-all duration-300"
          title={isDemoMode ? "Simulate high-risk user chats" : "Enabled in demo mode"}
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{isDemoMode ? 'New Analysis' : 'New Analysis (Demo)'}</span>
        </button>

        <div className="space-y-1">
          <a 
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              onShowToast('Help center: support@sentience.ai', 'info');
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant/70 hover:text-white hover:bg-white/3 text-xs font-sans transition-all duration-150"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center</span>
          </a>
          <button 
            onClick={() => {
              onSignOut();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant/70 hover:text-white hover:bg-white/3 text-xs font-sans transition-all duration-150 text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
