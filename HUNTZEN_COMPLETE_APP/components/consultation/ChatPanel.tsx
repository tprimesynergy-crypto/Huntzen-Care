'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
  Check,
  CheckCheck,
  Smile,
  MoreVertical,
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'read';
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

interface ChatPanelProps {
  consultationId: string;
  currentUserId: string;
  currentUserName: string;
  otherUserName: string;
  onClose?: () => void;
}

export default function ChatPanel({
  consultationId,
  currentUserId,
  currentUserName,
  otherUserName,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock messages initiaux
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'other',
        senderName: otherUserName,
        content: 'Bonjour, comment allez-vous aujourd\'hui ?',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'read',
      },
      {
        id: '2',
        senderId: currentUserId,
        senderName: currentUserName,
        content: 'Bonjour, je vais bien merci. Je suis prêt pour notre séance.',
        timestamp: new Date(Date.now() - 9 * 60 * 1000),
        status: 'read',
      },
      {
        id: '3',
        senderId: 'other',
        senderName: otherUserName,
        content: 'Parfait ! Nous pouvons commencer. Qu\'est-ce que vous aimeriez aborder aujourd\'hui ?',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'read',
      },
    ];
    setMessages(mockMessages);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && !attachment) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
      ...(attachment && {
        attachment: {
          type: attachment.type.startsWith('image/') ? 'image' : 'file',
          url: URL.createObjectURL(attachment),
          name: attachment.name,
        },
      }),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setAttachment(null);

    // Simuler envoi
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);

    // Simuler lecture
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary-light to-white">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            {otherUserName}
          </h3>
          <p className="text-xs text-text-secondary">
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1">En train d'écrire...</span>
              </span>
            ) : (
              'En ligne'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm">
            <MoreVertical className="w-5 h-5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-ghost btn-sm">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.reduce((acc, message, index) => {
          const prevMessage = messages[index - 1];
          const showDateDivider =
            !prevMessage ||
            formatDate(prevMessage.timestamp) !== formatDate(message.timestamp);

          if (showDateDivider) {
            acc.push(
              <div key={`date-${index}`} className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-border rounded-full text-xs text-text-secondary">
                  {formatDate(message.timestamp)}
                </span>
              </div>
            );
          }

          const isOwn = message.senderId === currentUserId;

          acc.push(
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[75%] sm:max-w-[60%]
                  ${isOwn ? 'items-end' : 'items-start'}
                `}
              >
                {/* Attachment */}
                {message.attachment && (
                  <div className="mb-2">
                    {message.attachment.type === 'image' ? (
                      <img
                        src={message.attachment.url}
                        alt={message.attachment.name}
                        className="rounded-xl max-w-full h-auto"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                          <File className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {message.attachment.name}
                          </p>
                          <p className="text-xs text-text-secondary">Document</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                {message.content && (
                  <div
                    className={`
                      px-4 py-2.5 rounded-2xl
                      ${isOwn
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-surface-hover text-text-primary rounded-bl-sm'
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                )}

                {/* Timestamp & Status */}
                <div
                  className={`
                    flex items-center gap-1 mt-1 px-2
                    ${isOwn ? 'justify-end' : 'justify-start'}
                  `}
                >
                  <span className="text-xs text-text-tertiary">
                    {formatTime(message.timestamp)}
                  </span>
                  {isOwn && (
                    <span className="text-text-tertiary">
                      {message.status === 'sending' && (
                        <div className="w-3 h-3 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />
                      )}
                      {message.status === 'sent' && <Check className="w-3 h-3" />}
                      {message.status === 'read' && <CheckCheck className="w-3 h-3 text-primary" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );

          return acc;
        }, [] as React.ReactNode[])}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-6 py-3 border-t border-border bg-surface-hover">
          <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              {attachment.type.startsWith('image/') ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <File className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-text-secondary">
                {(attachment.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="btn-ghost btn-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-white">
        <div className="flex items-end gap-2">
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost btn-sm flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Votre message..."
              rows={1}
              className="input resize-none pr-10 min-h-[42px] max-h-32"
            />
            <button className="absolute right-2 bottom-2 btn-ghost btn-sm">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && !attachment}
            className="btn-primary btn-sm flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-text-tertiary mt-2">
          🔒 Vos conversations sont chiffrées de bout en bout
        </p>
      </div>
    </div>
  );
}
