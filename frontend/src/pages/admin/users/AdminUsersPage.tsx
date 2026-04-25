import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminUsers, useUpdateUserStatus } from '@/src/hooks/useAdminUsers';
import type { AdminUser } from '@/src/api/adminApi';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Real API data
  const { data, isLoading, isError, refetch } = useAdminUsers({
    page: currentPage,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const updateStatus = useUpdateUserStatus();

  // Debounce search input
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
  };

  const handleSuspend = (user: AdminUser) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    updateStatus.mutate(
      { userId: user._id, status: newStatus },
      {
        onSuccess: () => showToast(
          newStatus === 'active'
            ? `${user.firstName} ${user.lastName} has been reinstated.`
            : `${user.firstName} ${user.lastName} has been suspended.`,
          newStatus === 'active' ? 'success' : 'error'
        ),
        onError: () => showToast('Failed to update user status. Please try again.', 'error'),
      }
    );
  };

  // Client-side role filter (search is server-side)
  const users = data?.users ?? [];
  const filteredUsers = activeFilter === 'All'
    ? users
    : users.filter(u => {
        if (activeFilter === 'Advertiser') return u.role === 'advertiser';
        if (activeFilter === 'Business Owner') return u.role === 'business_owner';
        return true;
      });

  const roleLabel = (role: AdminUser['role']) => {
    const map: Record<string, string> = {
      business_owner: 'Business Owner',
      advertiser: 'Advertiser',
      admin: 'Administrator',
      super_admin: 'Super Admin',
    };
    return map[role] ?? role;
  };

  const statusStyle = (status: AdminUser['status']) => {
    if (status === 'active') return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600';
    if (status === 'banned') return 'bg-red-100 dark:bg-red-500/20 text-red-600';
    return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600';
  };

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">User Management</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Manage all platform users, roles, and account statuses.
              {data?.total !== undefined && (
                <span className="ml-2 text-[#14a800] font-bold">{data.total.toLocaleString()} users total</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 w-64 transition-all"
              />
            </div>
            <div className="flex bg-[#F4F4F4] dark:bg-white/5 p-1 rounded-2xl">
              {['All', 'Advertiser', 'Business Owner'].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveFilter(role)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeFilter === role
                      ? 'bg-white dark:bg-white/10 shadow-sm text-[#14a800]'
                      : 'text-[#6F767E] hover:text-[#1A1D1F]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              className="p-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl hover:bg-gray-50 transition-all text-[#6F767E]"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#F4F4F4] dark:border-white/5">
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">User</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Role</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Status</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Joined</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4] dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 size={32} className="text-[#14a800] animate-spin mx-auto mb-4" />
                      <p className="text-sm font-bold text-[#6F767E]">Loading users...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                      </div>
                      <h3 className="text-sm font-bold text-[#1A1D1F] dark:text-white mb-2">Failed to load users</h3>
                      <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-[#14a800] text-white rounded-xl text-xs font-bold"
                      >
                        Try Again
                      </button>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-6 px-8">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-100 dark:bg-green-500/20 text-[#14a800] font-black text-sm">
                                {user.firstName?.[0] ?? user.email[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-[#9A9FA5]">{user.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-xs font-bold text-[#6F767E] dark:text-gray-400">
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusStyle(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-xs font-medium text-[#9A9FA5]">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] hover:text-[#14a800]"
                            title="View Profile"
                          >
                            <Eye size={18} />
                          </Link>
                          {!user.isVerified && (
                            <Link
                              to="/admin/verification"
                              className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] hover:text-[#14a800]"
                              title="Review Verification"
                            >
                              <ShieldCheck size={18} />
                            </Link>
                          )}
                          <button
                            onClick={() => handleSuspend(user)}
                            disabled={updateStatus.isPending}
                            className={`p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-50 ${
                              user.status === 'banned' ? 'text-emerald-500' : 'text-[#9A9FA5] hover:text-red-500'
                            }`}
                            title={user.status === 'banned' ? 'Reinstate User' : 'Suspend User'}
                          >
                            {updateStatus.isPending ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : user.status === 'banned' ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Ban size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={32} className="text-[#9A9FA5]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#1A1D1F] dark:text-white">No users found</h3>
                      <p className="text-xs text-[#6F767E] dark:text-gray-400">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="p-8 border-t border-[#F4F4F4] dark:border-white/5 flex justify-between items-center">
              <p className="text-xs font-bold text-[#6F767E]">
                Page {data.page} of {data.pages} — {data.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(data.pages, p + 1))}
                  disabled={currentPage === data.pages}
                  className="px-4 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
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
