import { useState, useEffect } from 'react';
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
import { PractitionerProfile } from '@/app/components/employee/PractitionerProfile';
import { CompanyProfile } from '@/app/components/company/CompanyProfile';
import { PractitionerDashboard } from '@/app/components/practitioner/PractitionerDashboard';
import { HRDashboard } from '@/app/components/hr/HRDashboard';
import { LandingPage } from '@/app/components/marketing/LandingPage';
import { PrivacyPolicy } from '@/app/components/legal/PrivacyPolicy';
import { PractitionerBilling } from '@/app/components/admin/PractitionerBilling';
import { EmployeeUsage } from '@/app/components/admin/EmployeeUsage';
import { ArticlePage } from '@/app/components/employee/ArticlePage';
import { api } from '@/app/services/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('auth_token'));
  }, []);

  useEffect(() => {
    api.setOnUnauthorized(() => setIsLoggedIn(false));
    return () => api.setOnUnauthorized(null);
  }, []);

  const handleViewPractitionerProfile = (practitionerId: string) => {
    setSelectedPractitionerId(practitionerId);
    setActiveTab('practitioner-profile');
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
        return <FindPractitioner onViewProfile={handleViewPractitionerProfile} />;
      case 'appointments':
        return <MyAppointments />;
      case 'journal':
        return <MyJournal />;
      case 'messages':
        return <Messages />;
      case 'news':
        return <News />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <MyProfile />;
      case 'practitioner-profile':
        return <PractitionerProfile 
          practitionerId={selectedPractitionerId ?? ''}
          onClose={() => setActiveTab('practitioners')}
        />;
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

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={() => setIsLoggedIn(true)}
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
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          onViewCompany={() => setActiveTab('company-profile')}
          onLogout={() => {
            api.logout();
            setIsLoggedIn(false);
          }}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}