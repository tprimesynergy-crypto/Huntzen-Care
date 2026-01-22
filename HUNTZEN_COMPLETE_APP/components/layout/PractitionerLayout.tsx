'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Video,
  FileText,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  Stethoscope,
  BarChart3,
  Download,
  Clock,
  Users,
} from 'lucide-react';

interface PractitionerLayoutProps {
  children: ReactNode;
}

export default function PractitionerLayout({ children }: PractitionerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/practitioner', icon: LayoutDashboard },
    { name: 'Agenda', href: '/practitioner/agenda', icon: Calendar },
    { name: 'Consultations', href: '/practitioner/consultations', icon: Video },
    { name: 'Notes cliniques', href: '/practitioner/notes', icon: FileText },
    { name: 'Mon profil', href: '/practitioner/profile', icon: User },
    { name: 'Compteurs & Export', href: '/practitioner/usage', icon: BarChart3 },
  ];

  // Mock compteurs temps réel
  const stats = {
    todayConsultations: 3,
    weekConsultations: 12,
    monthConsultations: 45,
    totalDuration: '37.5h',
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
          <Link href="/practitioner" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-text-primary">HuntZen</h1>
              <p className="text-xs text-text-secondary">Espace praticien</p>
            </div>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compteurs rapides */}
        <div className="px-4 py-4 border-b border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-secondary-light to-white p-3 rounded-xl border border-secondary/20">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-secondary" />
                <span className="text-xs text-text-secondary">Aujourd'hui</span>
              </div>
              <p className="text-2xl font-bold text-secondary">{stats.todayConsultations}</p>
            </div>
            
            <div className="bg-gradient-to-br from-primary-light to-white p-3 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-text-secondary">Ce mois</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.monthConsultations}</p>
            </div>
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

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-secondary-light to-secondary-light/50">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-semibold">
              SM
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-medium text-text-primary truncate">
                Dr. Sophie Martin
              </p>
              <p className="text-xs text-text-secondary truncate">
                Psychologue clinicienne
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Link href="/practitioner/settings" className="sidebar-item">
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
            {/* Compteur temps réel */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-surface-hover rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                  {stats.weekConsultations} cette semaine
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                  {stats.totalDuration} ce mois
                </span>
              </div>
            </div>

            {/* Export button */}
            <Link href="/practitioner/usage" className="btn-outline btn-sm hidden sm:inline-flex">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Link>

            {/* Notifications */}
            <button className="btn-ghost btn-sm relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-success text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
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
