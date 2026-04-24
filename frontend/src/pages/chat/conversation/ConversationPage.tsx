import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Send, Paperclip, MoreVertical, Search, Phone, Video,
  Smile, CheckCheck, Wifi, WifiOff, Loader2, MessageSquare
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useChat, useConversations } from '@/src/hooks/useChat';
import { startTyping, stopTyping } from '@/src/api/socketService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  userId: string;
  conversationId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: number;
}

// ─── Room ID helper — deterministic pairing key ───────────────────────────────
// Keep for backward compatibility or one-to-one mapping if needed
const makeRoomId = (a: string, b: string) =>
  [a, b].sort().join('_');

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConversationPage() {
  const { userRole } = useUser();
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';

  // Layout selection
  let Layout: React.ComponentType<{ children: React.ReactNode }> = AdvertiserLayout;
  if (userRole === 'business') Layout = BusinessLayout;
  if (userRole === 'admin') Layout = AdminLayout;

  const { data: conversations, isLoading: collabsLoading } = useConversations();

  const contacts: Contact[] = useMemo(() => {
    if (!conversations) return [];
    return conversations.map((conv: any) => {
      // Determine the "other" user
      const partner = conv.participants?.find((p: any) => p.clerkId !== myId && p._id !== myId);
      
      // Fallback if partner is somehow undefined
      if (!partner) return null;

      return {
        userId: partner.clerkId || partner._id,
        conversationId: conv._id,
        name: `${partner.firstName} ${partner.lastName}`,
        avatar: partner.profilePicture || `https://ui-avatars.com/api/?name=${partner.firstName}+${partner.lastName}&background=10b981&color=fff`,
        lastMessage: conv.lastMessage?.text || 'New conversation', 
        time: new Date(conv.updatedAt || new Date()).toLocaleDateString(),
        online: false, 
        unread: 0,
      };
    }).filter(Boolean) as Contact[];
  }, [conversations, myId]);

  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (contacts.length > 0 && !activeContact) {
      setActiveContact(contacts[0]);
    }
  }, [contacts, activeContact]);

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use the MongoDB Conversation ID as the roomId for absolute consistency
  const roomId = activeContact?.conversationId || '';

  // ── Real-time chat hook ──
  const { messages, sendMessage, isConnected, typingUsers, isLoading: messagesLoading } = useChat(roomId, activeContact?.userId);

  const [lastDeliveredId, setLastDeliveredId] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages and trigger delivery notification for own messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // Check if the latest message is from me, to show a "Delivered" notification
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const isMine = lastMsg.sender._id === myId || lastMsg.sender._id.startsWith(myId.slice(0, 8));
      
      // If it's a new message and it's mine, show delivered status
      if (isMine) {
        setLastDeliveredId(lastMsg._id);
        const timer = setTimeout(() => setLastDeliveredId(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, myId]);

  // ── Send handler ──
  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;
    sendMessage(inputText, activeContact.userId);
    setInputText('');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, [inputText, sendMessage, activeContact?.userId]);

  // ── Typing indicator ──
  const handleInputChange = (value: string) => {
    setInputText(value);
    if (!roomId) return;
    startTyping(roomId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => stopTyping(roomId), 2000);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <main className="h-[calc(100vh-80px)] overflow-hidden flex bg-gray-50 dark:bg-[#0a0a0a]">
        {/* ── Sidebar ── */}
        <div className="w-80 border-r border-gray-100 dark:border-white/5 flex flex-col bg-white dark:bg-[#0a0a0a]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
              {/* Connection badge */}
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                isConnected ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-gray-100 dark:bg-white/5 text-gray-400"
              )}>
                {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {filteredContacts.map((contact) => (
              <button
                key={contact.userId}
                onClick={() => setActiveContact(contact)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-2xl transition-all",
                  activeContact?.userId === contact.userId
                    ? "bg-emerald-500/10 dark:bg-emerald-500/5 shadow-sm"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <div className="relative shrink-0">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-black">
                      {contact.name[0]}
                    </div>
                  )}
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn("text-sm font-bold truncate", activeContact?.userId === contact.userId ? "text-emerald-500" : "text-gray-900 dark:text-white")}>
                      {contact.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 ml-2">{contact.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-4">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                    {contact.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        {activeContact ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <header className="px-8 h-20 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {activeContact.avatar ? (
                    <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                      {activeContact.name[0]}
                    </div>
                  )}
                  {activeContact.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">{activeContact.name}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                    {activeContact.online ? 'Online' : 'Away'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">
                  <Phone size={18} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">
                  <Video size={18} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 border-l border-gray-100 dark:border-white/5 ml-2 pl-4">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4">
              {/* Connection or Loading notice */}
              {(!isConnected || messagesLoading) && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-600">
                    <Loader2 size={14} className="animate-spin" />
                    {messagesLoading ? 'Loading message history...' : 'Connecting to real-time chat...'}
                  </div>
                </div>
              )}

              {messages.length === 0 && isConnected && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Send size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No messages yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Say hello to {activeContact.name}!</p>
                </div>
              )}

              {messages.map((msg) => {
                const isMine = msg.sender._id === myId || msg.sender._id.startsWith(myId.slice(0, 8));
                return (
                  <div key={msg._id} className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
                    {!isMine && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3 shrink-0 self-end">
                        {activeContact.avatar ? (
                          <img src={activeContact.avatar} alt={msg.sender.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">
                            {msg.sender.firstName[0]}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={cn("max-w-[70%] group", isMine ? "items-end text-right" : "items-start")}>
                      <div className={cn(
                        "p-4 rounded-3xl text-sm leading-relaxed",
                        isMine
                          ? "bg-emerald-500 text-black font-medium rounded-tr-none shadow-lg shadow-emerald-500/10"
                          : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                      <div className={cn("flex items-center gap-2 mt-1.5 px-1", isMine ? "justify-end" : "justify-start")}>
                        {lastDeliveredId === msg._id && (
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider animate-pulse">
                            Delivered
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <CheckCheck size={14} className="text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-white/5 px-5 py-3 rounded-3xl rounded-tl-none flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{typingUsers.join(', ')} typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 border-t border-gray-100 dark:border-white/5">
              <form onSubmit={handleSend} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-[2rem] flex items-center gap-2 shadow-sm">
                <button type="button" className="p-3 text-gray-400 hover:text-emerald-500 transition-colors">
                  <Smile size={20} />
                </button>
                <button type="button" className="p-3 text-gray-400 hover:text-emerald-500 transition-colors border-r border-gray-100 dark:border-white/5 pr-4">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={isConnected ? "Type your message here..." : "Connecting..."}
                  disabled={!isConnected}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white px-2 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || !isConnected}
                  className="w-12 h-12 bg-emerald-500 text-black rounded-full flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] text-center">
            {collabsLoading ? (
               <Loader2 size={32} className="animate-spin text-emerald-500 mb-4" />
            ) : (
               <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                  <MessageSquare size={24} />
               </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {collabsLoading ? 'Loading conversations...' : 'No conversations yet'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {collabsLoading 
                ? 'Please wait while we fetch your connections.' 
                : 'Start a collaboration to connect with creators and businesses.'}
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
}
