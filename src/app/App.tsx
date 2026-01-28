import { useState, useEffect, useLayoutEffect } from 'react';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { TopBar } from '@/app/components/layout/TopBar';
import { EmergencyModal } from '@/app/components/layout/EmergencyModal';
import { Login } from '@/app/components/auth/Login';
import { EmployeeDashboard } from '@/app/components/employee/EmployeeDashboard';
import { FindPractitioner } from '@/app/components/employee/FindPractitioner';
import { MyAppointments } from '@/app/components/employee/MyAppointments';
import { MyJournal } from '@/app/components/employee/MyJournal';
import { Messages } from '@/app/components/employee/Messages';
import { News } from '@/app/components/employee/News';
import { Settings } from '@/app/components/employee/Settings';
import { MyProfile } from '@/app/components/employee/MyProfile';
import { MyPractitionerProfile } from '@/app/components/practitioner/MyPractitionerProfile';
import { PractitionerProfile } from '@/app/components/employee/PractitionerProfile';
import { CompanyProfile } from '@/app/components/company/CompanyProfile';
import { PractitionerDashboard } from '@/app/components/practitioner/PractitionerDashboard';
import { HRDashboard } from '@/app/components/hr/HRDashboard';
import { LandingPage } from '@/app/components/marketing/LandingPage';
import { PrivacyPolicy } from '@/app/components/legal/PrivacyPolicy';
import { PractitionerBilling } from '@/app/components/admin/PractitionerBilling';
import { AdminProfile } from '@/app/components/admin/AdminProfile';
import { EmployeeUsage } from '@/app/components/admin/EmployeeUsage';
import { ArticlePage } from '@/app/components/employee/ArticlePage';
import { api } from '@/app/services/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [messagesPreselectConsultationId, setMessagesPreselectConsultationId] = useState<string | null>(null);
  const [messagesPreselectPractitionerId, setMessagesPreselectPractitionerId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  useLayoutEffect(() => {
    api.setOnUnauthorized(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setSessionChecked(true);
      setIsLoggedIn(false);
      return;
    }
    api.getMe()
      .then((user: any) => {
        const role = user?.role || null;
        setUserRole(role);
        setSessionChecked(true);
        setIsLoggedIn(true);
        
        // Set initial dashboard based on role
        if (role === 'PRACTITIONER') {
          setActiveTab('practitioner-dashboard');
        } else if (role === 'SUPER_ADMIN' || role === 'ADMIN_HUNTZEN' || role === 'ADMIN_RH') {
          setActiveTab('hr-dashboard');
        } else {
          setActiveTab('dashboard'); // Default to employee dashboard
        }
      })
      .catch(() => {
        api.logout();
        setSessionChecked(true);
        setIsLoggedIn(false);
        setUserRole(null);
      });
  }, []);

  const handleViewPractitionerProfile = (practitionerId: string) => {
    setSelectedPractitionerId(practitionerId);
    setActiveTab('practitioner-profile');
  };

  const handleViewArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveTab('article');
  };

  const handleNavigateToMessages = (consultationId: string, practitionerId?: string) => {
    // Prefer selecting conversation by practitioner so we reuse the same thread
    // (with previous messages), regardless of the specific consultation.
    if (practitionerId) {
      setMessagesPreselectConsultationId(null);
      setMessagesPreselectPractitionerId(practitionerId);
    } else {
      setMessagesPreselectPractitionerId(null);
      setMessagesPreselectConsultationId(consultationId);
    }
    setActiveTab('messages');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <EmployeeDashboard
            onNavigate={setActiveTab}
            onViewArticle={handleViewArticle}
          />
        );
      case 'practitioners':
        return (
          <FindPractitioner
            onViewProfile={handleViewPractitionerProfile}
            userRole={userRole}
            searchQuery={globalSearch}
            onSearchQueryChange={setGlobalSearch}
          />
        );
      case 'appointments':
        return (
          <MyAppointments
            onNavigate={setActiveTab}
            onNavigateToMessages={handleNavigateToMessages}
            userRole={userRole}
          />
        );
      case 'journal':
        return <MyJournal />;
      case 'messages':
        return (
          <Messages
            preselectConsultationId={messagesPreselectConsultationId}
            onPreselectUsed={() => setMessagesPreselectConsultationId(null)}
            preselectPractitionerId={messagesPreselectPractitionerId}
            onPreselectPractitionerUsed={() => setMessagesPreselectPractitionerId(null)}
          />
        );
      case 'news':
        return <News onViewArticle={handleViewArticle} searchQuery={globalSearch} />;
      case 'settings':
        return <Settings />;
      case 'profile':
        if (userRole === 'PRACTITIONER') {
          return <MyPractitionerProfile />;
        }
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_HUNTZEN' || userRole === 'ADMIN_RH') {
          return <AdminProfile />;
        }
        return <MyProfile onProfileUpdated={() => setProfileRefreshKey((k) => k + 1)} />;
      case 'practitioner-profile':
        return (
          <PractitionerProfile
            practitionerId={selectedPractitionerId ?? ''}
            onClose={() => setActiveTab('practitioners')}
            onStartMessages={(practitionerId) => {
              setMessagesPreselectPractitionerId(practitionerId);
              setActiveTab('messages');
            }}
          />
        );
      case 'company-profile':
        return <CompanyProfile />;
      case 'practitioner-dashboard':
        return <PractitionerDashboard />;
      case 'hr-dashboard':
        return <HRDashboard />;
      case 'practitioner-billing':
        return <PractitionerBilling />;
      case 'employee-usage':
        return <EmployeeUsage />;
      case 'landing':
        return <LandingPage />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'article':
        return (
          <ArticlePage
            articleId={selectedArticleId ?? ''}
            onBack={() => setActiveTab('news')}
          />
        );
      default:
        return <EmployeeDashboard />;
    }
  };

  if (!sessionChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={async () => {
          // Fetch user role after login
          try {
            const user = await api.getMe();
            const role = user?.role || null;
            setUserRole(role);
            setIsLoggedIn(true);
            
            // Set initial dashboard based on role
            if (role === 'PRACTITIONER') {
              setActiveTab('practitioner-dashboard');
            } else if (role === 'SUPER_ADMIN' || role === 'ADMIN_HUNTZEN' || role === 'ADMIN_RH') {
              setActiveTab('hr-dashboard');
            } else {
              setActiveTab('dashboard');
            }
          } catch {
            setIsLoggedIn(true);
            setActiveTab('dashboard');
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyModal onClose={() => setShowEmergencyModal(false)} />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onEmergencyClick={() => setShowEmergencyModal(true)}
        onLogout={() => {
          api.logout();
          setIsLoggedIn(false);
          setUserRole(null);
        }}
        profileRefreshKey={profileRefreshKey}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          onViewCompany={() => setActiveTab('company-profile')}
          onViewProfile={() => setActiveTab('profile')}
          onLogout={() => {
            api.logout();
            setIsLoggedIn(false);
          }}
          profileRefreshKey={profileRefreshKey}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onGlobalSearchSubmit={() => setActiveTab('practitioners')}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}