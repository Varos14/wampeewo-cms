import { useState, useEffect, useRef } from 'react';

import { messageService, Conversation, Message } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';

export default function Messages() {
  const { user } = useAuthStore();
  const { teachers, fetchData } = useAppDataStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    fetchData(); // load teachers for new chat
  }, [fetchData]);

  const selectConversation = async (conv: Conversation) => {
    setActiveChat(conv);
    try {
      const msgs = await messageService.getMessages(conv.otherUserId);
      setMessages(msgs);
      // Optional: Refresh conversations to update isRead status
      loadConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      const msg = await messageService.sendMessage(activeChat.otherUserId, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      loadConversations(); // Update left sidebar
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // For "New Chat", we can chat with any teacher, or the admin
  // Since we don't fetch admins in the store yet, we'll hardcode the known admin ID for simplicity,
  // or just let teachers talk to teachers. We'll add a mock "Admin" if we're a teacher.
  const possibleRecipients = [
    ...(user?.role !== 'admin' ? [{ id: 'u1', name: 'System Admin', role: 'admin' }] : []),
    ...teachers.filter(t => t.id !== user?.id).map(t => ({ id: t.id, name: t.name, role: 'teacher' }))
  ];

  const startNewChat = async (recipientId: string, recipientName: string) => {
    setShowNewChat(false);
    // Check if we already have a conversation
    const existing = conversations.find(c => c.otherUserId === recipientId);
    if (existing) {
      selectConversation(existing);
    } else {
      // Create a temporary conversation object
      const tempConv: Conversation = {
        otherUserId: recipientId,
        otherUserName: recipientName,
        otherUserAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(recipientName)}`,
        lastMessage: null as any
      };
      setActiveChat(tempConv);
      setMessages([]);
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white/50 border border-black/10 rounded-2xl overflow-hidden animate-fade-in shadow-xl">
      {/* Conversations List (Sidebar) */}
      <div className="w-1/3 bg-slate-50/50 border-r border-black/10 flex flex-col">
        <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10">
          <h2 className="text-lg font-bold text-slate-800">Messages</h2>
          <button 
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500 text-sm animate-pulse">Loading conversations...</div>
          ) : showNewChat ? (
            <div className="p-2 animate-fade-in">
              <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Start New Chat</p>
              {possibleRecipients.map(r => (
                <button
                  key={r.id}
                  onClick={() => startNewChat(r.id, r.name)}
                  className="w-full text-left p-3 hover:bg-white rounded-xl transition-colors flex items-center gap-3"
                >
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name)}`} alt="" className="w-10 h-10 rounded-full bg-slate-200" />
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{r.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{r.role}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No conversations yet.<br/>Click the + button to start one.</div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map(conv => (
                <button
                  key={conv.otherUserId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                    activeChat?.otherUserId === conv.otherUserId ? 'bg-blue-50 border border-blue-100' : 'hover:bg-white border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img src={conv.otherUserAvatar} alt="" className="w-12 h-12 rounded-full object-cover bg-slate-200" />
                    {conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.receiverId === user.id && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{conv.otherUserName}</h4>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-500 font-medium shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-xs truncate ${!conv.lastMessage.isRead && conv.lastMessage.receiverId === user.id ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                        {conv.lastMessage.senderId === user.id ? 'You: ' : ''}{conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window (Main Content) */}
      <div className="w-2/3 flex flex-col bg-white/40">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-black/5 flex items-center gap-4 bg-white/80 backdrop-blur-sm z-10">
              <img src={activeChat.otherUserAvatar} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
              <div>
                <h3 className="font-bold text-slate-800">{activeChat.otherUserName}</h3>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Say hi to {activeChat.otherUserName}!
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-white border border-black/10 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <span className="ml-1.5">{msg.isRead ? '✓✓' : '✓'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-black/5 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 transition-all"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-500/20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium text-slate-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
