import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Shield, UserPlus, Loader2, AlertCircle, Ban, CheckCircle2, Crown } from 'lucide-react';
import SuperAdminLayout from '@/src/shared/components/layouts/SuperAdminLayout';
import { useCreateAdminUser, useSuperAdmins, useUpdateAdminUser } from '@/src/hooks/useSuperAdmin';

export default function SuperAdminAdminManagementPage() {
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const { data, isLoading, isError, refetch } = useSuperAdmins({ search: search || undefined });
  const createAdmin = useCreateAdminUser();
  const updateAdmin = useUpdateAdminUser();

  const admins = data?.admins ?? [];
  const stats = useMemo(() => {
    const total = admins.length;
    const superAdmins = admins.filter(a => a.role === 'super_admin').length;
    const active = admins.filter(a => a.status === 'active').length;
    return { total, superAdmins, active };
  }, [admins]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleCreateAdmin = async () => {
    if (!inviteEmail.trim()) {
      showToast('Enter admin email first', 'error');
      return;
    }
    if (!inviteFirstName.trim() || !inviteLastName.trim()) {
      showToast('First and last names are required', 'error');
      return;
    }
    if (!invitePassword.trim() || invitePassword.trim().length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    try {
      await createAdmin.mutateAsync({
        email: inviteEmail.trim().toLowerCase(),
        firstName: inviteFirstName.trim(),
        lastName: inviteLastName.trim(),
        password: invitePassword.trim(),
      });
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInvitePassword('');
      showToast('Admin account created successfully');
    } catch (error: any) {
      showToast(
        error?.response?.data?.error || error?.response?.data?.message || 'Failed to create admin account',
        'error'
      );
    }
  };

  const handleStatus = async (userId: string, status: 'active' | 'banned' | 'suspended') => {
    try {
      await updateAdmin.mutateAsync({ userId, payload: { status } });
      showToast(`Admin status updated to ${status}`);
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Failed to update admin status', 'error');
    }
  };

  const handleRole = async (userId: string, role: 'admin' | 'super_admin') => {
    try {
      await updateAdmin.mutateAsync({ userId, payload: { role } });
      showToast(`Admin role updated to ${role}`);
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Failed to update admin role', 'error');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Admin Management</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Orchestrate platform governance and access controls.
            </p>
          </div>
          <div className="bg-white dark:bg-[#111111] p-6 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm w-full lg:w-auto">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserPlus size={16} className="text-primary-blue" />
              Create New Admin
            </h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <input
                value={inviteFirstName}
                onChange={(e) => setInviteFirstName(e.target.value)}
                placeholder="First Name"
                className="bg-[#F4F4F4] dark:bg-white/5 border-none rounded-2xl px-4 py-3 text-sm w-full sm:w-40 outline-none focus:ring-2 focus:ring-primary-blue/20"
              />
              <input
                value={inviteLastName}
                onChange={(e) => setInviteLastName(e.target.value)}
                placeholder="Last Name"
                className="bg-[#F4F4F4] dark:bg-white/5 border-none rounded-2xl px-4 py-3 text-sm w-full sm:w-40 outline-none focus:ring-2 focus:ring-primary-blue/20"
              />
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Admin Email"
                className="bg-[#F4F4F4] dark:bg-white/5 border-none rounded-2xl px-4 py-3 text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-primary-blue/20"
              />
              <div className="relative w-full sm:w-56">
                <input
                  type={showPassword ? "text" : "password"}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Temporary Password"
                  className="bg-[#F4F4F4] dark:bg-white/5 border-none rounded-2xl px-4 py-3 text-sm w-full outline-none focus:ring-2 focus:ring-primary-blue/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9FA5] hover:text-primary-blue transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3.636 3.636m16.728 16.728L14.121 14.121M16.5 16.5A10.05 10.05 0 0019.5 12c-1.275-4.057-5.065-7-9.542-7-1.274 0-2.483.245-3.588.691m4.773 4.773L16.5 16.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={handleCreateAdmin}
                disabled={createAdmin.isPending}
                className="px-6 py-3 bg-primary-blue hover:bg-primary-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-neutral-border/25 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-60 min-w-[140px]"
              >
                {createAdmin.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Create Admin
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Total Admins</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Super Admins</p>
            <p className="text-2xl font-black">{stats.superAdmins}</p>
          </div>
          <div className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Active Now</p>
            <p className="text-2xl font-black">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Pending Requests</p>
            <p className="text-2xl font-black">0</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-6 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admins..."
              className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 border-none"
            />
          </div>
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
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Identity</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">System Role</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Platform Status</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Joined</th>
                  <th className="py-6 px-8 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4] dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 text-primary-blue animate-spin mx-auto mb-4" />
                      <p className="text-sm font-bold text-[#6F767E]">Loading admins...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                      </div>
                      <p className="text-sm font-bold">Failed to load admins</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-primary-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                      >
                        Try Again
                      </button>
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="text-[#9A9FA5]" size={32} />
                      </div>
                      <p className="text-sm font-bold">No admins found</p>
                    </td>
                  </tr>
                ) : (
                  admins.map((a, idx) => (
                    <motion.tr
                      key={a._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {a.profilePicture ? (
                              <img src={a.profilePicture} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-border/25 dark:bg-primary-blue/20 text-primary-blue font-black text-sm">
                                {(a.firstName?.[0] ?? a.email[0]).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-none mb-1">
                              {a.firstName} {a.lastName}
                            </p>
                            <p className="text-xs text-[#9A9FA5]">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue inline-flex items-center gap-2">
                          <Shield size={12} />
                          {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            a.status === 'active'
                              ? 'bg-neutral-border/25 dark:bg-primary-blue/20 text-primary-blue'
                              : a.status === 'banned'
                              ? 'bg-red-100 dark:bg-red-500/20 text-red-600'
                              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-xs font-medium text-[#9A9FA5]">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          {a.role === 'admin' ? (
                            <button
                              className="px-3 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#6F767E] hover:text-primary-blue hover:border-primary-blue/30 transition-all"
                              onClick={() => handleRole(a._id, 'super_admin')}
                            >
                              <span className="inline-flex items-center gap-1"><Crown size={12} /> Promote</span>
                            </button>
                          ) : (
                            <button
                              className="px-3 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#6F767E] hover:text-primary-blue hover:border-primary-blue/30 transition-all"
                              onClick={() => handleRole(a._id, 'admin')}
                            >
                              Demote
                            </button>
                          )}
                          {a.status === 'active' ? (
                            <button
                              className="px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 transition-all"
                              onClick={() => handleStatus(a._id, 'suspended')}
                            >
                              <span className="inline-flex items-center gap-1"><Ban size={12} /> Suspend</span>
                            </button>
                          ) : (
                            <button
                              className="px-3 py-2 bg-neutral-border/15 dark:bg-primary-blue/10 border border-neutral-border/25 dark:border-primary-blue/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-blue transition-all"
                              onClick={() => handleStatus(a._id, 'active')}
                            >
                              <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} /> Reactivate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-primary-blue p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <h3 className="text-xl font-black mb-2">Security Protocol Active</h3>
            <p className="text-xs font-medium opacity-90 max-w-xl">
              Super Admins can review all admin actions and enforce least-privilege access across the platform.
            </p>
            <button className="mt-6 bg-white text-primary-blue px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
              Review Security Logs
            </button>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-black mb-3">Role Compliance</h3>
            <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
              AACP Velocity implements strict Principle of Least Privilege (PoLP) across all admin tiers.
            </p>
            <button className="mt-6 text-xs font-black text-primary-blue uppercase tracking-widest">
              View Guidelines →
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success'
                ? 'bg-primary-blue text-white border-neutral-border'
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </SuperAdminLayout>
  );
}

