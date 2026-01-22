'use client';

import { useState } from 'react';
import PractitionerLayout from '@/components/layout/PractitionerLayout';
import {
  Video,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  FileText,
  DollarSign,
  BarChart3,
} from 'lucide-react';

export default function PractitionerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data - compteurs
  const counters = {
    today: {
      consultations: 3,
      completed: 2,
      scheduled: 1,
      duration: 150, // minutes
    },
    week: {
      consultations: 12,
      completed: 10,
      cancelled: 2,
      duration: 600,
    },
    month: {
      consultations: 45,
      completed: 40,
      cancelled: 3,
      noShow: 2,
      duration: 2250, // 37.5h
      averageDuration: 50,
    },
  };

  const stats = [
    {
      label: 'Consultations ce mois',
      value: counters.month.consultations,
      change: '+12%',
      trend: 'up',
      icon: Video,
      color: 'text-primary',
      bgColor: 'bg-primary-light',
    },
    {
      label: 'Temps total',
      value: `${(counters.month.duration / 60).toFixed(1)}h`,
      change: `${counters.month.duration} min`,
      trend: 'up',
      icon: Clock,
      color: 'text-secondary',
      bgColor: 'bg-secondary-light',
    },
    {
      label: 'Durée moyenne',
      value: `${counters.month.averageDuration} min`,
      change: '+5 min',
      trend: 'up',
      icon: BarChart3,
      color: 'text-accent',
      bgColor: 'bg-accent-light',
    },
    {
      label: 'Taux complétion',
      value: `${Math.round((counters.month.completed / counters.month.consultations) * 100)}%`,
      change: 'Excellent',
      trend: 'neutral',
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-green-50',
    },
  ];

  const upcomingConsultations = [
    {
      id: '1',
      patient: { initials: 'MD', name: 'Marc D.' },
      time: '14:00',
      duration: 50,
      type: 'Visioconférence',
      status: 'confirmed',
      isNew: false,
    },
    {
      id: '2',
      patient: { initials: 'CM', name: 'Claire M.' },
      time: '15:00',
      duration: 50,
      type: 'Visioconférence',
      status: 'scheduled',
      isNew: true,
    },
    {
      id: '3',
      patient: { initials: 'PL', name: 'Paul L.' },
      time: '16:30',
      duration: 50,
      type: 'Présentiel',
      status: 'confirmed',
      isNew: false,
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'completed',
      patient: 'Marc D.',
      time: 'Il y a 1h',
      duration: 50,
      notes: true,
    },
    {
      id: '2',
      type: 'completed',
      patient: 'Sophie L.',
      time: 'Il y a 3h',
      duration: 55,
      notes: true,
    },
    {
      id: '3',
      type: 'cancelled',
      patient: 'Jean P.',
      time: 'Hier',
      duration: 0,
      notes: false,
    },
  ];

  const exportData = {
    lastExport: '15/01/2025',
    format: 'CSV',
    consultations: 45,
    totalDuration: '37.5h',
  };

  return (
    <PractitionerLayout>
      <div className="container-app py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-secondary-hover p-6 sm:p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Bonjour Dr. Martin 👋
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl mb-4">
              Vous avez {counters.today.consultations} consultations aujourd'hui
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{counters.today.completed} terminées</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{counters.today.duration} min aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            
            return (
              <div key={stat.label} className="card card-hover p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-text-secondary mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.trend === 'up' ? 'text-success' : 'text-text-tertiary'}`}>
                      {stat.change}
                    </p>
                  </div>
                  
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl flex-shrink-0`}>
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
            {/* Consultations aujourd'hui */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  Consultations aujourd'hui
                </h2>
                <button className="btn-ghost btn-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Agenda complet</span>
                </button>
              </div>
              
              <div className="card-body">
                <div className="space-y-3">
                  {upcomingConsultations.map((consult) => (
                    <div
                      key={consult.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover hover:bg-primary-light transition-colors cursor-pointer"
                    >
                      {/* Time */}
                      <div className="flex-shrink-0 text-center">
                        <p className="text-lg font-bold text-text-primary">
                          {consult.time}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {consult.duration} min
                        </p>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-px h-12 bg-border" />
                      
                      {/* Patient */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-zen text-white flex items-center justify-center font-semibold text-sm">
                            {consult.patient.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">
                              {consult.patient.name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {consult.type}
                            </p>
                          </div>
                          {consult.isNew && (
                            <span className="badge badge-primary text-xs">
                              Nouveau
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div>
                        {consult.status === 'confirmed' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmé
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <AlertCircle className="w-3 h-3" />
                            En attente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activité récente */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-text-primary">
                  Activité récente
                </h2>
              </div>
              
              <div className="card-body">
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {activity.type === 'completed' ? (
                          <div className="w-10 h-10 rounded-full bg-green-50 text-success flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-50 text-error flex items-center justify-center">
                            <XCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {activity.type === 'completed' ? 'Consultation terminée' : 'Consultation annulée'}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {activity.patient} • {activity.time}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activity.duration > 0 && (
                          <span className="text-sm text-text-secondary">
                            {activity.duration} min
                          </span>
                        )}
                        {activity.notes && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Export carte */}
            <div className="card bg-gradient-to-br from-primary-light to-white border-primary/20">
              <div className="card-body">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Export pour paiement
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Exportez vos compteurs d'activité ce mois
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Consultations</span>
                      <span className="font-semibold text-text-primary">
                        {exportData.consultations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Temps total</span>
                      <span className="font-semibold text-text-primary">
                        {exportData.totalDuration}
                      </span>
                    </div>
                  </div>
                  
                  <button className="btn-primary w-full mb-2">
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </button>
                  
                  <p className="text-xs text-text-tertiary">
                    Dernier export : {exportData.lastExport}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques hebdomadaires */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-base font-semibold text-text-primary">
                  Cette semaine
                </h3>
              </div>
              
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {counters.week.consultations} consultations
                      </p>
                      <p className="text-xs text-text-secondary">
                        {counters.week.completed} complétées
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-light text-secondary flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {counters.week.duration} min
                      </p>
                      <p className="text-xs text-text-secondary">
                        {(counters.week.duration / 60).toFixed(1)}h cette semaine
                      </p>
                    </div>
                  </div>
                </div>
                
                {counters.week.cancelled > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-error flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {counters.week.cancelled} annulations
                        </p>
                        <p className="text-xs text-text-secondary">
                          Cette semaine
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-base font-semibold text-text-primary">
                  Actions rapides
                </h3>
              </div>
              
              <div className="card-body space-y-2">
                <button className="w-full btn-outline text-left justify-start">
                  <Calendar className="w-4 h-4" />
                  Gérer mon agenda
                </button>
                <button className="w-full btn-outline text-left justify-start">
                  <FileText className="w-4 h-4" />
                  Voir mes notes
                </button>
                <button className="w-full btn-outline text-left justify-start">
                  <Users className="w-4 h-4" />
                  Mes patients
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PractitionerLayout>
  );
}
