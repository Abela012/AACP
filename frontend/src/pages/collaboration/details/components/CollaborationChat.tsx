import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export const CollaborationChat: React.FC<any> = ({ messages, currentUser, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm h-[600px] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-transparent">
         <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Direct Messenger</h3>
            <p className="text-[10px] font-bold text-primary-blue uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-primary-blue rounded-full animate-pulse" /> Live Now
            </p>
         </div>
         <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400">
            <MoreVertical size={20} />
         </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
         {messages?.map((msg: Message) => (
           <div key={msg.id} className={cn("flex flex-col", msg.isSelf ? "items-end" : "items-start")}>
              {!msg.isSelf && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{msg.senderName}</p>
              )}
              <div className={cn(
                "max-w-[80%] p-4 rounded-[1.5rem] text-sm font-medium shadow-sm",
                msg.isSelf 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none" 
                  : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-white/5"
              )}>
                 {msg.text}
              </div>
              <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase mt-2 mx-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
           </div>
         ))}
      </div>

      <div className="p-6 bg-gray-50/30 dark:bg-transparent border-t border-gray-100 dark:border-white/5">
         <div className="relative flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-primary-blue transition-colors">
               <Paperclip size={20} />
            </button>
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary-blue pr-12 shadow-inner"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-blue transition-colors">
                 <Smile size={20} />
              </button>
            </div>
            <button 
              onClick={handleSend}
              className="p-4 bg-primary-blue text-white rounded-2xl hover:bg-primary-blue transition-all shadow-lg shadow-primary-blue/20"
            >
               <Send size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};
