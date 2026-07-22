/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, X, ChevronDown, ChevronUp, User, Search, CheckCheck, Sparkles, Building, Compass, Shield } from 'lucide-react';
import { User as UserType, Message } from '../types';

interface MessagingWidgetProps {
  currentUser: UserType | null;
}

export default function MessagingWidget({ currentUser }: MessagingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<UserType | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users for starting new conversations
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  // Fetch messages for current user
  const fetchMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedRecipient]);

  if (!currentUser) return null;

  // Group messages by contact
  const conversationContactsMap = new Map<string, { user: UserType | { id: string; name: string; email: string; role: string }; lastMsg: Message }>();
  
  messages.forEach((msg) => {
    const partnerId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
    const partnerName = msg.senderId === currentUser.id ? msg.recipientName : msg.senderName;
    const partnerEmail = msg.senderId === currentUser.id ? msg.recipientEmail : msg.senderEmail;
    const partnerRole = msg.senderId === currentUser.id ? 'destinataire' : msg.senderRole;

    const existingUser = allUsers.find(u => u.id === partnerId);
    const partnerObj = existingUser || { id: partnerId, name: partnerName, email: partnerEmail, role: partnerRole as any };

    const currentLast = conversationContactsMap.get(partnerId);
    if (!currentLast || new Date(msg.createdAt) > new Date(currentLast.lastMsg.createdAt)) {
      conversationContactsMap.set(partnerId, { user: partnerObj, lastMsg: msg });
    }
  });

  const conversationContacts = Array.from(conversationContactsMap.values()).sort(
    (a, b) => new Date(b.lastMsg.createdAt).getTime() - new Date(a.lastMsg.createdAt).getTime()
  );

  const unreadCount = messages.filter(m => m.recipientId === currentUser.id && !m.read).length;

  const currentThread = selectedRecipient
    ? messages.filter(
        m =>
          (m.senderId === currentUser.id && m.recipientId === selectedRecipient.id) ||
          (m.senderId === selectedRecipient.id && m.recipientId === currentUser.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRecipient) return;

    const content = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          recipientId: selectedRecipient.id,
          content,
        }),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsersToChat = allUsers.filter(u => {
    if (u.id === currentUser.id) return false;
    const q = searchUserQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'professional':
        return <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><Building size={10} /> Pro / Hôte</span>;
      case 'admin':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><Shield size={10} /> Admin Teranga</span>;
      default:
        return <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><Compass size={10} /> Touriste</span>;
    }
  };

  return (
    <div id="teranga-messaging-root" className="fixed bottom-3 right-4 z-50 font-sans">
      {/* Collapsed Bar / LinkedIn Style Header */}
      {!isOpen && (
        <button
          id="messaging-toggle-btn"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl hover:bg-emerald-900 transition-all transform hover:-translate-y-0.5 border border-emerald-700/50 cursor-pointer"
        >
          <div className="relative">
            <MessageSquare size={20} className="text-amber-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="font-semibold text-sm">Messagerie Teranga</span>
          
          <div 
            id="messaging-new-chat-icon-btn"
            title="Nouvelle discussion"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
              setShowNewChatModal(true);
            }}
            className="p-1 hover:bg-emerald-700/60 rounded-full transition-colors ml-1"
          >
            <Plus size={16} className="text-amber-200" />
          </div>
          <ChevronUp size={16} className="text-emerald-300" />
        </button>
      )}

      {/* Expanded Messaging Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[480px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-emerald-900 text-white p-3.5 px-4 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-800/80 rounded-lg text-amber-300">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                  Messagerie Teranga
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-emerald-200">Connecté en tant que {currentUser.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-new-discussion-header"
                title="Démarrer une nouvelle discussion"
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 hover:bg-emerald-800 text-amber-200 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nouveau</span>
              </button>
              <button
                id="btn-close-messaging"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-emerald-800 text-emerald-200 hover:text-white rounded-lg transition-colors"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Conversations List (Left Pane / Full view if no selected recipient) */}
            <div className={`${selectedRecipient ? 'hidden sm:block sm:w-2/5 border-r border-gray-100' : 'w-full'} bg-slate-50 flex flex-col h-full`}>
              <div className="p-2.5 border-b border-gray-200 bg-white">
                <button
                  id="btn-new-chat-trigger"
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl p-2 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus size={14} className="text-emerald-700" />
                  Nouvelle discussion
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {conversationContacts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    <MessageSquare size={32} className="mx-auto mb-2 text-gray-300 opacity-60" />
                    Aucune discussion en cours. Cliquez sur "Nouvelle discussion" pour commencer !
                  </div>
                ) : (
                  conversationContacts.map(({ user: partner, lastMsg }) => {
                    const isSelected = selectedRecipient?.id === partner.id;
                    return (
                      <div
                        key={partner.id}
                        onClick={() => setSelectedRecipient(partner as UserType)}
                        className={`p-3 cursor-pointer transition-colors flex items-start gap-2.5 ${
                          isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-gray-100/70'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-xs text-gray-900 truncate">{partner.name}</h4>
                            <span className="text-[10px] text-gray-400">
                              {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{lastMsg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Conversation Thread (Right Pane) */}
            {selectedRecipient ? (
              <div className="flex-1 flex flex-col h-full bg-white">
                {/* Chat Partner Header */}
                <div className="p-2.5 px-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => setSelectedRecipient(null)}
                      className="sm:hidden p-1 text-gray-500 hover:text-gray-800"
                    >
                      ←
                    </button>
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                      {selectedRecipient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">{selectedRecipient.name}</h4>
                      {getRoleBadge(selectedRecipient.role)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecipient(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 text-xs"
                  >
                    Fermer
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/50">
                  {currentThread.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      Envoyez un premier message à <span className="font-semibold text-gray-600">{selectedRecipient.name}</span>
                    </div>
                  ) : (
                    currentThread.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-2.5 px-3 rounded-2xl text-xs shadow-sm ${
                              isMe
                                ? 'bg-emerald-800 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-2.5 border-t border-gray-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Écrivez un message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-gray-100 text-xs text-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    className="p-2 bg-emerald-800 text-amber-300 rounded-xl hover:bg-emerald-900 disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400 bg-slate-50/40">
                <Sparkles size={36} className="text-emerald-300 mb-2" />
                <p className="text-xs font-medium text-gray-600">Sélectionnez une discussion ou commencez-en une nouvelle</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                  Échangez directement avec les touristes, les hébergeurs, les agences de voyages et les guides du Sénégal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Discussion Dialog Modal (LinkedIn Style) */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-amber-300" />
                <h3 className="font-bold text-sm">Nouvelle discussion</h3>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, e-mail ou rôle..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {filteredUsersToChat.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    Aucun utilisateur trouvé.
                  </div>
                ) : (
                  filteredUsersToChat.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setSelectedRecipient(u);
                        setShowNewChatModal(false);
                      }}
                      className="p-2.5 hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs shadow-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-gray-900">{u.name}</h4>
                          <p className="text-[10px] text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      {getRoleBadge(u.role)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
