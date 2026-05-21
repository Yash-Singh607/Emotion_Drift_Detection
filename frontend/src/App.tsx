import React, { useState } from 'react';
import { Sparkles, Radio } from 'lucide-react';
import { TabName, AlertTrigger, TeamMember, Ticket } from './types';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LiveStream from './components/LiveStream';
import Analytics from './components/Analytics';
import DriftHistory from './components/DriftHistory';
import Alerts from './components/Alerts';
import Team from './components/Team';
import Settings from './components/Settings';
import NewAnalysisModal from './components/NewAnalysisModal';
import { MOCK_ALERTS, MOCK_TEAM_MEMBERS, MOCK_TICKETS } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('landing-page');
  const [alerts, setAlerts] = useState<AlertTrigger[]>(MOCK_ALERTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<any | null>(null);

  // Mark all unread alerts as read
  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Dismiss a specific alert
  const handleClearAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Mark specific unread alert as read
  const handleMarkRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  // Toggle Busy / Online status of a team member agent
  const handleToggleAgentStatus = (agentId: string) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id === agentId) {
        const nextStatus: TeamMember['status'] = member.status === 'available' 
          ? 'busy' 
          : member.status === 'busy' 
            ? 'offline' 
            : 'available';
        return {
          ...member,
          status: nextStatus,
          // Shift load slightly to simulate active roster routing
          activeTickets: nextStatus === 'offline' ? 0 : Math.max(1, member.activeTickets + (nextStatus === 'busy' ? 1 : -1))
        };
      }
      return member;
    }));
  };

  // Callback to dynamically insert a new active escalation from the simulator chat
  const handleAddEscalation = (ticketId: string, customer: string, score: number) => {
    // Prevent duplicate alert triggers for simplicity
    if (alerts.some(a => a.ticketId === ticketId && a.driftScore === score)) return;

    const newAlert: AlertTrigger = {
      id: `AL-${Date.now()}`,
      ticketId,
      customerName: customer,
      severity: 'critical',
      driftScore: score,
      description: `Predictive friction detected on ${ticketId}. Drift velocity peaked above active tolerance bounds.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Handle preset scenario loads inside the live controller
  const handleSelectScenario = (scenario: typeof import('./data/mockData').SIMULATION_TEMPLATES[0]) => {
    setIsModalOpen(false);
    setActiveTab('live-stream');
    setActiveScenario(scenario);
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="min-h-screen bg-[#090e17] text-on-surface font-sans selection:bg-[#c0c1ff] selection:text-black antialiased relative">
      
      {/* Dynamic Overlay Simulation Launcher */}
      {isModalOpen && (
        <NewAnalysisModal 
          onClose={() => setIsModalOpen(false)}
          onSelectScenario={handleSelectScenario}
        />
      )}

      {/* Render Condition: Tab-Dependent Layout refactor */}
      {activeTab === 'landing-page' ? (
        /* Full width Landing Page tour matches Screenshot 3, 5, 6 */
        <div className="w-full relative">
          <LandingPage setActiveTab={setActiveTab} />
        </div>
      ) : (
        /* Console View includes the beautiful fixed control sidebar and main viewport */
        <div className="flex w-full">
          
          {/* Fixed left navigation panel */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onNewAnalysisClick={() => setIsModalOpen(true)}
            unreadAlertsCount={unreadAlertsCount}
          />

          {/* Scrollable Main content area right of Sidebar */}
          <div className="ml-64 flex-1 min-h-screen bg-[#0f131d] p-8 md:p-10 select-text overflow-x-hidden relative">
            
            {/* Soft decorative background glows inside the control panels */}
            <div className="absolute top-1/2 left-2/3 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
              {activeTab === 'live-stream' && (
                <LiveStream 
                  onAddEscalation={handleAddEscalation}
                  teamMembers={teamMembers}
                  activeScenario={activeScenario}
                  onClearScenario={() => setActiveScenario(null)}
                />
              )}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'drift-history' && <DriftHistory />}
              {activeTab === 'alerts' && (
                <Alerts 
                  alerts={alerts}
                  onMarkAllRead={handleMarkAllRead}
                  onClearAlert={handleClearAlert}
                  onMarkRead={handleMarkRead}
                />
              )}
              {activeTab === 'team' && (
                <Team 
                  teamMembers={teamMembers}
                  onToggleStatus={handleToggleAgentStatus}
                />
              )}
              {activeTab === 'settings' && <Settings />}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
