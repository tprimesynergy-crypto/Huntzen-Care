import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Search, Building2, LogOut } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { ThemeToggle } from '@/app/components/layout/ThemeToggle';
import { api } from '@/app/services/api';

interface TopBarProps {
  onViewCompany?: () => void;
  onViewProfile?: () => void;
  onLogout?: () => void;
  profileRefreshKey?: number;
  globalSearch?: string;
  onGlobalSearchChange?: (value: string) => void;
  onGlobalSearchSubmit?: () => void;
}

export function TopBar({
  onViewCompany,
  onViewProfile,
  onLogout,
  profileRefreshKey,
  globalSearch,
  onGlobalSearchChange,
  onGlobalSearchSubmit,
}: TopBarProps) {
  const [userDisplay, setUserDisplay] = useState<{ name: string; role: string; initials: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const refreshUnread = useCallback(() => {
    api.getUnreadNotificationsCount().then(setUnreadCount).catch(() => {});
  }, []);

  useEffect(() => {
    api.getEmployeeMe().then((e: any) => {
      const name = e?.firstName && e?.lastName ? `${e.firstName} ${e.lastName}` : e?.user?.email ?? 'Utilisateur';
      const initials = e?.firstName && e?.lastName
        ? `${e.firstName[0]}${e.lastName[0]}`.toUpperCase()
        : (e?.user?.email?.[0] ?? 'U').toUpperCase();
      setUserDisplay({
        name,
        role: 'Employé',
        initials,
      });
    }).catch(() => {
      api.getMe().then((u: any) => {
        setUserDisplay({
          name: u?.email ?? 'Utilisateur',
          role: u?.role ?? 'Utilisateur',
          initials: (u?.email?.[0] ?? 'U').toUpperCase(),
        });
      }).catch(() => setUserDisplay(null));
    });
  }, [profileRefreshKey]);

  useEffect(() => {
    refreshUnread();
    
    // Auto-refresh unread count every 15 seconds
    const interval = setInterval(() => {
      refreshUnread();
    }, 15000); // 15 seconds
    
    // Refresh when user returns to the tab/window
    const handleFocus = () => {
      refreshUnread();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshUnread]);

  useEffect(() => {
    if (!notificationsOpen) return;
    setNotificationsLoading(true);
    api.getNotifications()
      .then((list) => setNotifications(Array.isArray(list) ? list : []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
    
    // Also refresh unread count when opening notifications
    refreshUnread();
    
    // Auto-refresh notifications list while dropdown is open (every 10 seconds)
    const interval = setInterval(() => {
      api.getNotifications()
        .then((list) => setNotifications(Array.isArray(list) ? list : []))
        .catch(() => setNotifications([]));
      refreshUnread();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [notificationsOpen, refreshUnread]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      refreshUnread();
    } catch {}
  };

  return (
    <div className="h-16 bg-white dark:bg-[#1a1f2e] border-b border-border flex items-center justify-between px-6 transition-colors">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un praticien, un article..."
            className="pl-10 bg-input-background border-border"
            value={globalSearch ?? ''}
            onChange={(e) => onGlobalSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onGlobalSearchSubmit?.();
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onViewCompany}>
          <Building2 className="w-4 h-4 mr-2" />
          Mon entreprise
        </Button>
        <ThemeToggle />
        <div className="relative">
          <button
            type="button"
            title="Notifications"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1" aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen &&
            createPortal(
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-[99] cursor-default"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Fermer les notifications"
                />
                <div
                  className="fixed right-6 top-[4.5rem] z-[100] w-80 rounded-md border border-border bg-background text-foreground shadow-lg overflow-hidden"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="p-3 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Chargement…
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Aucune notification.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                            className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                          >
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>,
              document.body,
              'notifications-dropdown'
            )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onViewProfile}
            className="flex items-center gap-3 rounded-md hover:bg-accent/50 transition-colors -m-2 p-2"
            title="Mon profil"
          >
            <div className="text-right">
              <p className="text-sm font-medium">{userDisplay?.name ?? '…'}</p>
              <p className="text-xs text-muted-foreground">{userDisplay?.role ?? '…'}</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shrink-0">
              {userDisplay?.initials ?? '…'}
            </div>
          </button>
          {onLogout && (
            <Button variant="ghost" size="icon" onClick={onLogout} title="Déconnexion">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
