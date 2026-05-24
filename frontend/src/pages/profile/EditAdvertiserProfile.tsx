import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  X,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  Camera,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Shield,
  Eye,
  BarChart3,
  ChevronDown,
} from 'lucide-react';

interface PlatformProfile {
  platform: 'tiktok' | 'instagram';
  username: string;
  profileLink: string;
  accountType: 'personal' | 'business' | 'verified' | 'creator';
  postingFrequency: string;
  niche: string;
  contentStyle: string;
  audienceGender: 'mixed' | 'male' | 'female';
  audienceTopCountry: string;
  audienceAgeRange: string;
  followers?: number;
  totalLikes?: number;
  engagementRate: number;
  averageViews: number;
  averageComments: number;
  averageShares: number;
}

interface SaveStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

const platformColors = {
  tiktok: {
    primary: '#000000',
    gradient: 'from-black to-gray-800',
    light: '#1a1a1a',
    accent: '#25F4EE',
    icon: '♪',
  },
  instagram: {
    primary: '#E4405F',
    gradient: 'from-pink-600 to-orange-400',
    light: '#fdf1f5',
    accent: '#E4405F',
    icon: '📷',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const EditAdvertiserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tiktok' | 'instagram'>('tiktok');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: 'idle' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Mock initial data - replace with actual API call
  const [profiles, setProfiles] = useState<Record<'tiktok' | 'instagram', PlatformProfile>>({
    tiktok: {
      platform: 'tiktok',
      username: '@creativemind2024',
      profileLink: 'https://tiktok.com/@creativemind2024',
      accountType: 'creator',
      postingFrequency: '3-5 times per week',
      niche: 'Lifestyle & Fashion',
      contentStyle: 'Trending Sounds, Dances, Hauls',
      audienceGender: 'female',
      audienceTopCountry: 'United States',
      audienceAgeRange: '18-24',
      followers: 125400,
      totalLikes: 2450000,
      engagementRate: 8.5,
      averageViews: 45000,
      averageComments: 2100,
      averageShares: 890,
    },
    instagram: {
      platform: 'instagram',
      username: '@creativemind_official',
      profileLink: 'https://instagram.com/creativemind_official',
      accountType: 'business',
      postingFrequency: '4-6 times per week',
      niche: 'Fashion & Lifestyle',
      contentStyle: 'Professional Photos, Reels, Stories',
      audienceGender: 'mixed',
      audienceTopCountry: 'United States',
      audienceAgeRange: '20-30',
      followers: 89320,
      totalLikes: 1250000,
      engagementRate: 6.2,
      averageViews: 28000,
      averageComments: 1200,
      averageShares: 420,
    },
  });

  const currentProfile = profiles[activeTab];

  const handleFieldChange = (field: keyof PlatformProfile, value: any) => {
    setProfiles((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const handleSave = useCallback(async () => {
    setSaveStatus({ type: 'loading' });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setSaveStatus({ type: 'idle' }), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save profile. Please try again.' });
    }
  }, []);

  const isUrlValid = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(currentProfile.profileLink);
  };

  const color = platformColors[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-100 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Social Media Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your creator profiles and engagement analytics
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {/* Platform Tabs */}
            <div className="flex gap-3 mb-6">
              {(['tiktok', 'instagram'] as const).map((platform) => (
                <motion.button
                  key={platform}
                  onClick={() => setActiveTab(platform)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === platform
                      ? `bg-gradient-to-r ${platformColors[platform].gradient} text-white shadow-lg`
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow hover:shadow-md'
                  }`}
                >
                  {platform === 'tiktok' ? (
                    <span className="text-lg">♪</span>
                  ) : (
                    <Camera size={20} />
                  )}
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Section Card */}
                <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/40 dark:border-slate-700/40 shadow-xl p-6 sm:p-8 mb-6">
                  {/* Profile Header */}
                  <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      {/* Avatar Placeholder */}
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${color.gradient} shadow-lg flex items-center justify-center text-2xl sm:text-4xl`}>
                        {activeTab === 'tiktok' ? '♪' : '📷'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            {currentProfile.username}
                          </h2>
                          {(currentProfile.accountType === 'verified' || currentProfile.accountType === 'business') && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-flex"
                              title="Verified Account"
                            >
                              <Shield size={20} className="text-blue-500 fill-blue-500" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatNumber(currentProfile.followers || 0)} followers
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                      {isPreviewOpen ? 'Hide Preview' : 'View Preview'}
                    </motion.button>
                  </div>

                  {/* Edit Form */}
                  <div className="space-y-6">
                    {/* Row 1: Username & Profile Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        label="Username"
                        value={currentProfile.username}
                        onChange={(value) => handleFieldChange('username', value)}
                        icon="@"
                        maxLength={50}
                      />
                      <FormField
                        label="Profile Link"
                        value={currentProfile.profileLink}
                        onChange={(value) => handleFieldChange('profileLink', value)}
                        icon={<ExternalLink size={16} />}
                        isValid={isUrlValid(currentProfile.profileLink)}
                        type="url"
                        rightAction={
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyProfile}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Copy profile link"
                          >
                            <Copy size={16} className="text-slate-500" />
                          </motion.button>
                        }
                      />
                    </div>

                    {/* Row 2: Account Type & Posting Frequency */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <SelectField
                        label="Account Type"
                        value={currentProfile.accountType}
                        onChange={(value) => handleFieldChange('accountType', value)}
                        options={[
                          { value: 'personal', label: 'Personal' },
                          { value: 'creator', label: 'Creator' },
                          { value: 'business', label: 'Business' },
                          { value: 'verified', label: 'Verified' },
                        ]}
                      />
                      <FormField
                        label="Posting Frequency"
                        value={currentProfile.postingFrequency}
                        onChange={(value) => handleFieldChange('postingFrequency', value)}
                        placeholder="e.g., 3-5 times per week"
                      />
                    </div>

                    {/* Row 3: Niche & Content Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        label="Niche"
                        value={currentProfile.niche}
                        onChange={(value) => handleFieldChange('niche', value)}
                        placeholder="e.g., Fashion & Lifestyle"
                        maxLength={50}
                      />
                      <FormField
                        label="Content Style"
                        value={currentProfile.contentStyle}
                        onChange={(value) => handleFieldChange('contentStyle', value)}
                        placeholder="e.g., Trending Sounds, Hauls"
                        maxLength={100}
                      />
                    </div>

                    {/* Row 4: Audience Demographics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <SelectField
                        label="Audience Gender"
                        value={currentProfile.audienceGender}
                        onChange={(value) => handleFieldChange('audienceGender', value)}
                        options={[
                          { value: 'male', label: 'Mostly Male' },
                          { value: 'female', label: 'Mostly Female' },
                          { value: 'mixed', label: 'Mixed' },
                        ]}
                      />
                      <FormField
                        label="Top Country"
                        value={currentProfile.audienceTopCountry}
                        onChange={(value) => handleFieldChange('audienceTopCountry', value)}
                        placeholder="e.g., United States"
                        maxLength={50}
                      />
                      <FormField
                        label="Age Range"
                        value={currentProfile.audienceAgeRange}
                        onChange={(value) => handleFieldChange('audienceAgeRange', value)}
                        placeholder="e.g., 18-24"
                        maxLength={20}
                      />
                    </div>

                    {/* Row 5: Followers & Total Likes (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        label="Followers (Optional)"
                        value={currentProfile.followers?.toString() || ''}
                        onChange={(value) =>
                          handleFieldChange('followers', value ? parseInt(value, 10) : undefined)
                        }
                        type="number"
                        placeholder="Leave empty for auto-calc"
                      />
                      <FormField
                        label="Total Likes (Optional)"
                        value={currentProfile.totalLikes?.toString() || ''}
                        onChange={(value) =>
                          handleFieldChange('totalLikes', value ? parseInt(value, 10) : undefined)
                        }
                        type="number"
                        placeholder="Leave empty for auto-calc"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics Cards */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={20} />
                    Performance Analytics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnalyticsCard
                      label="Engagement Rate"
                      value={`${currentProfile.engagementRate}%`}
                      icon={<TrendingUp size={20} />}
                      color="from-green-500 to-aacp-olive"
                      trend="+2.3%"
                    />
                    <AnalyticsCard
                      label="Average Views"
                      value={formatNumber(currentProfile.averageViews)}
                      icon={<Eye size={20} />}
                      color="from-blue-500 to-cyan-600"
                      trend="+12.5%"
                    />
                    <AnalyticsCard
                      label="Average Comments"
                      value={formatNumber(currentProfile.averageComments)}
                      icon={<MessageCircle size={20} />}
                      color="from-purple-500 to-pink-600"
                      trend="+5.1%"
                    />
                    <AnalyticsCard
                      label="Average Shares"
                      value={formatNumber(currentProfile.averageShares)}
                      icon={<Share2 size={20} />}
                      color="from-orange-500 to-red-600"
                      trend="+8.3%"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Sidebar - Profile Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className="sticky top-8">
              {/* Summary Card */}
              <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/40 dark:border-slate-700/40 shadow-xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
                  Profile Summary
                </h3>

                {/* Platform Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${color.gradient} text-white font-semibold mb-6 w-full justify-center`}>
                  {activeTab === 'tiktok' ? '♪' : '📷'}
                  <span>{activeTab.toUpperCase()}</span>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Followers</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatNumber(currentProfile.followers || 0)}
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Engagement</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {currentProfile.engagementRate}%
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Likes</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatNumber(currentProfile.totalLikes || 0)}
                    </span>
                  </div>
                </div>

                {/* Open Profile Button */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={currentProfile.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r ${color.gradient} text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow`}
                >
                  <ExternalLink size={16} />
                  Open Profile
                </motion.a>
              </div>

              {/* Info Card */}
              <div className="backdrop-blur-xl bg-blue-50/80 dark:bg-blue-950/30 rounded-2xl border border-blue-200/40 dark:border-blue-700/40 p-6">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={18} />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Save Your Changes</p>
                    <p>All changes will be saved to your profile and visible to potential collaborators.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Button - Fixed at bottom */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 right-0 left-0 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent pt-6 pb-8 px-4 border-t border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saveStatus.type === 'loading'}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus.type === 'loading' ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Save size={18} />
                </motion.div>
                Saving...
              </>
            ) : saveStatus.type === 'success' ? (
              <>
                <Check size={18} />
                Saved
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {saveStatus.type !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-20 right-4 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-xl p-4 shadow-xl flex items-center gap-3 max-w-sm"
            >
              {saveStatus.type === 'success' && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
                    <Check size={20} />
                  </motion.div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{saveStatus.message}</span>
                </>
              )}
              {saveStatus.type === 'error' && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">
                    <AlertCircle size={20} />
                  </motion.div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{saveStatus.message}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Form Field Component
interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: 'text' | 'url' | 'number' | 'email';
  maxLength?: number;
  isValid?: boolean;
  rightAction?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  maxLength,
  isValid,
  rightAction,
}) => {
  const charCount = value.length;
  const showCharCount = maxLength && charCount > 0;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {icon && typeof icon === 'string' ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{icon}</span>
        ) : icon ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-4 py-3 ${icon ? 'pl-10' : ''} rounded-xl bg-slate-50 dark:bg-slate-700 border-2 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-600 ${
            isValid === false ? 'border-red-300 dark:border-red-600' : 'border-transparent'
          }`}
        />
        {rightAction && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightAction}</div>}
      </div>
      {showCharCount && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
          {charCount}/{maxLength}
        </p>
      )}
      {isValid === false && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          Invalid URL format
        </p>
      )}
    </div>
  );
};

// Select Field Component
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-white text-left flex items-center justify-between focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
        >
          <span>{options.find((opt) => opt.value === value)?.label}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-slate-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg z-10 overflow-hidden"
            >
              {options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    value === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Analytics Card Component
interface AnalyticsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ label, value, icon, color, trend }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/40 dark:border-slate-700/40 shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white`}>{icon}</div>
        {trend && <span className="text-xs font-semibold text-green-600 dark:text-green-400">{trend}</span>}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </motion.div>
  );
};

export default EditAdvertiserProfile;
