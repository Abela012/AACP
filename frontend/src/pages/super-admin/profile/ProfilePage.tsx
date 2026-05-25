import { motion } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  Activity,
  Users,
  Mail,
  Crown,
} from "lucide-react";
import SuperAdminLayout from "@/src/shared/components/layouts/SuperAdminLayout";
import { useSuperAdminProfile } from "@/src/hooks/useSuperAdmin";
import { useMyTrustScore } from "@/src/hooks/useAdminAnalytics";

export default function SuperAdminProfilePage() {
  const { data, isLoading, isError } = useSuperAdminProfile();
  const profile = data?.profile;
  const { data: trustScoreData } = useMyTrustScore();
  const trustScoreValue = trustScoreData?.trustScore ?? null;

  return (
    <SuperAdminLayout>
      <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Super Admin Profile</h1>
          <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
            Profile overview, governance scope, and recent administrative
            actions.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader2 className="w-10 h-10 text-primary-blue animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-white dark:bg-[#111111] p-10 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm text-center">
            <p className="font-bold">Failed to load super admin profile.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 aacp-cx aacp-cx--admin p-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-4xl overflow-hidden bg-neutral-border/25 dark:bg-primary-blue/20 flex items-center justify-center text-primary-blue font-black text-2xl">
                      {profile?.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (
                          profile?.firstName?.[0] ||
                          profile?.email?.[0] ||
                          "S"
                        ).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-border/25 dark:bg-primary-blue/20 text-primary-blue rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
                        <ShieldCheck size={12} />
                        Approved
                      </div>
                      <h2 className="text-4xl font-black">
                        {profile?.firstName} {profile?.lastName}
                      </h2>
                      <p className="text-xl text-primary-blue font-medium mt-1">
                        Velocity Root
                      </p>
                    </div>
                  </div>
                  <button className="px-5 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest">
                    Direct Message
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 aacp-cx aacp-cx--admin p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary-blue" size={18} />
                  <div>
                    <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">
                      Email
                    </p>
                    <p className="text-sm font-bold">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="text-amber-600" size={18} />
                  <div>
                    <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">
                      Role
                    </p>
                    <p className="text-sm font-bold">
                      {data?.stats.activeRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue mb-5">
                  <Activity size={20} />
                </div>
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">
                  Audit Events
                </p>
                <p className="text-2xl font-black">
                  {data?.stats.auditEvents ?? 0}
                </p>
              </div>
              <div className="aacp-cx aacp-cx--admin p-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 mb-5">
                  <Users size={20} />
                </div>
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">
                  Governed Admins
                </p>
                <p className="text-2xl font-black">
                  {data?.stats.governedAdmins ?? 0}
                </p>
              </div>
              <div className="bg-primary-blue p-6 rounded-4xl shadow-xl text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">
                  Trust Score
                </p>
                <p className="text-4xl font-black">
                  {trustScoreValue !== null ? trustScoreValue : "—"}
                </p>
                <p className="text-xs font-medium opacity-90 mt-2">
                  Root-level governance and elevated access control enabled.
                </p>
              </div>
            </div>

            <div className="aacp-cx aacp-cx--admin p-8">
              <h3 className="text-xl font-black mb-6">Recent Actions</h3>
              <div className="space-y-4">
                {data?.recentActions?.length ? (
                  data.recentActions.map((log, idx) => (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-5 bg-[#FAFAFD] dark:bg-white/5 rounded-2xl border border-[#F0F0F5] dark:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black">
                            {log.message || log.action}
                          </p>
                          <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium mt-1">
                            {log.targetType || "system"}{" "}
                            {log.targetId ? `• ${log.targetId}` : ""}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
                    No recent actions recorded.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
