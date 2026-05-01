import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Download, Search, Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import SuperAdminLayout from '@/src/shared/components/layouts/SuperAdminLayout';
import { useAuditLogs } from '@/src/hooks/useSuperAdmin';
import { cn } from '@/src/shared/utils/cn';

const actionLabels: Record<string, string> = {
  USER_ROLE_UPDATED: 'User role updated',
  USER_STATUS_UPDATED: 'User status updated',
  WALLET_REQUEST_APPROVED: 'Wallet request approved',
  WALLET_REQUEST_REJECTED: 'Wallet request rejected',
  DISPUTE_ESCALATED: 'Dispute escalated',
  DISPUTE_RESOLVED: 'Dispute resolved',
  SYSTEM_CONFIG_UPDATED: 'System config updated',
};

export default function SuperAdminAuditTrailPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    limit,
    action: action || undefined,
    search: search || undefined,
  });

  const logs = data?.logs ?? [];
  const pages = data?.pages ?? 1;

  const actions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l: any) => l.action && set.add(l.action));
    return Array.from(set);
  }, [logs]);

  return (
    <SuperAdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Audit Trail</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Comprehensive log of administrative actions, system modifications, and security events.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-[#6F767E] hover:bg-gray-50 transition-all flex items-center gap-2">
              <Filter size={14} /> Filter
            </button>
            <button className="px-5 py-3 bg-[#14a800] hover:bg-[#108a00] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-2">
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-6 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by message or target id..."
              className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 border-none"
            />
          </div>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="w-full lg:w-72 bg-[#F4F4F4] dark:bg-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{actionLabels[a] ?? a}</option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="px-5 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-[#6F767E] hover:bg-gray-50 transition-all"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#F4F4F4] dark:border-white/5">
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Timestamp</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Admin</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Action</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Target</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4] dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 text-[#14a800] animate-spin mx-auto mb-4" />
                      <p className="text-sm font-bold text-[#6F767E]">Loading logs...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                      </div>
                      <p className="text-sm font-bold">Failed to load audit logs</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-[#14a800] text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                      >
                        Try Again
                      </button>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="text-[#9A9FA5]" size={32} />
                      </div>
                      <p className="text-sm font-bold">No logs found</p>
                      <p className="text-xs text-[#6F767E] dark:text-gray-400">Try adjusting filters or perform an admin action.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((l: any, idx: number) => {
                    const actorName =
                      l.actor?.firstName || l.actor?.lastName
                        ? `${l.actor?.firstName ?? ''} ${l.actor?.lastName ?? ''}`.trim()
                        : l.actor?.username || l.actor?.email || 'Unknown';
                    const created = new Date(l.createdAt);
                    return (
                      <motion.tr
                        key={l._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-6 px-8">
                          <div className="text-xs font-bold">{created.toLocaleDateString()}</div>
                          <div className="text-[10px] font-medium text-[#9A9FA5]">{created.toLocaleTimeString()}</div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="text-xs font-bold">{actorName}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#14a800]">
                            {l.actorRole}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="text-xs font-black">{actionLabels[l.action] ?? l.action}</div>
                          {!!l.message && (
                            <div className="text-[10px] text-[#6F767E] dark:text-gray-400 font-medium mt-1 max-w-[420px]">
                              {l.message}
                            </div>
                          )}
                        </td>
                        <td className="py-6 px-8">
                          <span className={cn(
                            'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-[#6F767E]',
                          )}>
                            {l.targetType || '—'}
                          </span>
                          <div className="text-[10px] font-mono text-[#9A9FA5] mt-2">
                            {l.targetId || '—'}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="text-[10px] font-mono text-[#6F767E] dark:text-gray-400">
                            {l.ip || '—'}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-[#F4F4F4] dark:border-white/5 flex justify-between items-center">
            <p className="text-xs font-bold text-[#6F767E]">
              Page {page} of {pages} — {data?.total ?? 0} logs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-4 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

