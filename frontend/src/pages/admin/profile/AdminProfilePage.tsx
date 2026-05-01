import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, History, CreditCard, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';

export default function AdminProfilePage() {
  const { user: clerkUser } = useClerkUser();
  const api = useApiClient();
  const [isEditing, setIsEditing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [profileName, setProfileName] = useState(clerkUser?.fullName || 'Administrator');
  const [tempName, setTempName] = useState(profileName);
  const [profileImage, setProfileImage] = useState(clerkUser?.imageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        showToast('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);

      // Upload to backend (persists + updates DB profilePicture)
      userApi.uploadProfilePicture(api, file)
        .then((res: any) => {
          const url = res?.data?.user?.profilePicture;
          if (url) setProfileImage(url);
          showToast('Profile photo saved successfully!');
        })
        .catch(() => {
          showToast('Failed to upload profile photo. Please try again.', 'error');
        });
    }
  };

  const handleSave = () => {
    setProfileName(tempName);
    setIsEditing(false);
    showToast('Profile details updated successfully!');
  };

  const handleCancel = () => {
    setTempName(profileName);
    setIsEditing(false);
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    showToast(is2FAEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    showToast('Password changed successfully!');
    setIsChangingPassword(false);
    setPasswordData({ old: '', new: '', confirm: '' });
  };

  return (
    <AdminLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">My Profile</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">View and manage your administrator account details.</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 text-[#1A1D1F] dark:text-white rounded-2xl text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] shadow-lg shadow-green-100 dark:shadow-none transition-all"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] shadow-lg shadow-green-100 dark:shadow-none transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm text-center relative overflow-hidden group">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full border-4 border-green-100 dark:border-green-500/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={profileImage} 
                    alt="Admin" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#14a800] text-white rounded-full flex items-center justify-center border-4 border-white dark:border-[#111111] hover:scale-110 transition-transform"
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              {isEditing ? (
                <div className="mb-6 space-y-3">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-2 text-sm font-bold text-center bg-gray-50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a800]/20"
                  />
                </div>
              ) : (
                <h3 className="text-xl font-bold mb-1">{profileName}</h3>
              )}
              <p className="text-[10px] font-black text-[#14a800] uppercase tracking-widest mb-6">Senior Administrator</p>
              <div className="w-full h-[1px] bg-[#EFEFEF] dark:bg-white/5 mb-6" />
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#9A9FA5]" />
                  <span className="text-sm font-bold truncate">{clerkUser?.primaryEmailAddress?.emailAddress || 'admin@aacp-platform.ai'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-[#9A9FA5]" />
                  <span className="text-sm font-bold uppercase">{clerkUser?.id?.slice(0, 14) || 'AACP-ADMIN-8821'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings & Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Shield className="text-[#14a800]" size={20} />
                <h3 className="font-bold text-lg">Security & Privacy</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold mb-1">Two-Factor Authentication</h4>
                    <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">Add an extra layer of security to your account.</p>
                  </div>
                  <button 
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md dark:shadow-none ${
                      is2FAEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#14a800] hover:bg-[#108a00] shadow-green-100'
                    }`}
                  >
                    {is2FAEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <div className="flex flex-col p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold mb-1">Change Password</h4>
                      <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">Update your password regularly to keep your account secure.</p>
                    </div>
                    {!isChangingPassword && (
                      <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Update
                      </button>
                    )}
                  </div>
                  
                  {isChangingPassword && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleUpdatePassword}
                      className="space-y-4 pt-4 border-t border-[#F4F4F4] dark:border-white/5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#9A9FA5] uppercase">Old Password</label>
                          <input 
                            type="password" 
                            required
                            value={passwordData.old}
                            onChange={(e) => setPasswordData({...passwordData, old: e.target.value})}
                            className="w-full px-4 py-2 text-xs bg-white dark:bg-[#111111] border border-[#EFEFEF] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a800]/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#9A9FA5] uppercase">New Password</label>
                          <input 
                            type="password" 
                            required
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            className="w-full px-4 py-2 text-xs bg-white dark:bg-[#111111] border border-[#EFEFEF] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a800]/20"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black text-[#9A9FA5] uppercase">Confirm New Password</label>
                          <input 
                            type="password" 
                            required
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            className="w-full px-4 py-2 text-xs bg-white dark:bg-[#111111] border border-[#EFEFEF] dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a800]/20"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsChangingPassword(false)}
                          className="px-4 py-2 text-xs font-bold text-[#6F767E] hover:text-[#1A1D1F]"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-6 py-2 bg-[#14a800] text-white text-xs font-bold rounded-xl hover:bg-[#108a00] transition-all"
                        >
                          Change Password
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <History className="text-[#9A9FA5]" size={20} />
                  <h3 className="font-bold text-lg">Login History</h3>
                </div>
                <button className="text-[10px] font-black text-[#14a800] uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-[#F4F4F4] dark:border-white/5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold mb-1">Mac OS • Chrome</p>
                      <p className="text-xs text-[#6F767E] dark:text-gray-400">IP: 192.168.1.{10 + idx} • {idx === 0 ? 'Current Session' : `${idx + 1} hours ago`}</p>
                    </div>
                    {idx === 0 ? (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Active</span>
                    ) : (
                      <button className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-[#6F767E] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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
    </AdminLayout>
  );
}
