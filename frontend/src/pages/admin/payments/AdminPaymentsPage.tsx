import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  History,
  MoreHorizontal,
  User,
  ShieldCheck,
  Eye,
  X,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminWalletRequests, useApproveWalletRequest, useRejectWalletRequest } from '@/src/hooks/useAdminWallet';
import { cn } from '@/src/shared/utils/cn';

type Channel = 'manual' | 'chapa';

export default function AdminPaymentsPage() {
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel>('manual');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [proofPreview, setProofPreview] = useState<{ url: string; user: string } | null>(null);

  const { data, isLoading, refetch } = useAdminWalletRequests({
    channel,
    status: statusFilter === 'All' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const approve = useApproveWalletRequest();
  const reject = useRejectWalletRequest();

  const handleApprove = async (id: string, hasProof: boolean) => {
    if (!hasProof) {
      alert('This request has no payment proof attached.');
      return;
    }
    if (
      window.confirm(
        'Approve this manual payment? Review the proof first — coins will be credited immediately.'
      )
    ) {
      try {
        await approve.mutateAsync(id);
      } catch (err) {
        console.error('Failed to approve:', err);
      }
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason !== null) {
      try {
        await reject.mutateAsync({ requestId: id, reason });
      } catch (err) {
        console.error('Failed to reject:', err);
      }
    }
  };

  const requests = data?.requests || [];
  const isManual = channel === 'manual';
  const pendingCount = requests.filter((r: { status: string }) => r.status === 'PENDING').length;

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard/admin')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Coin Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {isManual
                ? 'Review manual bank/Telebirr transfers and approve after verifying proof.'
                : 'Automated Chapa payments — read-only audit log (no approval needed).'}
            </p>
          </div>

          {isManual && (
            <div className="bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-center gap-2">
              <Clock className="text-blue-600 w-4 h-4" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {pendingCount} Pending
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => {
              setChannel('manual');
              setStatusFilter('All');
            }}
            className={cn(
              'px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all',
              channel === 'manual'
                ? 'bg-white dark:bg-white/10 text-aacp-olive shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Landmark size={16} /> Manual requests
          </button>
          <button
            onClick={() => {
              setChannel('chapa');
              setStatusFilter('All');
            }}
            className={cn(
              'px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all',
              channel === 'chapa'
                ? 'bg-white dark:bg-white/10 text-aacp-olive shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <CreditCard size={16} /> Chapa payments
          </button>
        </div>

        <div className="bg-white dark:bg-[#111111] p-4 rounded-3xl border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by username, email, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-aacp-olive transition-all outline-none text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl">
            {['All', 'Pending', 'Completed', 'Failed'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                  statusFilter === f
                    ? 'bg-white dark:bg-white/10 text-aacp-olive shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-[#EFEFEF] dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    User / Account
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Transaction Details
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                    Amount
                  </th>
                  {isManual && (
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                      Proof
                    </th>
                  )}
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                    Date
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                    Status
                  </th>
                  {isManual && (
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF] dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={isManual ? 7 : 5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-aacp-olive animate-spin" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                          Fetching Request Data...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={isManual ? 7 : 5} className="px-8 py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                          <History size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No records found</h3>
                        <p className="text-sm text-gray-500">
                          {isManual
                            ? 'No manual coin requests match your filters.'
                            : 'No Chapa payment records match your filters.'}
                        </p>
                        <button
                          onClick={() => refetch()}
                          className="mt-4 px-6 py-2 bg-aacp-olive text-white rounded-xl text-xs font-bold"
                        >
                          Refresh
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request: any) => (
                    <tr
                      key={request._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                            {request.avatar ? (
                              <img src={request.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="text-gray-400" size={24} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{request.user}</p>
                            <p className="text-[10px] font-bold text-aacp-olive uppercase tracking-widest mt-0.5">
                              {request.role?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{request.type}</p>
                          <p className="text-[10px] font-mono text-gray-400 font-medium">
                            #{request._id.toString().slice(-8).toUpperCase()}
                          </p>
                          {request.txRef && (
                            <p className="text-[10px] font-mono text-gray-400">Ref: {request.txRef}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{request.value}</span>
                      </td>
                      {isManual && (
                        <td className="px-8 py-6 text-center">
                          {request.proofUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setProofPreview({ url: request.proofUrl, user: request.user })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aacp-gold/15 dark:bg-aacp-olive/10 text-aacp-olive text-[10px] font-black uppercase tracking-widest hover:bg-aacp-olive hover:text-white transition-all"
                            >
                              <Eye size={14} /> View proof
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-red-500 uppercase">Missing</span>
                          )}
                        </td>
                      )}
                      <td className="px-8 py-6 text-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(request.date).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                          {new Date(request.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span
                          className={cn(
                            'px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase inline-block border',
                            request.status === 'PENDING'
                              ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                              : request.status === 'COMPLETED'
                                ? 'bg-aacp-gold/15 text-green-600 border-aacp-gold/25 dark:bg-aacp-olive/10 dark:text-aacp-gold dark:border-aacp-olive/20'
                                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                          )}
                        >
                          {request.status}
                        </span>
                      </td>
                      {isManual && (
                        <td className="px-8 py-6 text-right">
                          {request.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(request._id, !!request.proofUrl)}
                                disabled={approve.isPending || !request.proofUrl}
                                className="p-2.5 bg-aacp-gold/15 dark:bg-aacp-olive/10 text-green-600 hover:bg-aacp-olive hover:text-white rounded-xl transition-all disabled:opacity-50"
                                title="Approve Request"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(request._id)}
                                disabled={reject.isPending}
                                className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-50"
                                title="Reject Request"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          ) : (
                            <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                              <MoreHorizontal size={20} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold">Security & Compliance</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {isManual
                ? 'Always open and verify the uploaded receipt before approving. Manual approvals are logged and cannot be reversed.'
                : 'Chapa payments are credited automatically when Chapa confirms success. This tab is for support and auditing only.'}
            </p>
          </div>

          <div className="bg-aacp-olive p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between h-full">
              <div>
                <h3 className="font-bold mb-2">Need Help?</h3>
                <p className="text-xs font-medium opacity-80 max-w-[200px]">
                  Check the admin handbook for payment verification guidelines.
                </p>
              </div>
              <button className="bg-white text-aacp-olive px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform">
                Handbook
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          </div>
        </div>
      </div>

      {proofPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setProofPreview(null)}
        >
          <div
            className="bg-white dark:bg-[#111] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Payment proof</p>
                <p className="font-bold text-gray-900 dark:text-white">{proofPreview.user}</p>
              </div>
              <button
                type="button"
                onClick={() => setProofPreview(null)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex justify-center">
              {proofPreview.url.toLowerCase().endsWith('.pdf') ? (
                <a
                  href={proofPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-aacp-olive font-bold underline"
                >
                  Open PDF in new tab
                </a>
              ) : (
                <img
                  src={proofPreview.url}
                  alt="Payment proof"
                  className="max-w-full max-h-[70vh] rounded-xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
