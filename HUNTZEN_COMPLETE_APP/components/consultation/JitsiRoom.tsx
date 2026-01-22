'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  Settings,
  Users,
  MessageSquare,
  Info,
} from 'lucide-react';

interface JitsiRoomProps {
  roomName: string;
  userName: string;
  userEmail?: string;
  isPractitioner?: boolean;
  onEnd?: () => void;
  onChatToggle?: () => void;
}

// Déclaration globale pour JitsiMeetExternalAPI
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiRoom({
  roomName,
  userName,
  userEmail,
  isPractitioner = false,
  onEnd,
  onChatToggle,
}: JitsiRoomProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [duration, setDuration] = useState(0);

  // Timer pour la durée
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialisation Jitsi
  useEffect(() => {
    // Charger le script Jitsi
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initJitsi();
      document.body.appendChild(script);
    } else {
      initJitsi();
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomName]);

  const initJitsi = () => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si'; // Remplacer par votre domaine Jitsi
    
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userName,
        email: userEmail,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        defaultLanguage: 'fr',
        toolbarButtons: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'videobackgroundblur',
          'download',
          'help',
          'mute-everyone',
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#FAFBFC',
        DISABLE_VIDEO_BACKGROUND: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;

    // Events
    api.addEventListener('videoConferenceJoined', () => {
      setIsLoading(false);
      console.log('Conference joined');
    });

    api.addEventListener('participantJoined', () => {
      setParticipantCount((prev) => prev + 1);
    });

    api.addEventListener('participantLeft', () => {
      setParticipantCount((prev) => Math.max(1, prev - 1));
    });

    api.addEventListener('audioMuteStatusChanged', (event: any) => {
      setIsMuted(event.muted);
    });

    api.addEventListener('videoMuteStatusChanged', (event: any) => {
      setIsVideoOff(event.muted);
    });

    api.addEventListener('screenSharingStatusChanged', (event: any) => {
      setIsScreenSharing(event.on);
    });

    api.addEventListener('readyToClose', () => {
      onEnd?.();
    });
  };

  const toggleAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleScreenShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleShareScreen');
    }
  };

  const endCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    onEnd?.();
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-zen">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">Connexion en cours...</p>
            <p className="text-sm text-white/80 mt-2">Préparation de la salle</p>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div ref={jitsiContainerRef} className="w-full h-full" />

      {/* Custom Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-start justify-between">
        {/* Info Card */}
        <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{participantCount}</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium">{formatDuration(duration)}</span>
            </div>
            {isPractitioner && (
              <>
                <div className="w-px h-4 bg-white/30" />
                <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                  Praticien
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chat Toggle */}
        {onChatToggle && (
          <button
            onClick={onChatToggle}
            className="bg-black/60 backdrop-blur-md p-3 rounded-xl text-white hover:bg-black/80 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Controls (Custom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`
              p-4 rounded-xl transition-all
              ${isMuted
                ? 'bg-error text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
              }
            `}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`
              p-4 rounded-xl transition-all
              ${isVideoOff
                ? 'bg-error text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
              }
            `}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`
              p-4 rounded-xl transition-all
              ${isScreenSharing
                ? 'bg-primary text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
              }
            `}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>

          {/* Divider */}
          <div className="w-px h-10 bg-white/30 mx-2" />

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 rounded-xl bg-error text-white hover:bg-error/90 transition-all"
          >
            <Phone className="w-5 h-5 rotate-135" />
          </button>
        </div>
      </div>

      {/* Info Banner (if practitioner) */}
      {isPractitioner && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-secondary/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>La durée est enregistrée automatiquement</span>
          </div>
        </div>
      )}
    </div>
  );
}
