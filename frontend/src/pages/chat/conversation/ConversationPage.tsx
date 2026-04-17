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
  Circle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useUser } from '@/src/shared/context/UserContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function ConversationPage() {
  const { userRole } = useUser();
  
  let Layout = AdvertiserLayout;
  if (userRole === 'business') Layout = BusinessLayout;
  if (userRole === 'admin') Layout = AdminLayout;
  
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [chats] = useState([
    { id: 1, name: 'Alex Rivers', lastMessage: 'The draft looks great! Let\'s proceed.', time: '2m ago', online: true, unread: 0, avatar: 'https://i.pravatar.cc/150?u=alex' },
    { id: 2, name: 'Sarah Chen', lastMessage: 'Can we adjust the color palette?', time: '1h ago', online: true, unread: 2, avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Sent the contract for your review.', time: '3h ago', online: false, unread: 0, avatar: 'https://i.pravatar.cc/150?u=mike' },
    { id: 4, name: 'Tech Visionary', lastMessage: 'When is the deadline?', time: '1d ago', online: false, unread: 0, avatar: 'https://i.pravatar.cc/150?u=tech' },
  ]);

  const [activeChat, setActiveChat] = useState(chats[0]);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi Alex! I just finished the initial draft for the Summer Tech Reel.', sender: 'me', time: '10:00 AM' },
    { id: 2, text: 'Awesome! Did you include the specific RGB lighting transition we discussed?', sender: 'them', time: '10:05 AM' },
    { id: 3, text: 'Yes, it\'s at the 0:15 mark. I also added some subtle speed ramps.', sender: 'me', time: '10:07 AM' },
    { id: 4, text: 'The draft looks great! Let\'s proceed with the final render.', sender: 'them', time: '10:10 AM' },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
  };

  return (
    <Layout>
      <main className="h-[calc(100vh-80px)] overflow-hidden flex bg-gray-50 dark:bg-[#0a0a0a]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-100 dark:border-white/5 flex flex-col bg-white dark:bg-[#0a0a0a]">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-2xl transition-all",
                  activeChat.id === chat.id 
                    ? "bg-emerald-500/10 dark:bg-emerald-500/5 shadow-sm" 
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn("text-sm font-bold truncate", activeChat.id === chat.id ? "text-emerald-500" : "text-gray-900 dark:text-white")}>
                      {chat.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-4">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a]">
          {/* Header */}
          <header className="px-8 h-20 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                {activeChat.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{activeChat.name}</h2>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  {activeChat.online ? 'Online' : 'Away'}
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

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="flex justify-center mb-8">
              <span className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest rounded-full">
                Today, Oct 24
              </span>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex w-full mb-4", msg.sender === 'me' ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] group", msg.sender === 'me' ? "items-end text-right" : "items-start")}>
                  <div className={cn(
                    "p-4 rounded-3xl text-sm leading-relaxed",
                    msg.sender === 'me' 
                      ? "bg-emerald-500 text-black font-medium rounded-tr-none shadow-lg shadow-emerald-500/10" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <div className={cn("flex items-center gap-2 mt-2 px-1", msg.sender === 'me' ? "justify-end" : "justify-start")}>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck size={14} className="text-emerald-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-8 border-t border-gray-100 dark:border-white/5">
            <form onSubmit={handleSendMessage} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-[2rem] flex items-center gap-2 shadow-sm">
              <button type="button" className="p-3 text-gray-400 hover:text-emerald-500 transition-colors">
                <Smile size={20} />
              </button>
              <button type="button" className="p-3 text-gray-400 hover:text-emerald-500 transition-colors border-r border-gray-100 dark:border-white/5 pr-4">
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white px-2"
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                className="w-12 h-12 bg-emerald-500 text-black rounded-full flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </Layout>
  );
}
