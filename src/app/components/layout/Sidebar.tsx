import { useState, useEffect } from 'react';
import { Home, Calendar, MessageSquare, BookOpen, Heart, Bell, Settings, LogOut, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { api } from '@/app/services/api';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEmergencyClick: () => void;
  onLogout?: () => void;
  profileRefreshKey?: number;
}

export function Sidebar({ activeTab, onTabChange, onEmergencyClick, onLogout, profileRefreshKey }: SidebarProps) {
  const [userDisplay, setUserDisplay] = useState<{ name: string; initials: string } | null>(null);

  useEffect(() => {
    api.getEmployeeMe().then((e: any) => {
      const name = e?.firstName && e?.lastName ? `${e.firstName} ${e.lastName}` : e?.user?.email ?? null;
      const initials = e?.firstName && e?.lastName
        ? `${e.firstName[0]}${e.lastName[0]}`.toUpperCase()
        : (e?.user?.email?.[0] ?? 'U').toUpperCase();
      setUserDisplay(name ? { name, initials } : { name: e?.user?.email ?? 'Utilisateur', initials });
    }).catch(() => {
      api.getMe().then((u: any) => {
        setUserDisplay({
          name: u?.email ?? 'Utilisateur',
          initials: (u?.email?.[0] ?? 'U').toUpperCase(),
        });
      }).catch(() => setUserDisplay(null));
    });
  }, [profileRefreshKey]);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'appointments', label: 'Mes Rendez-vous', icon: Calendar },
    { id: 'practitioners', label: 'Trouver un Praticien', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'journal', label: 'Mon Journal', icon: BookOpen },
    { id: 'news', label: 'Actualités Bien-être', icon: Bell },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'logout', label: 'Déconnexion', icon: LogOut },
  ];

  const demoRoles = [
    { id: 'dashboard', label: '👤 Vue Employé' },
    { id: 'practitioner-dashboard', label: '👨‍⚕️ Vue Praticien' },
    { id: 'hr-dashboard', label: '👔 Vue Admin RH' },
    { id: 'practitioner-billing', label: '💰 Suivi Praticiens (Admin)' },
    { id: 'employee-usage', label: '📊 Suivi Employés (RH)' },
    { id: 'landing', label: '🌐 Landing Page' },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-[#2C3E50] text-white">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">HuntZen</h2>
            <p className="text-xs text-white/60">Care Platform</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button
          variant="destructive"
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
          onClick={onEmergencyClick}
        >
          <AlertCircle className="w-4 h-4" />
          Besoin d&apos;aide immédiate
        </Button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = 'badge' in item ? (item as any).badge : undefined;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                isActive ? 'bg-primary text-white shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {badge != null && badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="mb-3">
          <p className="text-xs text-white/40 uppercase px-4 mb-2">Démo - Changer de vue</p>
          {demoRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => onTabChange(role.id)}
              className="w-full text-left px-4 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-all"
            >
              {role.label}
            </button>
          ))}
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isLogout = item.id === 'logout';
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isLogout && onLogout) onLogout();
                else onTabChange(item.id);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => onTabChange('profile')}
          className="w-full flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {userDisplay?.initials ?? '…'}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{userDisplay?.name ?? '…'}</p>
            <p className="text-xs text-white/60">Voir mon profil</p>
          </div>
        </button>
      </div>
    </div>
  );
}
