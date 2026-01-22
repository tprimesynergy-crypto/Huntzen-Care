'use client';

import { useState } from 'react';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import {
  Calendar,
  Video,
  MessageSquare,
  BookOpen,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // Mock data
  const upcomingAppointment = {
    id: '1',
    practitioner: {
      name: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    date: '2025-01-25',
    time: '14:00',
    type: 'Visioconférence',
    status: 'confirmed',
  };

  const stats = [
    {
      label: 'Consultations ce mois',
      value: '3',
      change: '+1',
      trend: 'up',
      icon: Video,
      color: 'text-primary',
      bgColor: 'bg-primary-light',
    },
    {
      label: 'Temps total',
      value: '150 min',
      change: '+50 min',
      trend: 'up',
      icon: Clock,
      color: 'text-secondary',
      bgColor: 'bg-secondary-light',
    },
    {
      label: 'Articles lus',
      value: '8',
      change: '+3',
      trend: 'up',
      icon: BookOpen,
      color: 'text-accent',
      bgColor: 'bg-accent-light',
    },
    {
      label: 'Prochain RDV',
      value: 'Demain',
      change: '14h00',
      trend: 'neutral',
      icon: Calendar,
      color: 'text-info',
      bgColor: 'bg-blue-50',
    },
  ];

  const quickActions = [
    {
      label: 'Prendre RDV',
      icon: Calendar,
      href: '/employee/find-practitioner',
      color: 'primary',
    },
    {
      label: 'Rejoindre séance',
      icon: Video,
      href: '/employee/sessions',
      color: 'secondary',
      disabled: false,
    },
    {
      label: 'Mon journal',
      icon: BookOpen,
      href: '/employee/journal',
      color: 'accent',
    },
    {
      label: 'Ressources',
      icon: Heart,
      href: '/employee/resources',
      color: 'success',
    },
  ];

  const resources = [
    {
      id: 1,
      title: 'Gérer le stress au travail',
      category: 'Gestion du stress',
      duration: '5 min',
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=200&fit=crop',
    },
    {
      id: 2,
      title: 'Techniques de respiration',
      category: 'Relaxation',
      duration: '3 min',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop',
    },
    {
      id: 3,
      title: 'Améliorer son sommeil',
      category: 'Bien-être',
      duration: '7 min',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=200&fit=crop',
    },
  ];

  const moods = [
    { value: 1, icon: Frown, label: 'Difficile', color: 'text-red-500' },
    { value: 2, icon: Meh, label: 'Moyen', color: 'text-orange-500' },
    { value: 3, icon: Smile, label: 'Bien', color: 'text-green-500' },
  ];

  return (
    <EmployeeLayout>
      <div className="container-app py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-zen p-6 sm:p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Bonjour Marc 👋
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl">
              Bienvenue dans votre espace bien-être. Comment vous sentez-vous aujourd'hui ?
            </p>
            
            {/* Mood Selector */}
            <div className="mt-6 flex flex-wrap gap-3">
              {moods.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.value;
                
                return (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isSelected
                        ? 'bg-white text-primary shadow-lg scale-105'
                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={stat.label}
                className="card card-hover p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                      {stat.value}
                    </p>
                    <p className={`text-sm mt-2 ${stat.trend === 'up' ? 'text-success' : 'text-text-tertiary'}`}>
                      {stat.change}
                    </p>
                  </div>
                  
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointment */}
            {upcomingAppointment && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Prochain rendez-vous
                  </h2>
                </div>
                
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-hover">
                        <img
                          src={upcomingAppointment.practitioner.avatar}
                          alt={upcomingAppointment.practitioner.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary">
                        {upcomingAppointment.practitioner.name}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {upcomingAppointment.practitioner.specialty}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Calendar className="w-4 h-4" />
                          <span>Demain, {upcomingAppointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Video className="w-4 h-4" />
                          <span>{upcomingAppointment.type}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button className="btn-primary btn-sm">
                          <Video className="w-4 h-4" />
                          Rejoindre la séance
                        </button>
                        <button className="btn-outline btn-sm">
                          <Calendar className="w-4 h-4" />
                          Replanifier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-text-primary">
                  Actions rapides
                </h2>
              </div>
              
              <div className="card-body">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    
                    return (
                      <button
                        key={action.label}
                        disabled={action.disabled}
                        className={`
                          flex flex-col items-center gap-3 p-4 rounded-xl
                          transition-all duration-200
                          ${action.disabled
                            ? 'bg-surface-hover cursor-not-allowed opacity-50'
                            : 'bg-surface-hover hover:bg-primary-light hover:text-primary hover:shadow-md cursor-pointer'
                          }
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center
                          ${action.color === 'primary' ? 'bg-primary text-white' :
                            action.color === 'secondary' ? 'bg-secondary text-white' :
                            action.color === 'accent' ? 'bg-accent text-white' :
                            'bg-success text-white'}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-center">
                          {action.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  Ressources recommandées
                </h2>
                <button className="btn-ghost btn-sm">
                  Tout voir
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="card-body">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          src={resource.image}
                          alt={resource.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="badge badge-primary backdrop-blur-sm">
                            {resource.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        {resource.duration} de lecture
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-base font-semibold text-text-primary">
                  Votre activité
                </h2>
              </div>
              
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        3 séances
                      </p>
                      <p className="text-xs text-text-secondary">
                        Ce mois-ci
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-light text-secondary flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        5 entrées
                      </p>
                      <p className="text-xs text-text-secondary">
                        Journal
                      </p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-text-tertiary" />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-light text-accent flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        8 articles
                      </p>
                      <p className="text-xs text-text-secondary">
                        Lus
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Support */}
            <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <div className="card-body">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-error text-white flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🆘</span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Besoin d'aide immédiate ?
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Contactez notre ligne d'urgence disponible 24/7
                  </p>
                  <button className="btn-primary w-full bg-error hover:bg-error/90">
                    Appeler maintenant
                  </button>
                  <p className="text-xs text-text-tertiary mt-3">
                    Ligne d'écoute : 3114 (gratuit)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
