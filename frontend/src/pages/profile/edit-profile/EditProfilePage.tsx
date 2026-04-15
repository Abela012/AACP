import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Building2, 
  Globe, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard,
  Save,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { cn } from '@/src/shared/utils/cn';

export default function EditProfilePage() {
  const { userRole } = useUser();
  const location = useLocation();
  
  // Determine layout based on path or role
  const isBusiness = location.pathname.includes('/business') || userRole === 'business';
  const Layout = isBusiness ? BusinessLayout : AdvertiserLayout;

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tabs = [
    { id: 'general', label: 'General Info', icon: User },
    { id: 'company', label: isBusiness ? 'Company Details' : 'Professional Details', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Layout>
      <main className="p-4 sm:p-8 max-w-[1000px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your profile information and preferences.</p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              showSuccess 
                ? "bg-cyan-500 text-white shadow-cyan-500/20" 
                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20",
              isSaving && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : showSuccess ? (
              <><CheckCircle2 size={18} /> Saved!</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                  activeTab === tab.id
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="md:col-span-9">
            <motion.div 
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none min-h-[500px]"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Information</h2>
                  
                  {/* Avatar Upload dummy */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                      <img src="https://i.pravatar.cc/150?u=techvision" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2 mb-2 border border-gray-200 dark:border-white/10">
                        <ImageIcon size={16} />
                        Upload New Photo
                      </button>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" defaultValue="Sarah" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" defaultValue="Reynolds" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="email" defaultValue="collab@sarahreynolds.co" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Public Bio</label>
                      <textarea rows={4} defaultValue="Award-winning digital marketer bridging the gap between innovative SaaS platforms and their dream audiences." className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white resize-none" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {isBusiness ? 'Company Details' : 'Professional Details'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" defaultValue="TechVision Solutions" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="url" defaultValue="https://techvision.dev" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</label>
                      <select className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white appearance-none">
                        <option>B2B Software</option>
                        <option>SaaS</option>
                        <option>E-commerce</option>
                        <option>Fintech</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                  <div className="p-6 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                        <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                      </div>
                      <button className="px-4 py-2 bg-emerald-500 text-black text-sm font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-sm">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Change Password</h4>
                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" placeholder="Current Password" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" placeholder="New Password" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'New Opportunities', desc: 'Get notified when an AI match is found.', default: true },
                      { title: 'Campaign Updates', desc: 'Status changes and workflow alerts.', default: true },
                      { title: 'Marketing Invites', desc: 'News, events, and feature updates.', default: false }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/50 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.default} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
