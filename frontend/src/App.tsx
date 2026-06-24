import React, { useEffect, useState } from 'react';
import { TabName, AlertTrigger, TeamMember, HistoricalDriftRecord } from './types';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LiveStream from './components/LiveStream';
import Analytics from './components/Analytics';
import DriftHistory from './components/DriftHistory';
import Alerts from './components/Alerts';
import Team from './components/Team';
import Settings from './components/Settings';
import NewAnalysisModal from './components/NewAnalysisModal';
import Toast from './components/Toast';
import AuthScreen from './components/AuthScreen';
import { MOCK_ALERTS, MOCK_DRIFT_HISTORY, MOCK_TEAM_MEMBERS } from './data/mockData';
import { apiClient, AUTH_TOKEN_STORAGE_KEY, AuthUser } from './lib/api';

const roleTabs: Record<AuthUser["role"], TabName[]> = {
  admin: ['landing-page', 'live-stream', 'analytics', 'drift-history', 'alerts', 'team', 'settings'],
  agent: ['landing-page', 'live-stream', 'analytics', 'drift-history', 'alerts', 'team', 'settings'],
  viewer: ['landing-page', 'live-stream', 'analytics', 'drift-history', 'alerts'],
};

export default function App() {
  const demoFeaturesEnabled = true;
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('landing-page');
  const [alerts, setAlerts] = useState<AlertTrigger[]>(MOCK_ALERTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [driftHistory] = useState<HistoricalDriftRecord[]>(MOCK_DRIFT_HISTORY);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (message: string, kind: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const url = new URL(window.location.href);
      const oauthToken = url.searchParams.get('token');
      if (oauthToken) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, oauthToken);
        url.searchParams.delete('token');
        url.searchParams.delete('provider');
        window.history.replaceState({}, '', url.toString());
      }

      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const user = await apiClient.me();
        setAuthUser(user);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      } finally {
        setAuthChecking(false);
      }
    };
    bootstrapAuth();
  }, []);

  const handleLogin = async (payload: { email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.login({ email: payload.email, password: payload.password });

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.access_token);
      setAuthUser(response.user);
      showToast('Signed in successfully.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (payload: { email: string; password: string; role: AuthUser['role'] }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.register({
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.access_token);
      setAuthUser(response.user);
      const extra = response.verification_token ? ` Verification token: ${response.verification_token}` : '';
      showToast(`Account created.${extra}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.forgotPassword(email);
      const extra = response.debug_token ? ` Reset token: ${response.debug_token}` : '';
      showToast(`${response.message}${extra}`, 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start reset flow';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyEmail = async (token: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.verifyEmail(token);
      showToast(response.message, 'success');
      if (authUser) {
        const refreshed = await apiClient.me();
        setAuthUser(refreshed);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerification = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.resendVerification(email);
      const extra = response.debug_token ? ` Verification token: ${response.debug_token}` : '';
      showToast(`${response.message}${extra}`, 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to resend verification';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (payload: { token: string; newPassword: string }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.resetPassword(payload.token, payload.newPassword);
      showToast(response.message, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAuthUser(null);
    setActiveTab('landing-page');
    showToast('Signed out successfully.', 'info');
  };

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

  if (authChecking) {
    return (
      <div className="min-h-screen app-shell-bg flex items-center justify-center">
        <div className="premium-card rounded-xl px-5 py-3 text-sm text-on-surface-variant">
          Loading secure session...
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <>
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onResetPassword={handleResetPassword}
          onVerifyEmail={handleVerifyEmail}
          onResendVerification={handleResendVerification}
          oauthGoogleUrl={apiClient.oauthStartUrl('google')}
          oauthGithubUrl={apiClient.oauthStartUrl('github')}
          loading={authLoading}
          error={authError}
        />
        {toast && <Toast message={toast.message} kind={toast.kind} />}
      </>
    );
  }

  const allowedTabs = roleTabs[authUser.role];
  const safeActiveTab = allowedTabs.includes(activeTab) ? activeTab : 'landing-page';

  return (
    <div className="min-h-screen bg-transparent text-on-surface font-sans selection:bg-[#c0c1ff] selection:text-black antialiased relative app-shell-bg">
      {safeActiveTab === 'landing-page' && (
        <div className="fixed top-4 right-4 z-40 premium-card rounded-xl px-3 py-2 border border-white/10 max-w-xs">
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">Logged in</p>
          <p className="text-xs text-white truncate">{authUser.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 uppercase">
              {authUser.role}
            </span>
            <span className={`text-[10px] ${authUser.is_verified ? 'text-primary' : 'text-tertiary'}`}>
              {authUser.is_verified ? 'verified' : 'unverified'}
            </span>
          </div>
        </div>
      )}
      
      {/* Dynamic Overlay Simulation Launcher */}
      {isModalOpen && (
        <NewAnalysisModal 
          onClose={() => setIsModalOpen(false)}
          onSelectScenario={handleSelectScenario}
        />
      )}

      {/* Render Condition: Tab-Dependent Layout refactor */}
      {safeActiveTab === 'landing-page' ? (
        /* Full width Landing Page tour matches Screenshot 3, 5, 6 */
        <div className="w-full relative">
          <LandingPage setActiveTab={setActiveTab} />
        </div>
      ) : (
        /* Console View includes the beautiful fixed control sidebar and main viewport */
        <div className="flex w-full">
          
          {/* Fixed left navigation panel */}
          <Sidebar 
            activeTab={safeActiveTab} 
            setActiveTab={setActiveTab} 
            onNewAnalysisClick={() => setIsModalOpen(true)}
            unreadAlertsCount={unreadAlertsCount}
            onShowToast={showToast}
            isDemoMode={demoFeaturesEnabled}
            onSignOut={handleSignOut}
            userRole={authUser.role}
            userEmail={authUser.email}
            isVerified={authUser.is_verified}
          />

          {/* Scrollable Main content area right of Sidebar */}
          <div className="ml-64 flex-1 min-h-screen bg-transparent p-5 md:p-8 select-text overflow-x-hidden relative">
            
            {/* Soft decorative background glows inside the control panels */}
            <div className="absolute top-1/2 left-2/3 w-80 h-80 bg-primary/8 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-8 left-20 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
              {safeActiveTab === 'live-stream' && (
                <LiveStream 
                  onAddEscalation={handleAddEscalation}
                  teamMembers={teamMembers}
                  activeScenario={activeScenario}
                  onClearScenario={() => setActiveScenario(null)}
                  onShowToast={showToast}
                  isDemoMode={demoFeaturesEnabled}
                />
              )}
              {safeActiveTab === 'analytics' && <Analytics hasLiveData={true} />}
              {safeActiveTab === 'drift-history' && (
                <DriftHistory records={driftHistory} />
              )}
              {safeActiveTab === 'alerts' && (
                <Alerts 
                  alerts={alerts}
                  onMarkAllRead={handleMarkAllRead}
                  onClearAlert={handleClearAlert}
                  onMarkRead={handleMarkRead}
                />
              )}
              {safeActiveTab === 'team' && allowedTabs.includes('team') && (
                <Team 
                  teamMembers={teamMembers}
                  onToggleStatus={handleToggleAgentStatus}
                />
              )}
              {safeActiveTab === 'settings' && allowedTabs.includes('settings') && <Settings />}
            </div>
          </div>

        </div>
      )}

      {toast && <Toast message={toast.message} kind={toast.kind} />}

    </div>
  );
}
