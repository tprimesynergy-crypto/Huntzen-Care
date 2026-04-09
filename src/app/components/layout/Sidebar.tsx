import { useState, useEffect } from 'react';
import { Home, Calendar, MessageSquare, BookOpen, Heart, Bell, Settings, LogOut, AlertCircle, Users, Link2, Phone, Activity } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { api } from '@/app/services/api';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEmergencyClick: () => void;
  onLogout?: () => void;
  profileRefreshKey?: number;
  userRole?: string | null;
  unreadMessagesCount?: number;
}

export function Sidebar({ activeTab, onTabChange, onEmergencyClick, onLogout, profileRefreshKey, userRole, unreadMessagesCount = 0 }: SidebarProps) {
  const [userDisplay, setUserDisplay] = useState<{ name: string; initials: string; avatarUrl?: string | null } | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_HUNTZEN' || userRole === 'ADMIN_RH';
    const isPractitioner = userRole === 'PRACTITIONER';

    if (isPractitioner) {
      api.getPractitionerMe().then((p: any) => {
        const name = p?.firstName && p?.lastName ? `${p.title || ''} ${p.firstName} ${p.lastName}`.trim() : p?.user?.email ?? 'Utilisateur';
        const initials = p?.firstName && p?.lastName
          ? `${p.firstName[0]}${p.lastName[0]}`.toUpperCase()
          : (p?.user?.email?.[0] ?? 'U').toUpperCase();
        setUserDisplay({ name, initials, avatarUrl: p?.avatarUrl ?? null });
      }).catch(() => {
        api.getMe().then((u: any) => {
          setUserDisplay({
            name: u?.email ?? 'Utilisateur',
            initials: (u?.email?.[0] ?? 'U').toUpperCase(),
            avatarUrl: null,
          });
        }).catch(() => setUserDisplay(null));
      });
      return;
    }

    if (isAdmin) {
      api.getMe().then((u: any) => {
        const name = u?.firstName && u?.lastName ? `${u.firstName} ${u.lastName}` : u?.email ?? 'Utilisateur';
        const initials = u?.firstName && u?.lastName
          ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
          : (u?.email?.[0] ?? 'U').toUpperCase();
        setUserDisplay({ name, initials, avatarUrl: u?.avatarUrl ?? null });
      }).catch(() => setUserDisplay(null));
      return;
    }

    api.getEmployeeMe().then((e: any) => {
      const name = e?.firstName && e?.lastName ? `${e.firstName} ${e.lastName}` : e?.user?.email ?? null;
      const initials = e?.firstName && e?.lastName
        ? `${e.firstName[0]}${e.lastName[0]}`.toUpperCase()
        : (e?.user?.email?.[0] ?? 'U').toUpperCase();
      setUserDisplay(name ? { name, initials, avatarUrl: e?.avatarUrl ?? null } : { name: e?.user?.email ?? 'Utilisateur', initials, avatarUrl: e?.avatarUrl ?? null });
    }).catch(() => {
      api.getMe().then((u: any) => {
        setUserDisplay({
          name: u?.email ?? 'Utilisateur',
          initials: (u?.email?.[0] ?? 'U').toUpperCase(),
          avatarUrl: u?.avatarUrl ?? null,
        });
      }).catch(() => setUserDisplay(null));
    });
  }, [profileRefreshKey, userRole]);

  // Menu items vary by role
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdminHuntzen = userRole === 'ADMIN_HUNTZEN';
  const isAdminRH = userRole === 'ADMIN_RH';
  const isPractitioner = userRole === 'PRACTITIONER';

  const menuItems = isPractitioner
    ? [
        { id: 'practitioner-dashboard', label: 'Tableau de Bord', icon: Home },
        { id: 'practitioners', label: 'Liste des praticiens', icon: Users },
        { id: 'appointments', label: 'Mes Consultations', icon: Calendar },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'news', label: 'Actualités Bien-être', icon: Bell },
      ]
    : isSuperAdmin
    ? [
        { id: 'admin-huntzen-dashboard', label: 'Tableau de Bord', icon: Home },
        { id: 'admin-practitioners', label: 'Praticiens', icon: Heart },
        { id: 'admin-management-admins', label: 'Admins RH / DRH', icon: Users },
        { id: 'admin-management-companies', label: 'Entreprises', icon: Home },
        { id: 'admin-activity-log', label: 'Journal d\'activité', icon: Activity },
        { id: 'news', label: 'Actualités Bien-être', icon: Bell },
      ]
    : isAdminRH
    ? [
        { id: 'hr-dashboard', label: 'Tableau de Bord', icon: Home },
        { id: 'hr-invitations', label: 'Invitations', icon: Link2 },
        { id: 'employee-usage', label: 'Suivi Employés', icon: Users },
        { id: 'hr-consultations', label: 'Suivi Consultations', icon: Calendar },
        { id: 'news', label: 'Actualités Bien-être', icon: Bell },
      ]
    : isAdminHuntzen
    ? [
        { id: 'admin-huntzen-dashboard', label: 'Tableau de Bord', icon: Home },
        { id: 'admin-practitioners', label: 'Praticiens', icon: Heart },
        { id: 'admin-management-admins', label: 'Admins RH / DRH', icon: Users },
        { id: 'admin-management-companies', label: 'Entreprises', icon: Home },
        { id: 'admin-emergency-resources', label: 'Numéros d\'urgence & Ressources', icon: Phone },
        { id: 'news', label: 'Actualités Bien-être', icon: Bell },
      ]
    : [
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
    <div className="flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground overflow-y-auto">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden bg-white p-1">
            <img src="/huntzen-logo.png" alt="HuntZen" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-sidebar-foreground">HuntZen</h2>
            <p className="text-xs text-sidebar-foreground/60">Care Platform</p>
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
          const unreadCount = Number(unreadMessagesCount ?? 0);
          const showUnreadDot = item.id === 'messages' && unreadCount > 0;
          if (item.id === 'messages') {
            console.log('[Sidebar] Messages item — unreadMessagesCount prop:', unreadMessagesCount, 'unreadCount:', unreadCount, 'showUnreadDot:', showUnreadDot);
          }
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <span className="relative inline-flex">
                <Icon className="w-5 h-5" />
                {showUnreadDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-sidebar" aria-hidden />
                )}
              </span>
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

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {isDev && (
          <div className="mb-3">
            <p className="text-xs text-sidebar-foreground/50 uppercase px-4 mb-2">Démo - Changer de vue</p>
            {demoRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => onTabChange(role.id)}
                className="w-full text-left px-4 py-2 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all"
              >
                {role.label}
              </button>
            ))}
          </div>
        )}
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => onTabChange('profile')}
          className="w-full flex items-center gap-3 hover:bg-sidebar-accent p-2 rounded-lg transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sidebar-primary-foreground font-semibold shrink-0 overflow-hidden bg-sidebar-primary"
            style={userDisplay?.avatarUrl ? { backgroundImage: `url(${api.getUploadUrl(userDisplay.avatarUrl)})`, backgroundSize: 'cover' } : undefined}
          >
            {!userDisplay?.avatarUrl && (userDisplay?.initials ?? '…')}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userDisplay?.name ?? '…'}</p>
            <p className="text-xs text-sidebar-foreground/60">Voir mon profil</p>
          </div>
        </button>
      </div>
    </div>
  );
}
