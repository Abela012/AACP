import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageSquare, 
  FileText, 
  Shield, 
  ExternalLink,
  ChevronRight,
  Zap,
  LifeBuoy
} from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function AdminHelpPage() {
  const categories = [
    { title: 'User Management', desc: 'Approvals, suspensions, and role management.', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { title: 'Financial Controls', icon: Zap, desc: 'Managing coin requests and platform fees.', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { title: 'Dispute Resolution', icon: MessageSquare, desc: 'Handling complaints and three-way chats.', color: 'text-[#14a800]', bg: 'bg-green-50 dark:bg-green-500/10' },
    { title: 'Platform Policy', icon: FileText, desc: 'Community guidelines and legal docs.', color: 'text-[#14a800]', bg: 'bg-green-50 dark:bg-green-500/10' },
  ];

  const faqs = [
    'How do I verify a new business owner?',
    'What happens when I suspend an account?',
    'How to moderate a collaboration chat?',
    'How do coin requests work for creators?',
  ];

  return (
    <AdminLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-tr from-[#14a800] to-green-400 rounded-[3rem] p-12 text-white mb-12 shadow-xl shadow-green-100 dark:shadow-none relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4">Admin Help Center</h1>
            <p className="text-white/80 font-bold max-w-lg mb-8 leading-relaxed">
              Find guides, documentation, and support resources to help you manage the AACP platform efficiently.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for help articles..." 
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-white"
              />
            </div>
          </div>
          <LifeBuoy className="absolute -right-20 -bottom-20 w-80 h-80 text-white/10 rotate-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6`}>
                <cat.icon size={24} />
              </div>
              <h3 className="text-lg font-black mb-2 group-hover:text-[#14a800] transition-colors">{cat.title}</h3>
              <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400 mb-6 leading-relaxed">{cat.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-[#14a800] uppercase tracking-widest">
                Read Guide <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-[#F4F4F4] dark:border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-black">Frequently Asked Questions</h2>
            <button className="text-[10px] font-black text-[#14a800] uppercase tracking-widest hover:underline">View all FAQ</button>
          </div>
          <div className="divide-y divide-[#F4F4F4] dark:divide-white/5">
            {faqs.map((faq, i) => (
              <button key={i} className="w-full p-6 text-left hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-all flex items-center justify-between group">
                <span className="text-sm font-bold text-[#1A1D1F] dark:text-white group-hover:text-[#14a800] transition-colors">{faq}</span>
                <ExternalLink size={14} className="text-[#9A9FA5] group-hover:text-[#14a800] transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center p-8 bg-[#F1FFF0] dark:bg-green-500/5 rounded-[2.5rem] border border-green-100 dark:border-green-500/10">
          <p className="text-sm font-bold text-[#14a800] mb-4">Still need help?</p>
          <h3 className="text-xl font-black mb-6">Contact System Support</h3>
          <button className="px-8 py-4 bg-[#14a800] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none hover:bg-[#108a00] transition-all">
            Open Support Ticket
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
