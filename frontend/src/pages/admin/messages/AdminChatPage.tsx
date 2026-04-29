import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Search,
  Phone,
  Video,
  Smile,
  CheckCheck,
  Users,
  ShieldCheck,
  Megaphone,
  Briefcase,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminUsers } from '@/src/hooks/useAdminUsers';
import { useChat } from '@/src/hooks/useChat';

export default function AdminChatPage() {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  const { data: usersData, isLoading } = useAdminUsers({ limit: 50, search });
  const [activeChat, setActiveChat] = useState<any>(null);

  const roomId = activeChat ? `support_${activeChat._id}` : '';
  const { messages, sendMessage: emitMessage, isLoading: messagesLoading } = useChat(roomId, activeChat?._id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    
    emitMessage(message, activeChat._id);
    setMessage('');
  };

  const chatList = usersData?.users || [];

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-160px)] overflow-hidden flex bg-white dark:bg-[#111111] rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
        {/* Sidebar */}
        <div className="w-80 border-r border-[#EFEFEF] dark:border-white/5 flex flex-col bg-[#F8F8FD] dark:bg-white/[0.02]">
          <div className="p-6">
            <h1 className="text-xl font-black text-[#1A1D1F] dark:text-white mb-6">Collaborations</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {isLoading ? (
              <p className="text-center text-xs text-gray-500 mt-4">Loading users...</p>
            ) : chatList.length === 0 ? (
              <p className="text-center text-xs text-gray-500 mt-4">No users found.</p>
            ) : (
              chatList.map((user: any) => (
                <button
                  key={user._id}
                  onClick={() => setActiveChat(user)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                    activeChat?._id === user._id 
                      ? "bg-white dark:bg-white/5 shadow-md border border-[#EFEFEF] dark:border-white/10" 
                      : "hover:bg-white/50 dark:hover:bg-white/[0.05]"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#14a800] to-green-400 flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold">{user.firstName?.[0] || user.username?.[0] || '?'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={cn("text-xs font-black truncate", activeChat?._id === user._id ? "text-[#14a800]" : "text-[#1A1D1F] dark:text-white")}>
                        {user.firstName} {user.lastName}
                      </h3>
                    </div>
                    <p className="text-[10px] font-bold text-[#9A9FA5] truncate uppercase tracking-widest">{user.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#111111]">
          {activeChat ? (
            <>
              {/* Header */}
              <header className="px-8 h-20 border-b border-[#F4F4F4] dark:border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#14a800]/10 flex items-center justify-center text-[#14a800]">
                    {activeChat.type === 'Group' ? <Users size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#1A1D1F] dark:text-white">{activeChat.firstName} {activeChat.lastName}</h2>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] text-[#9A9FA5] font-bold uppercase tracking-wider">
                        Online
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3 mr-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111111] bg-gray-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="participant" />
                      </div>
                    ))}
                  </div>
                  <button className="p-2.5 text-[#9A9FA5] hover:text-[#1A1D1F] dark:hover:text-white transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">
                    <Phone size={18} />
                  </button>
                  <button className="p-2.5 text-[#9A9FA5] hover:text-[#1A1D1F] dark:hover:text-white transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">
                    <Video size={18} />
                  </button>
                  <button className="p-2.5 text-[#9A9FA5] hover:text-[#1A1D1F] dark:hover:text-white transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 ml-2">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </header>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFD] dark:bg-[#111111]">
                {messagesLoading && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#14a800]/10 border border-[#14a800]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#14a800]">
                      <Loader2 size={12} className="animate-spin" />
                      Loading message history...
                    </div>
                  </div>
                )}
                {messages.length === 0 && !messagesLoading && (
                  <p className="text-center text-[#9A9FA5] text-xs font-bold mt-10">No messages yet. Send a message to start the conversation.</p>
                )}
                {messages.map((msg, idx) => {
                  const isMe = msg.sender?.role?.includes('admin');
                  return (
                    <div key={msg._id || idx} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white overflow-hidden",
                          isMe ? "bg-[#14a800]" : "bg-blue-500"
                        )}>
                          {msg.sender?.profilePicture ? (
                            <img src={msg.sender.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            isMe ? <ShieldCheck size={14} /> : <Briefcase size={14} />
                          )}
                        </div>
                        <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[10px] font-black text-[#1A1D1F] dark:text-white uppercase tracking-wider">
                              {isMe ? 'You' : msg.sender?.firstName || 'User'}
                            </span>
                            <span className="text-[10px] font-bold text-[#9A9FA5]">
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={cn(
                            "p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm",
                            isMe 
                              ? "bg-[#14a800] text-white rounded-tr-none" 
                              : "bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 text-[#1A1D1F] dark:text-white rounded-tl-none"
                          )}>
                            {msg.text}
                          </div>
                          {isMe && <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#14a800] uppercase tracking-widest px-1"><CheckCheck size={12} /> Delivered</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Input */}
              <div className="p-8 border-t border-[#F4F4F4] dark:border-white/5">
                <form onSubmit={handleSendMessage} className="bg-[#F8F8FD] dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 p-2 rounded-3xl flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-[#14a800]/20 transition-all">
                  <button type="button" className="p-3 text-[#9A9FA5] hover:text-[#14a800] transition-colors">
                    <Smile size={20} />
                  </button>
                  <button type="button" className="p-3 text-[#9A9FA5] hover:text-[#14a800] transition-colors pr-4 border-r border-[#EFEFEF] dark:border-white/10">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message to the collaboration group..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-xs font-bold text-[#1A1D1F] dark:text-white px-2"
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim()}
                    className="px-6 h-12 bg-[#14a800] text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-[#108a00] transition-all shadow-lg shadow-green-100 dark:shadow-none disabled:opacity-50 disabled:shadow-none font-black text-[10px] uppercase tracking-widest"
                  >
                    Send Message
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-[#9A9FA5]" />
              </div>
              <h3 className="text-sm font-black text-[#1A1D1F] dark:text-white mb-1">No Chat Selected</h3>
              <p className="text-xs font-medium text-[#6F767E] dark:text-gray-400">Select a collaboration from the sidebar to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
