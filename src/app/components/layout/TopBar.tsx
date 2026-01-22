import { useState, useEffect } from 'react';
import { Bell, Search, Building2, LogOut } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { ThemeToggle } from '@/app/components/layout/ThemeToggle';
import { api } from '@/app/services/api';

interface TopBarProps {
  onViewCompany?: () => void;
  onLogout?: () => void;
}

export function TopBar({ onViewCompany, onLogout }: TopBarProps) {
  const [userDisplay, setUserDisplay] = useState<{ name: string; role: string; initials: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, []);

  useEffect(() => {
    api.getUnreadNotificationsCount().then(setUnreadCount).catch(() => {});
  }, []);

  return (
    <div className="h-16 bg-white dark:bg-[#1a1f2e] border-b border-border flex items-center justify-between px-6 transition-colors">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un praticien, un article..."
            className="pl-10 bg-input-background border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onViewCompany}>
          <Building2 className="w-4 h-4 mr-2" />
          Mon entreprise
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{userDisplay?.name ?? '…'}</p>
            <p className="text-xs text-muted-foreground">{userDisplay?.role ?? '…'}</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {userDisplay?.initials ?? '…'}
          </div>
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
