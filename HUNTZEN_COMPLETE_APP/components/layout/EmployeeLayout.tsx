'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Calendar,
  Video,
  MessageSquare,
  BookOpen,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  Heart,
  FileText,
} from 'lucide-react';

interface EmployeeLayoutProps {
  children: ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/employee', icon: Home },
    { name: 'Trouver un praticien', href: '/employee/find-practitioner', icon: Heart },
    { name: 'Mes RDV', href: '/employee/appointments', icon: Calendar },
    { name: 'Mes séances', href: '/employee/sessions', icon: Video },
    { name: 'Journal intime', href: '/employee/journal', icon: FileText },
    { name: 'Chat', href: '/employee/chat', icon: MessageSquare },
    { name: 'Ressources', href: '/employee/resources', icon: BookOpen },
  ];

  const notifications = [
    {
      id: 1,
      title: 'RDV confirmé',
      message: 'Votre séance avec Dr. Sophie Martin est confirmée pour demain à 14h',
      time: 'Il y a 5 min',
      unread: true,
    },
    {
      id: 2,
      title: 'Nouvelle ressource',
      message: 'Article: "Gérer le stress au travail" est maintenant disponible',
      time: 'Il y a 2h',
      unread: true,
    },
    {
      id: 3,
      title: 'Rappel',
      message: 'Votre séance commence dans 1 heure',
      time: 'Il y a 3h',
      unread: false,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* === SIDEBAR DESKTOP === */}
      <aside
        className={`
          sidebar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/employee" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-zen flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-text-primary">HuntZen</h1>
              <p className="text-xs text-text-secondary">Espace bien-être</p>
            </div>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-hover">
            <div className="w-10 h-10 rounded-full bg-gradient-zen flex items-center justify-center text-white font-semibold">
              MD
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-medium text-text-primary truncate">
                Marc Dupont
              </p>
              <p className="text-xs text-text-secondary truncate">
                marc.dupont@techcorp.com
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Link
              href="/employee/settings"
              className="sidebar-item"
            >
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
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost btn-sm"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Rechercher un praticien, une ressource..."
                className="input pl-10"
              />
              <div className="input-icon">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="btn-ghost btn-sm relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="dropdown right-0 w-80 z-50">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-sm font-semibold text-text-primary">
                        Notifications
                      </h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`
                            p-4 border-b border-border last:border-0
                            hover:bg-surface-hover cursor-pointer
                            ${notif.unread ? 'bg-primary-light/30' : ''}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            {notif.unread && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">
                                {notif.title}
                              </p>
                              <p className="text-sm text-text-secondary mt-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-text-tertiary mt-2">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-3 border-t border-border">
                      <button className="w-full btn-ghost btn-sm text-primary">
                        Tout marquer comme lu
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Emergency button */}
            <button className="btn-primary btn-sm hidden sm:inline-flex bg-error hover:bg-error/90">
              <span className="text-xs">🆘</span>
              <span className="hidden lg:inline">Urgence</span>
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
