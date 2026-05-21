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
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onNewAnalysisClick,
  unreadAlertsCount 
}: SidebarProps) {
  return (
    <aside 
      className="flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#090e17]/85 backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-primary/5 p-6 z-50 select-none overflow-y-auto"
      id="sentience-sidebar"
    >
      {/* Brand Header */}
      <div 
        className="mb-8 cursor-pointer group"
        onClick={() => setActiveTab('landing-page')}
        title="Go to Product Overview"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse group-hover:scale-110 transition-transform duration-300" />
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            Sentience
          </h1>
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
          Active Monitoring
        </p>
      </div>

      {/* Navigation Group */}
      <nav className="flex-1 space-y-1.5">
        <p className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 mb-2">
          CONSOLES
        </p>
        
        {/* Landing Page Link */}
        <button
          onClick={() => setActiveTab('landing-page')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'landing-page'
              ? 'bg-white/5 text-primary border-l-2 border-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" />
            <span>Product Tour</span>
          </div>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-on-surface-variant/60 font-semibold">Intro</span>
        </button>

        {/* Live Stream Controller */}
        <button
          onClick={() => setActiveTab('live-stream')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'live-stream'
              ? 'bg-primary-container/10 text-primary border-l-2 border-primary shadow-[0_4px_12px_rgba(99,102,241,0.05)]'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4" />
            <span>Live Stream</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
          </span>
        </button>

        <p className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest px-3 pt-6 mb-2">
          ANALYTICS & ESCALATION
        </p>

        {/* Analytics View */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'analytics'
              ? 'bg-white/5 text-primary border-l-2 border-primary'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
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
              ? 'bg-white/5 text-primary border-l-2 border-primary'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Drift History</span>
        </button>

        {/* Alerts Center */}
        <button
          onClick={() => setActiveTab('alerts')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'alerts'
              ? 'bg-white/5 text-primary border-l-2 border-primary'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
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
        <button
          onClick={() => setActiveTab('team')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'team'
              ? 'bg-white/5 text-primary border-l-2 border-primary'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Roster</span>
        </button>

        {/* System Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-300 ${
            activeTab === 'settings'
              ? 'bg-white/5 text-primary border-l-2 border-primary'
              : 'text-on-surface-variant/75 hover:bg-white/3 hover:text-white'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        {/* Dynamic New Support Simulation Prompt Button */}
        <button 
          onClick={onNewAnalysisClick}
          className="w-full font-sans font-bold text-sm text-white bg-gradient-to-r from-inverse-primary to-secondary-container hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] py-3.5 rounded-xl flex items-center justify-center gap-2 select-none border border-white/5 cursor-pointer transition-all duration-300"
          title="Simulate high-risk user chats"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Analysis</span>
        </button>

        <div className="space-y-1">
          <a 
            href="#support"
            onClick={(e) => { e.preventDefault(); alert("Sentience Admin Help Center: support@sentience.ai"); }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant/70 hover:text-white hover:bg-white/3 text-xs font-sans transition-all duration-150"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Wiki</span>
          </a>
          <button 
            onClick={() => { if (confirm("Sign out of current Sentience session?")) alert("Demo session reset! Relocate tabs in sidebar."); }}
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
