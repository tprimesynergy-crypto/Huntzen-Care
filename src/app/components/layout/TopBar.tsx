import { Bell, Search, Building2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { ThemeToggle } from '@/app/components/layout/ThemeToggle';

interface TopBarProps {
  onViewCompany?: () => void;
}

export function TopBar({ onViewCompany }: TopBarProps) {
  return (
    <div className="h-16 bg-white dark:bg-[#1a1f2e] border-b border-border flex items-center justify-between px-6 transition-colors">
      {/* Search Bar */}
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

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Company Profile (Demo) */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={onViewCompany}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Mon entreprise
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">Marc Dupont</p>
            <p className="text-xs text-muted-foreground">Employé</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            M
          </div>
        </div>
      </div>
    </div>
  );
}