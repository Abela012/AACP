import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  ArrowRight,
  Eye,
  Flag,
  Scale,
  Users,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Download,
  CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminDisputes, useResolveDispute, useEscalateDispute } from '@/src/hooks/useAdminDisputes';
import { Loader2 } from 'lucide-react';

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'resolved' | 'escalated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const { data: disputesData, isLoading, refetch } = useAdminDisputes({
    status: activeTab === 'all' ? undefined : activeTab,
    search: searchQuery || undefined
  });

  const resolveMutation = useResolveDispute();
  const escalateMutation = useEscalateDispute();

  const disputes = disputesData || [];

  const handleAction = async (id: string, action: 'view' | 'resolve' | 'escalate') => {
    const dispute = disputes.find((d: any) => d.id === id);
    if (action === 'resolve') {
      const reason = window.prompt('Enter resolution reason:');
      if (reason) {
        try {
          await resolveMutation.mutateAsync({ disputeId: id, reason });
          showToast(`Dispute ${id} has been resolved.`, 'success');
          if (selectedDispute?.id === id) setSelectedDispute(null);
        } catch (err) {
          showToast('Failed to resolve dispute', 'error');
        }
      }
    } else if (action === 'escalate') {
      if (window.confirm('Are you sure you want to escalate this dispute?')) {
        try {
          await escalateMutation.mutateAsync(id);
          showToast(`Dispute ${id} has been escalated.`, 'success');
          if (selectedDispute?.id === id) setSelectedDispute({ ...selectedDispute, status: 'ESCALATED', priority: 'HIGH' });
        } catch (err) {
          showToast('Failed to escalate dispute', 'error');
        }
      }
    } else {
      setSelectedDispute(dispute);
    }
  };

  const stats = [
    { label: 'Open Disputes', value: disputes.filter((d: any) => d.status === 'OPEN').length.toString(), icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-500', border: 'border-amber-100 dark:border-amber-500/20' },
    { label: 'Under Review', value: disputes.filter((d: any) => d.status === 'UNDER REVIEW').length.toString(), icon: Scale, bg: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-500', border: 'border-blue-100 dark:border-blue-500/20' },
    { label: 'Resolved', value: disputes.filter((d: any) => d.status === 'RESOLVED').length.toString(), icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-500/20' },
    { label: 'Escalated', value: disputes.filter((d: any) => d.status === 'ESCALATED').length.toString(), icon: ShieldAlert, bg: 'bg-red-50 dark:bg-red-500/10', iconColor: 'text-red-500', border: 'border-red-100 dark:border-red-500/20' },
  ];

  const handleExport = (format: string) => {
    showToast(`Generating ${format} dispute report...`);
    setShowExportMenu(false);
  };

  const tabs = [
    { key: 'all' as const, label: 'All Disputes', count: disputes.length },
    { key: 'open' as const, label: 'Open', count: disputes.filter(d => d.status === 'OPEN').length },
    { key: 'resolved' as const, label: 'Resolved', count: disputes.filter(d => d.status === 'RESOLVED').length },
    { key: 'escalated' as const, label: 'Escalated', count: disputes.filter(d => d.status === 'ESCALATED').length },
  ];

  const filteredDisputes = disputes.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.reporter.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'open') matchesTab = d.status === 'OPEN' || d.status === 'UNDER REVIEW';
    else if (activeTab === 'resolved') matchesTab = d.status === 'RESOLVED';
    else if (activeTab === 'escalated') matchesTab = d.status === 'ESCALATED';
    
    return matchesSearch && matchesTab;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600';
      case 'UNDER REVIEW': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600';
      case 'RESOLVED': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600';
      case 'ESCALATED': return 'bg-red-100 dark:bg-red-500/20 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-500';
      case 'MEDIUM': return 'text-amber-500';
      case 'LOW': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Dispute Management</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">Review and resolve platform disputes, complaints, and escalations.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search disputes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 w-64 transition-all"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-[#6F767E] hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                <Download size={20} />
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-2xl border border-[#EFEFEF] dark:border-white/10 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {[
                        { label: 'Case Summary (PDF)', format: 'PDF', icon: '📄' },
                        { label: 'Evidence Logs (CSV)', format: 'CSV', icon: '📊' },
                        { label: 'Resolution Data (XLS)', format: 'Excel', icon: '📑' },
                      ].map((item) => (
                        <button
                          key={item.format}
                          onClick={() => handleExport(item.format)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all text-left"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">{item.format}</p>
                            <p className="text-[10px] text-[#6F767E] font-medium leading-none">{item.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`${stat.bg} p-6 rounded-[2rem] border ${stat.border} flex items-center gap-5`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.iconColor}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1">{stat.label}</p>
                <span className="text-2xl font-black text-[#1A1D1F] dark:text-white">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-[#14a800] text-white shadow-lg shadow-green-100 dark:shadow-none'
                  : 'bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 text-[#6F767E] hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                activeTab === tab.key 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-white/10 text-[#9A9FA5]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Disputes List */}
        <div className="bg-white dark:bg-[#111111] rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#F4F4F4] dark:border-white/5">
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Dispute</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Reporter</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Category</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Amount</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Status</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4] dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 size={32} className="text-[#14a800] animate-spin mx-auto mb-4" />
                      <p className="text-sm font-bold text-[#6F767E]">Loading disputes...</p>
                    </td>
                  </tr>
                ) : filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                       <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <AlertCircle size={32} className="text-[#9A9FA5]" />
                       </div>
                       <h3 className="text-sm font-bold text-[#1A1D1F] dark:text-white mb-1">No disputes found</h3>
                       <p className="text-xs text-[#6F767E] dark:text-gray-400">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDisputes.map((dispute, idx) => (
                  <tr key={idx} className="group hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${getPriorityStyle(dispute.priority)}`} style={{ backgroundColor: 'currentColor' }} />
                        <div>
                          <p className="text-xs font-black text-[#1A1D1F] dark:text-white mb-1">{dispute.id}</p>
                          <p className="text-xs font-medium text-[#6F767E] dark:text-gray-400 leading-tight max-w-[200px]">{dispute.title}</p>
                          <p className="text-[10px] font-medium text-[#9A9FA5] mt-1">{dispute.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img src={dispute.reporterAvatar} alt={dispute.reporter} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">{dispute.reporter}</p>
                          <p className="text-[10px] font-bold text-[#9A9FA5] uppercase">{dispute.reporterRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-[#6F767E] dark:text-gray-300">
                        {dispute.category}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <p className="text-sm font-black text-[#1A1D1F] dark:text-white">{dispute.amount}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MessageSquare size={10} className="text-[#9A9FA5]" />
                        <span className="text-[10px] font-bold text-[#9A9FA5]">{dispute.messages} messages</span>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(dispute.status)}`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(dispute.id, 'view')}
                          className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] hover:text-[#14a800]"
                        >
                          <Eye size={18} />
                        </button>
                        {dispute.status !== 'ESCALATED' && dispute.status !== 'RESOLVED' && (
                          <button 
                            onClick={() => handleAction(dispute.id, 'escalate')}
                            className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] hover:text-amber-500"
                          >
                            <Flag size={18} />
                          </button>
                        )}
                        {dispute.status !== 'RESOLVED' && (
                          <button 
                            onClick={() => handleAction(dispute.id, 'resolve')}
                            className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] hover:text-emerald-500"
                          >
                            <CheckSquare size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dispute Detail Sidebar */}
      <AnimatePresence>
        {selectedDispute && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDispute(null)}
              className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-[#1A1D1F] z-[70] shadow-2xl border-l border-[#EFEFEF] dark:border-white/10 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4F4F4] dark:bg-white/5 rounded-xl flex items-center justify-center">
                      <Scale size={20} className="text-[#14a800]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#1A1D1F] dark:text-white leading-none mb-1">Case Detail</h2>
                      <p className="text-xs font-bold text-[#9A9FA5] uppercase tracking-widest">{selectedDispute.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedDispute(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    <XCircle size={24} className="text-[#9A9FA5]" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Status & Priority */}
                  <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-[#EFEFEF] dark:border-white/10">
                      <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Current Status</p>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(selectedDispute.status)}`}>
                        {selectedDispute.status}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-[#EFEFEF] dark:border-white/10">
                      <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Priority Level</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityStyle(selectedDispute.priority)}`} style={{ backgroundColor: 'currentColor' }} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityStyle(selectedDispute.priority)}`}>
                          {selectedDispute.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Content */}
                  <div>
                    <h3 className="text-sm font-black text-[#1A1D1F] dark:text-white mb-3">Dispute Description</h3>
                    <div className="bg-[#F8F8FD] dark:bg-white/5 p-5 rounded-2xl border border-blue-50 dark:border-white/10">
                      <p className="text-sm font-medium text-[#1A1D1F] dark:text-gray-300 leading-relaxed">
                        {selectedDispute.title}. The user reports that the system failed to acknowledge their campaign deliverables despite multiple verification attempts.
                      </p>
                    </div>
                  </div>

                  {/* Parties Involved */}
                  <div>
                    <h3 className="text-sm font-black text-[#1A1D1F] dark:text-white mb-4">Parties Involved</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <img src={selectedDispute.reporterAvatar} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">{selectedDispute.reporter}</p>
                            <p className="text-[10px] font-bold text-[#9A9FA5]">REPORTER ({selectedDispute.reporterRole})</p>
                          </div>
                        </div>
                        <Link to={`/admin/users/${selectedDispute.id}`} className="p-2 text-[#9A9FA5] hover:text-[#14a800]">
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <ShieldAlert size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">{selectedDispute.against}</p>
                            <p className="text-[10px] font-bold text-[#9A9FA5]">AGAINST ({selectedDispute.category})</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evidence & Timeline */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-[#1A1D1F] dark:text-white">Case Timeline</h3>
                      <button className="text-[10px] font-black text-[#14a800] uppercase tracking-widest">Full Log</button>
                    </div>
                    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFEFEF] dark:before:bg-white/10">
                      {[
                        { time: '10:45 AM', event: 'Dispute opened by reporter', icon: AlertCircle, color: 'text-amber-500' },
                        { time: '11:20 AM', event: 'Evidence documentation uploaded', icon: FileText, color: 'text-blue-500' },
                        { time: '02:15 PM', event: 'System verification triggered', icon: Clock, color: 'text-emerald-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6 relative">
                          <div className={`w-10 h-10 rounded-xl bg-white dark:bg-[#1A1D1F] border border-[#EFEFEF] dark:border-white/10 flex items-center justify-center z-10 ${item.color}`}>
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">{item.event}</p>
                            <p className="text-[10px] text-[#9A9FA5] font-medium">{item.time} • {selectedDispute.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="pt-6 border-t border-[#EFEFEF] dark:border-white/10 flex gap-3">
                    {selectedDispute.status !== 'RESOLVED' && (
                      <button 
                        onClick={() => handleAction(selectedDispute.id, 'resolve')}
                        className="flex-1 py-4 bg-[#14a800] hover:bg-[#14a800]/90 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-100 dark:shadow-none"
                      >
                        Resolve Case
                      </button>
                    )}
                    {selectedDispute.status !== 'ESCALATED' && selectedDispute.status !== 'RESOLVED' && (
                      <button 
                        onClick={() => handleAction(selectedDispute.id, 'escalate')}
                        className="flex-1 py-4 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 text-[#1A1D1F] dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-[#14a800] text-white border-green-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
