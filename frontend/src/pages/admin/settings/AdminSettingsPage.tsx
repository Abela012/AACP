import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database,
  Globe,
  Lock,
  Mail,
  Server,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFAEnforced, setTwoFAEnforced] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoModeration, setAutoModeration] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  const systemHealth = [
    { label: 'API Server', status: 'Operational', uptime: '99.98%', icon: Server, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
    { label: 'Database', status: 'Operational', uptime: '99.95%', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
    { label: 'CDN / Assets', status: 'Degraded', uptime: '98.2%', icon: Globe, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
    { label: 'Auth Service', status: 'Operational', uptime: '99.99%', icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
  ];

  const resourceUsage = [
    { label: 'CPU Usage', value: 42, max: 100, unit: '%', icon: Cpu },
    { label: 'Memory', value: 6.2, max: 16, unit: 'GB', icon: HardDrive },
    { label: 'Storage', value: 234, max: 500, unit: 'GB', icon: Database },
  ];

  const toggleSettings = [
    { label: 'Maintenance Mode', desc: 'Temporarily disable public access for system updates.', value: maintenanceMode, setter: setMaintenanceMode, danger: true },
    { label: 'Enforce 2FA', desc: 'Require two-factor authentication for all admin accounts.', value: twoFAEnforced, setter: setTwoFAEnforced, danger: false },
    { label: 'Email Notifications', desc: 'Send email alerts for critical system events and user reports.', value: emailNotifications, setter: setEmailNotifications, danger: false },
    { label: 'Auto-Moderation (AI)', desc: 'Enable AI Sentinel-V4 to automatically flag suspicious content.', value: autoModeration, setter: setAutoModeration, danger: false },
    { label: 'Debug Mode', desc: 'Show verbose logging and diagnostic overlays. Not for production.', value: debugMode, setter: setDebugMode, danger: true },
  ];

  const recentEvents = [
    { event: 'System backup completed', time: '2 hours ago', type: 'success' },
    { event: 'CDN cache invalidated (partial)', time: '4 hours ago', type: 'warning' },
    { event: 'Database migration v3.12 applied', time: '1 day ago', type: 'success' },
    { event: 'SSL certificate renewed', time: '3 days ago', type: 'success' },
    { event: 'Rate limiter threshold adjusted', time: '5 days ago', type: 'info' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">System Settings</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">Manage platform configuration, security policies, and infrastructure health.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all flex items-center gap-2">
              <RefreshCw size={14} />
              Refresh Status
            </button>
            <button className="px-5 py-2.5 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] transition-all shadow-lg shadow-green-100 dark:shadow-none">
              Save Changes
            </button>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {systemHealth.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.bg} ${service.color} border ${service.border}`}>
                  <service.icon size={20} />
                </div>
                <div className={`flex items-center gap-1.5`}>
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    service.status === 'Operational' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold mb-1">{service.label}</p>
              <p className="text-xs text-[#9A9FA5] font-medium">Uptime: <span className="font-bold text-[#1A1D1F] dark:text-white">{service.uptime}</span></p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Resource Usage */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Resource Usage</h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-[#14a800]">
                <Cpu size={18} />
              </div>
            </div>
            <div className="space-y-8">
              {resourceUsage.map((resource, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <resource.icon size={16} className="text-[#9A9FA5]" />
                      <span className="text-sm font-bold">{resource.label}</span>
                    </div>
                    <span className="text-sm font-black">
                      {resource.value}{resource.unit} <span className="text-xs text-[#9A9FA5] font-bold">/ {resource.max}{resource.unit}</span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#F4F4F4] dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(resource.value / resource.max) * 100}%` }}
                      transition={{ delay: idx * 0.15, duration: 0.6 }}
                      className={`h-full rounded-full ${
                        (resource.value / resource.max) > 0.8 
                          ? 'bg-gradient-to-r from-red-500 to-red-400' 
                          : (resource.value / resource.max) > 0.6 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : 'bg-gradient-to-r from-[#14a800] to-[#22c55e]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl flex items-center gap-3">
              <Clock size={16} className="text-[#9A9FA5]" />
              <p className="text-[10px] font-bold text-[#6F767E] dark:text-gray-400">
                Last system check: <span className="text-[#1A1D1F] dark:text-white">12 minutes ago</span>
              </p>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Platform Configuration</h3>
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-[#9A9FA5]">
                <Settings size={18} />
              </div>
            </div>
            <div className="space-y-6">
              {toggleSettings.map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold">{setting.label}</h4>
                      {setting.danger && (
                        <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded">Caution</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">{setting.desc}</p>
                  </div>
                  <button 
                    onClick={() => setting.setter(!setting.value)}
                    className={`w-14 h-7 rounded-full relative transition-all duration-200 ${
                      setting.value 
                        ? (setting.danger ? 'bg-red-500' : 'bg-[#14a800]')
                        : 'bg-gray-200 dark:bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                      setting.value ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Events Log */}
        <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Zap className="text-[#14a800]" size={20} />
              <h3 className="font-extrabold text-lg">System Events</h3>
            </div>
            <button className="text-xs font-bold text-[#14a800] hover:underline uppercase tracking-widest">View Full Log</button>
          </div>
          <div className="space-y-4">
            {recentEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  event.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500' :
                  event.type === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-500' :
                  'bg-blue-100 dark:bg-blue-500/20 text-blue-500'
                }`}>
                  {event.type === 'success' ? <CheckCircle2 size={16} /> : 
                   event.type === 'warning' ? <AlertTriangle size={16} /> : 
                   <Bell size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{event.event}</p>
                </div>
                <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
