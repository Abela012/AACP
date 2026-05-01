import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Shield, Settings, ArrowRight } from 'lucide-react';
import SuperAdminLayout from '@/src/shared/components/layouts/SuperAdminLayout';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Admin Management',
      desc: 'Orchestrate governance and access controls.',
      icon: Users,
      path: '/super-admin/admin-management',
      color: 'text-[#14a800]',
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-100 dark:border-green-500/20',
    },
    {
      title: 'Audit Trail',
      desc: 'Review actions, security events, and modifications.',
      icon: ClipboardList,
      path: '/super-admin/audit-trail',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-100 dark:border-blue-500/20',
    },
    {
      title: 'Platform Configuration',
      desc: 'Manage system-level settings and integrations.',
      icon: Settings,
      path: '/super-admin/platform',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20',
    },
    {
      title: 'Security Audit',
      desc: 'Compliance tools and risk monitoring.',
      icon: Shield,
      path: '/super-admin/security',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-100 dark:border-amber-500/20',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Platform Overview</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              System-wide performance and operational health.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all">
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, idx) => (
            <motion.button
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              onClick={() => navigate(c.path)}
              className="text-left bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.color} border ${c.border}`}>
                  <c.icon size={20} />
                </div>
                <div className="text-[#9A9FA5] group-hover:text-[#14a800] transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
              <h3 className="font-black mb-2">{c.title}</h3>
              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">{c.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
}

