import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function PendingApprovalPage() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F8FD] dark:bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#111] rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-500/10 border border-gray-100 dark:border-white/5 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
          <Clock className="w-10 h-10 text-emerald-500 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-[#111] rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-white/5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          Approval Pending
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
          Thank you for completing your profile! Our team is currently reviewing your information to ensure a high-quality community. 
          <br /><br />
          This typically takes <span className="text-emerald-500 font-bold">24-48 hours</span>. We'll notify you via email once you're approved.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-4 text-left border border-gray-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-black flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Questions?</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">support@aacp.com</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          AACP Community Guidelines Apply
        </p>
      </motion.div>
    </div>
  );
}
