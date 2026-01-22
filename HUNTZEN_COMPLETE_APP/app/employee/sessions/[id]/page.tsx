'use client';

import { useState } from 'react';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import JitsiRoom from '@/components/consultation/JitsiRoom';
import ChatPanel from '@/components/consultation/ChatPanel';
import {
  MessageSquare,
  FileText,
  Info,
  Clock,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConsultationRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Mock consultation data
  const consultation = {
    id: params.id,
    practitioner: {
      id: 'prac-1',
      name: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    patient: {
      id: 'patient-1',
      name: 'Marc Dupont',
    },
    scheduledAt: new Date(),
    duration: 50,
    type: 'Visioconférence',
    status: 'in_progress',
  };

  const handleEndConsultation = () => {
    // Simuler fin de consultation
    const confirm = window.confirm(
      'Êtes-vous sûr de vouloir quitter la consultation ?'
    );
    
    if (confirm) {
      router.push('/employee/sessions');
    }
  };

  return (
    <EmployeeLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          <JitsiRoom
            roomName={`huntzen-${consultation.id}`}
            userName={consultation.patient.name}
            userEmail="marc.dupont@techcorp.com"
            isPractitioner={false}
            onEnd={handleEndConsultation}
            onChatToggle={() => setShowChat(!showChat)}
          />

          {/* Info Button (Top Right) */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md p-3 rounded-xl text-white hover:bg-black/80 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Info Panel */}
          {showInfo && (
            <div className="absolute top-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-right">
              <div className="bg-gradient-zen p-4 text-white">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">Informations</h3>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Practitioner */}
                <div>
                  <p className="text-xs text-text-secondary mb-2">Praticien</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={consultation.practitioner.avatar}
                      alt={consultation.practitioner.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {consultation.practitioner.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {consultation.practitioner.specialty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Date</p>
                      <p className="text-sm font-medium text-text-primary">
                        {consultation.scheduledAt.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-light text-secondary flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Durée prévue</p>
                      <p className="text-sm font-medium text-text-primary">
                        {consultation.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                {/* Tips */}
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    💡 Conseils pour la consultation
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Trouvez un endroit calme</li>
                    <li>• Vérifiez votre micro et caméra</li>
                    <li>• Prenez des notes si nécessaire</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-full sm:w-96 border-l border-border bg-white animate-slide-in-right">
            <ChatPanel
              consultationId={consultation.id}
              currentUserId={consultation.patient.id}
              currentUserName={consultation.patient.name}
              otherUserName={consultation.practitioner.name}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}

        {/* Mobile Chat Toggle */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 z-40 btn-primary shadow-2xl sm:hidden"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </button>
        )}
      </div>
    </EmployeeLayout>
  );
}
