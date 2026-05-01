import { useState, useRef, useCallback, useEffect } from 'react';
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
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  X,
  LogOut,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';

export default function EditProfilePage() {
  const { userRole, logout: localLogout } = useUser();
  const { profile, updateProfile, refreshProfile, isLoading } = useProfile();
  const { signOut } = useClerk();
  const api = useApiClient();
  const location = useLocation();

  const isBusiness = location.pathname.includes('/business') || userRole === 'business';
  const Layout = isBusiness ? BusinessLayout : AdvertiserLayout;

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local form state – seeded from context
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [industry, setIndustry] = useState(profile.industry || 'B2B Software');
  const [businessLocation, setBusinessLocation] = useState(profile.businessLocation || '');
  const [companySize, setCompanySize] = useState(profile.companySize || '1-10');
  const [monthlyBudget, setMonthlyBudget] = useState(profile.monthlyBudget || 0);
  const [youtubeHandle, setYoutubeHandle] = useState(profile.youtubeHandle || '');
  const [tiktokHandle, setTiktokHandle] = useState(profile.tiktokHandle || '');

  // Sync local state when profile loads/refreshes
  useEffect(() => {
    if (profile && !isLoading) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setBusinessName(profile.businessName || '');
      setWebsite(profile.website || '');
      setIndustry(profile.industry || 'B2B Software');
      setBusinessLocation(profile.businessLocation || '');
      setCompanySize(profile.companySize || '1-10');
      setMonthlyBudget(profile.monthlyBudget || 0);
      setYoutubeHandle(profile.youtubeHandle || '');
      setTiktokHandle(profile.tiktokHandle || '');
      setAvatarPreview(profile.avatarUrl || '');
      setCoverPreview(profile.coverImageUrl || '');
    }
  }, [profile, isLoading]);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatarUrl || '');
  const [coverPreview, setCoverPreview] = useState<string>(profile.coverImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Notification toggles
  const [notifOpportunities, setNotifOpportunities] = useState(true);
  const [notifCampaignUpdates, setNotifCampaignUpdates] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  const tabs = [
    { id: 'general', label: 'General Info', icon: User },
    { id: 'company', label: isBusiness ? 'Company Details' : 'Professional Details', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) { // 2MB
      alert('Image must be under 2MB.');
      return;
    }
    
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/users/profile/picture?type=avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrl = res.data.user.profilePicture;
      setAvatarPreview(newUrl);
      updateProfile({ avatarUrl: newUrl });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload image.');
    } finally {
      setIsSaving(false);
    }
  }, [api, updateProfile]);
 
   const handleCoverChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     
     setIsSaving(true);
     try {
       const formData = new FormData();
       formData.append('image', file);
       const res = await api.post('/users/profile/picture?type=cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrl = res.data.user.coverImage;
      setCoverPreview(newUrl);
      updateProfile({ coverImageUrl: newUrl });
     } catch (error) {
       console.error('Failed to upload cover:', error);
       alert('Failed to upload image.');
     } finally {
       setIsSaving(false);
     }
   }, [api, updateProfile]);

  const handleRemoveAvatar = () => {
    setAvatarPreview('https://i.pravatar.cc/150?u=techvision');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileData = {
        firstName,
        lastName,
        bio,
        phone,
        businessName,
        website,
        industry,
        businessLocation,
        companySize,
        monthlyBudget,
        youtubeHandle,
        tiktokHandle,
        coverImage: coverPreview,
        // Include advertiser specific fields if they exist in state
        followers: profile.followers,
        avgViews: profile.avgViews,
        engagementRate: profile.engagementRate,
        geoTags: profile.geoTags,
        ageRanges: profile.ageRanges,
        primaryLanguage: profile.primaryLanguage,
        baseRate: profile.baseRate,
        selectedStyles: profile.selectedStyles,
      };

      await userApi.updateProfile(api, {
        firstName,
        lastName,
        profileData,
      });
      
      updateProfile(profileData);
      await refreshProfile();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputCls =
    'w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white';
  const labelCls = 'text-xs font-bold text-gray-500 uppercase tracking-wider';

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

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
              'w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg',
              showSuccess
                ? 'bg-cyan-500 text-white shadow-cyan-500/20'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20',
              isSaving && 'opacity-70 cursor-not-allowed'
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
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => {
                  localLogout();
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
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
              {/* ── GENERAL INFO ── */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Information</h2>

                  {/* Cover Image Upload */}
                  <div className="mb-8 space-y-4">
                    <label className={labelCls}>Cover Image</label>
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden group border border-gray-200 dark:border-white/10">
                      <img 
                        src={coverPreview || (isBusiness 
                          ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop' 
                          : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop')} 
                        alt="Cover" 
                        className="w-full h-full object-cover" 
                      />
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 border border-white/20">
                          <ImageIcon size={16} />
                          Change Cover
                        </div>
                      </div>
                      <input 
                        ref={coverInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden">
                        <img
                          src={avatarPreview || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Overlay on hover */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <ImageIcon size={20} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2 mb-2 border border-gray-200 dark:border-white/10"
                      >
                        <ImageIcon size={16} />
                        Upload New Photo
                      </button>
                      <button
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2 mb-2"
                      >
                        <X size={16} />
                        Remove
                      </button>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>Public Bio</label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── COMPANY DETAILS ── */}
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {isBusiness ? 'Company Details' : 'Professional Details'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Industry</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none"
                        >
                          <option>B2B Software</option>
                          <option>SaaS</option>
                          <option>E-commerce</option>
                          <option>Fintech</option>
                          <option>Healthcare</option>
                          <option>Education</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={businessLocation}
                          onChange={(e) => setBusinessLocation(e.target.value)}
                          className={inputCls}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    {isBusiness ? (
                      <>
                        <div className="space-y-2">
                          <label className={labelCls}>Monthly Budget ($)</label>
                          <input
                            type="number"
                            min="0"
                            value={monthlyBudget}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setMonthlyBudget(val);
                            }}
                            className={inputCls.replace('pl-10', 'pl-4')}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className={labelCls}>Company Size</label>
                          <select
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none"
                          >
                            <option>1-10</option>
                            <option>11-50</option>
                            <option>51-200</option>
                            <option>200+</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className={labelCls}>YouTube Handle</label>
                          <input
                            type="text"
                            value={youtubeHandle}
                            onChange={(e) => setYoutubeHandle(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder="@handle"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>TikTok Handle</label>
                          <input
                            type="text"
                            value={tiktokHandle}
                            onChange={(e) => setTiktokHandle(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder="@handle"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
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
                        <input type="password" placeholder="Current Password" className={inputCls} />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="password" placeholder="New Password" className={inputCls} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'New Opportunities',
                        desc: 'Get notified when an AI match is found.',
                        value: notifOpportunities,
                        onChange: setNotifOpportunities,
                      },
                      {
                        title: 'Campaign Updates',
                        desc: 'Status changes and workflow alerts.',
                        value: notifCampaignUpdates,
                        onChange: setNotifCampaignUpdates,
                      },
                      {
                        title: 'Marketing Invites',
                        desc: 'News, events, and feature updates.',
                        value: notifMarketing,
                        onChange: setNotifMarketing,
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/50 rounded-2xl border border-gray-100 dark:border-white/5"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item.value}
                            onChange={(e) => item.onChange(e.target.checked)}
                          />
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
