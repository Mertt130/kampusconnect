'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant1: any;
  participant2: any;
  lastMessage?: Message;
  unreadCount?: number;
  lastMessageAt?: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchConversations();
    initializeSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('access_token') },
    });

    socket.on('newMessage', (message: Message) => {
      if (message.conversationId === selectedConversation?.id) {
        setMessages(prev => [...prev, message]);
      }
      fetchConversations();
    });

    socket.on('userTyping', ({ userId, conversationId }) => {
      if (conversationId === selectedConversation?.id && userId !== user?.id) {
        setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
      }
    });

    socket.on('userStoppedTyping', ({ userId }) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    });

    socket.on('userOnline', ({ userId }) => {
      setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
    });

    socket.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    socketRef.current = socket;
  };

  const fetchConversations = async () => {
    try {
      const response: any = await api.getConversations();
      if (response?.success) {
        setConversations(response.data);
      } else {
        setConversations(getSampleConversations());
      }
    } catch (error) {
      setConversations(getSampleConversations());
    } finally {
      setLoading(false);
    }
  };

  const getSampleConversations = (): Conversation[] => {
    return [
      {
        id: '1',
        participant1: {
          id: '1',
          email: 'student1@example.com',
          studentProfile: {
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
          },
        },
        participant2: {
          id: '2',
          email: 'company1@example.com',
          companyProfile: {
            companyName: 'TechCorp',
          },
        },
        lastMessage: {
          id: '1',
          conversationId: '1',
          senderId: '2',
          content: 'Merhaba, başvurunuz hakkında görüşmek istiyoruz.',
          isRead: false,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        unreadCount: 2,
      },
    ];
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response: any = await api.getMessages(conversationId);
      if (response?.success) {
        setMessages(response.data);
      } else {
        setMessages(getSampleMessages());
      }
    } catch (error) {
      setMessages(getSampleMessages());
    }
  };

  const getSampleMessages = (): Message[] => {
    return [
      {
        id: '1',
        conversationId: '1',
        senderId: '2',
        content: 'Merhaba, başvurunuzu inceledik.',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        conversationId: '1',
        senderId: '1',
        content: 'Merhaba, ilginiz için teşekkür ederim.',
        isRead: true,
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        conversationId: '1',
        senderId: '2',
        content: 'Sizinle bir görüşme ayarlamak istiyoruz. Pazartesi günü saat 14:00 müsait misiniz?',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        conversationId: '1',
        senderId: '1',
        content: 'Evet, Pazartesi saat 14:00 benim için uygun.',
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
    ];
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await api.sendMessage(selectedConversation.id, messageContent);
      
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          conversationId: selectedConversation.id,
          content: messageContent,
        });
      }

      const newMsg: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        senderId: user?.id || '',
        content: messageContent,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (error) {
      toast.error('Mesaj gönderilemedi');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant1.id === user?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  const getParticipantName = (participant: any) => {
    if (participant.studentProfile) {
      return `${participant.studentProfile.firstName} ${participant.studentProfile.lastName}`;
    }
    if (participant.companyProfile) {
      return participant.companyProfile.companyName;
    }
    return participant.email;
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Dün';
    } else {
      return messageDate.toLocaleDateString('tr-TR');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Mesajlar</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Henüz mesajınız yok</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                const isOnline = onlineUsers.includes(otherParticipant.id);
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {getParticipantName(otherParticipant).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 truncate">
                          {getParticipantName(otherParticipant)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.senderId === user?.id && '✓ '}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const otherParticipant = getOtherParticipant(selectedConversation);
                  const isOnline = onlineUsers.includes(otherParticipant.id);
                  
                  return (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {getParticipantName(otherParticipant).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getParticipantName(otherParticipant)}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <span className="text-xs text-gray-500">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm">yazıyor...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sending}
                />
                
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gönder
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mesajlarınız</h3>
              <p className="text-gray-600">Bir konuşma seçin veya yeni bir mesaj başlatın</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
