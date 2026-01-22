'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Upload,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Building2,
  Download,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface RHLayoutProps {
  children: ReactNode;
}

export default function RHLayout({ children }: RHLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/rh', icon: LayoutDashboard },
    { name: 'Employés', href: '/rh/employees', icon: Users },
    { name: 'Import CSV', href: '/rh/import', icon: Upload },
    { name: 'Métriques usage', href: '/rh/metrics', icon: BarChart3 },
    { name: 'Entreprise', href: '/rh/company', icon: Building2 },
    { name: 'News internes', href: '/rh/news', icon: FileText },
  ];

  // Mock KPIs temps réel
  const kpis = {
    totalEmployees: 85,
    activeEmployees: 68,
    usageRate: 80,
    consultationsMonth: 142,
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* === SIDEBAR === */}
      <aside
        className={`
          sidebar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/rh" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-text-primary">HuntZen</h1>
              <p className="text-xs text-text-secondary">Espace RH</p>
            </div>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPIs rapides */}
        <div className="px-4 py-4 border-b border-border">
          <div className="bg-gradient-to-br from-accent-light to-white p-4 rounded-xl border border-accent/20">
            <p className="text-xs text-text-secondary mb-1">Taux d'utilisation</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-accent">{kpis.usageRate}%</p>
              <TrendingUp className="w-5 h-5 text-success mb-1" />
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {kpis.activeEmployees}/{kpis.totalEmployees} employés actifs
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  sidebar-item
                  ${active ? 'sidebar-item-active' : ''}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Company Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-light to-accent-light/50">
            <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-xs">
              TC
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-medium text-text-primary truncate">
                TechCorp France
              </p>
              <p className="text-xs text-text-secondary truncate">
                Admin RH
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Link href="/rh/settings" className="sidebar-item">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm hidden lg:inline">Paramètres</span>
            </Link>
            
            <button className="sidebar-item w-full text-error hover:bg-red-50">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm hidden lg:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost btn-sm"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Stats rapides */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-surface-hover rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                  {kpis.consultationsMonth} consultations
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                  Ce mois
                </span>
              </div>
            </div>

            {/* Export button */}
            <button className="btn-outline btn-sm hidden sm:inline-flex">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            {/* Notifications */}
            <button className="btn-ghost btn-sm relative">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
