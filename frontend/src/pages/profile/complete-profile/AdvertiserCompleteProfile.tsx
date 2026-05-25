import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/src/shared/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTiktok,
  FaInstagram,
  FaFacebook
} from 'react-icons/fa6';
import {
  User,
  Phone,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  ArrowRight,
  Globe,
  Sparkles,
  Link,
  Target,
  Smile,
  LogOut,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useApiClient } from '@/src/api/apiClient';
import { toast } from 'react-hot-toast';

// Curated Harmony Color Palette & Sleek styling constants
const SECTION_STYLE = "bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_30px_rgba(0,0,0,0.04)]";
const INPUT_STYLE = "w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all duration-200";

interface SocialPlatformData {
  connected: boolean;
  verified: boolean;
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  metrics?: {
    followers?: number;
    following?: number;
    totalLikes?: number;
    totalPosts?: number;
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
    engagementRate?: number;
  };
}

interface ConnectedAccounts {
  tiktok: SocialPlatformData;
  instagram: SocialPlatformData;
  facebook: SocialPlatformData;
}

export default function AdvertiserCompleteProfile() {
  const navigate = useNavigate();
  const api = useApiClient();
  const { setOnboardingStatus } = useUser();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Social connection states
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccounts>({
    tiktok: { connected: false, verified: false },
    instagram: { connected: false, verified: false },
    facebook: { connected: false, verified: false }
  });

  // Niche and content states
  const [niche, setNiche] = useState('');
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');

  // Target Audience States
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // Modal connection states
  const [modalPlatform, setModalPlatform] = useState<'tiktok' | 'instagram' | 'facebook' | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1);
  const [usernameInput, setUsernameInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState<string>('');

  // Verification Processing States
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scanMessage, setScanMessage] = useState('🤖 AI scanning bio for verification code...');

  // Load Setup Data on Mount
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const res = await api.get('/advertiser/profile/setup');
        if (res.data && res.data.success) {
          const { user } = res.data;
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setPhoneNumber(user.phoneNumber || '');
          setConnectedAccounts(user.connectedAccounts || {
            tiktok: { connected: false, verified: false },
            instagram: { connected: false, verified: false },
            facebook: { connected: false, verified: false }
          });

          if (user.niche) setNiche(user.niche);
          if (user.contentTypes) setContentTypes(user.contentTypes);
          if (user.experienceLevel) setExperienceLevel(user.experienceLevel);
          if (user.targetAudience) {
            if (user.targetAudience.ageRange) setAgeRange(user.targetAudience.ageRange);
            if (user.targetAudience.gender) setGender(user.targetAudience.gender);
            if (user.targetAudience.interests) setInterests(user.targetAudience.interests);
          }
        }
      } catch (error: any) {
        console.error("Failed to load advertiser profile setup:", error);
        toast.error("Could not load profile configuration.");
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, [api]);

  // Rotate Scan Messages During Verification
  useEffect(() => {
    if (!verifying) return;
    const messages = [
      "🤖 AI scanning bio for verification code...",
      "🔍 Accessing public platform metadata...",
      "🔗 Correlating username authenticity...",
      "⚙️ Fetching platform analytics & stats...",
      "✨ Almost done! Saving to database..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setScanMessage(messages[index]);
    }, 1600);

    return () => clearInterval(interval);
  }, [verifying]);

  // Derived properties
  const isBasicInfoComplete = firstName.trim() !== '' && lastName.trim() !== '';
  const isAnySocialConnected = Object.values(connectedAccounts).some(p => p.connected && p.verified);
  const isFormValid = isBasicInfoComplete && isAnySocialConnected && niche !== '' && contentTypes.length > 0 && experienceLevel !== '';

  const progressPercent = () => {
    let completed = 0;
    if (isBasicInfoComplete) completed += 25;
    if (isAnySocialConnected) completed += 25;
    if (niche !== '' && contentTypes.length > 0 && experienceLevel !== '') completed += 25;
    if (isFormValid) completed += 25;
    return completed;
  };

  const getStepIndicator = () => {
    const progress = progressPercent();
    if (progress === 0) return "Step 1 of 4";
    if (progress === 25) return "Step 2 of 4";
    if (progress === 50) return "Step 3 of 4";
    if (progress === 75) return "Step 4 of 4";
    return "All Done!";
  };

  // Add Interest Tag
  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = interestInput.trim().toLowerCase();
    if (clean && !interests.includes(clean)) {
      setInterests([...interests, clean]);
      setInterestInput('');
    }
  };

  // Remove Interest Tag
  const handleRemoveInterest = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
  };

  // Toggle Content Type
  const handleToggleContentType = (type: string) => {
    if (contentTypes.includes(type)) {
      setContentTypes(contentTypes.filter(c => c !== type));
    } else {
      setContentTypes([...contentTypes, type]);
    }
  };

  // Open Social Connection Modal
  const handleOpenConnect = (platform: 'tiktok' | 'instagram' | 'facebook') => {
    setModalPlatform(platform);
    setModalStep(1);
    setUsernameInput('');
    setVerificationCode('');
  };

  // Step 1: Initiate connection
  const handleInitiateConnection = async () => {
    if (!usernameInput.trim()) {
      toast.error("Please enter a username or handle");
      return;
    }

    try {
      const res = await api.post('/advertiser/social/initiate', {
        platform: modalPlatform,
        username: usernameInput
      });

      if (res.data && res.data.success) {
        setVerificationCode(res.data.verificationCode);
        setCodeExpiresAt(new Date(res.data.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setModalStep(2);
      }
    } catch (error: any) {
      console.error("Initiate connection failed:", error);
      toast.error(error.response?.data?.message || "Failed to start verification.");
    }
  };

  // Copy Verification Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Step 3: Complete verification
  const handleVerifyConnection = async () => {
    setVerifying(true);
    setModalStep(4);
    try {
      const res = await api.post('/advertiser/social/verify', {
        platform: modalPlatform,
        username: usernameInput,
        verificationCode
      }, {
        timeout: 120000 // 2 minutes to allow Apify scraper to finish
      });

      if (res.data && res.data.success) {
        toast.success(`${modalPlatform?.toUpperCase()} verified successfully!`);
        // Refresh local connectedAccounts
        setConnectedAccounts(prev => ({
          ...prev,
          [modalPlatform!]: {
            connected: true,
            verified: true,
            username: usernameInput.replace(/^@/, ''),
            ...res.data.user?.connectedAccounts?.[modalPlatform!]
          }
        }));
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(error.response?.data?.message || "Verification failed. Please add code to your bio and try again.");
      setModalStep(3); // return to verification instructions
    } finally {
      setVerifying(false);
    }
  };

  // Disconnect Social Account
  const handleDisconnect = async (platform: 'tiktok' | 'instagram' | 'facebook') => {
    if (!confirm(`Are you sure you want to disconnect your ${platform.toUpperCase()} account?`)) return;

    try {
      const res = await api.post(`/advertiser/social/disconnect/${platform}`);
      if (res.data && res.data.success) {
        toast.success(`${platform.toUpperCase()} account disconnected.`);
        setConnectedAccounts(prev => ({
          ...prev,
          [platform]: { connected: false, verified: false }
        }));
      }
    } catch (error: any) {
      console.error("Disconnect failed:", error);
      toast.error("Failed to disconnect platform.");
    }
  };

  // Section 1 Save (Manual update on blur or submit)
  const handleSaveBasicInfo = async () => {
    if (!firstName || !lastName) return;
    try {
      await api.put('/advertiser/profile/basic', {
        firstName,
        lastName,
        phoneNumber
      });
    } catch (error: any) {
      console.error("Save basic info failed:", error);
    }
  };

  // Final Submit
  const handleCompleteProfile = async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields and connect at least one social media account.");
      return;
    }

    setSaving(true);
    try {
      // First save basic info to be absolutely safe
      await handleSaveBasicInfo();

      // Submit content, niche and demographics
      const res = await api.put('/advertiser/profile/content', {
        niche,
        contentTypes,
        targetAudience: {
          ageRange,
          gender,
          interests
        },
        experienceLevel
      });

      if (res.data && res.data.success) {
        toast.success("Profile complete! Welcome to AACP 🎉", { duration: 4000 });
        setOnboardingStatus('approved');
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error("Profile completion failed:", error);
      toast.error(error.response?.data?.message || "Failed to complete profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="text-aacp-olive animate-spin" />
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 space-y-8">
      {/* ── Progress Navigation bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-4 md:p-6 shadow-sm sticky top-4 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-aacp-olive/10 dark:bg-aacp-olive/20 flex items-center justify-center text-aacp-olive dark:text-aacp-gold">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight">Complete Your Profile</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getStepIndicator()}</p>
          </div>
        </div>

        <div className="flex-1 max-w-md flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-aacp-olive to-teal-400 rounded-full"
              animate={{ width: `${progressPercent()}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-black text-aacp-olive dark:text-aacp-gold min-w-8 text-right">{progressPercent()}%</span>
        </div>
      </motion.div>

      {/* ── SECTION 1: Basic Information ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={SECTION_STYLE}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-aacp-olive bg-aacp-olive/10 p-2 rounded-xl"><User size={20} /></span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Section 1: Basic Information</h3>
            <p className="text-xs text-gray-400">Fill in your professional display identity.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">First Name *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={handleSaveBasicInfo}
                className={INPUT_STYLE}
              />
              {firstName.trim() !== '' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-aacp-olive"><Check size={18} /></span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Last Name *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={handleSaveBasicInfo}
                className={INPUT_STYLE}
              />
              {lastName.trim() !== '' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-aacp-olive"><Check size={18} /></span>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Phone Number (Optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={16} /></span>
              <input
                type="tel"
                placeholder="+251 912 345 678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={handleSaveBasicInfo}
                className={`${INPUT_STYLE} pl-10`}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 2: Social Connections ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={SECTION_STYLE}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-aacp-olive bg-aacp-olive/10 p-2 rounded-xl"><Link size={20} /></span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Section 2: Social Connections</h3>
            <p className="text-xs text-gray-400">Connect at least one active creator account. We'll verify ownership & auto-import stats.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* TikTok Connection Card */}
          <div className="bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[170px] relative overflow-hidden transition-all hover:border-aacp-olive/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white"><FaTiktok size={18} /></span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${connectedAccounts.tiktok.connected && connectedAccounts.tiktok.verified
                    ? "bg-aacp-olive/10 text-aacp-olive border border-aacp-olive/20"
                    : "bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                  }`}>
                  {connectedAccounts.tiktok.connected && connectedAccounts.tiktok.verified ? "Connected" : "Disconnected"}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">TikTok</h4>
              {connectedAccounts.tiktok.connected && connectedAccounts.tiktok.verified ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-aacp-olive dark:text-aacp-gold">@{connectedAccounts.tiktok.username}</p>
                  <p className="text-[10px] text-gray-400">
                    📈 {((connectedAccounts.tiktok.metrics?.followers ?? 0) / 1000).toFixed(0)}K followers • {connectedAccounts.tiktok.metrics?.engagementRate}% eng
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Import views, likes, and followers instantly.</p>
              )}
            </div>
            <div className="mt-4">
              {connectedAccounts.tiktok.connected && connectedAccounts.tiktok.verified ? (
                <button
                  disabled
                  className="w-full text-xs font-bold py-2.5 bg-aacp-olive/10 text-aacp-olive dark:text-aacp-gold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Connected
                </button>
              ) : (
                <button
                  onClick={() => handleOpenConnect('tiktok')}
                  className="w-full text-xs font-bold py-2 bg-aacp-olive text-white hover:bg-aacp-gold rounded-xl transition-all shadow-md shadow-aacp-olive/15"
                >
                  Connect Account
                </button>
              )}
            </div>
          </div>

          {/* Instagram Connection Card */}
          <div className="bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[170px] relative overflow-hidden transition-all hover:border-aacp-olive/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-linear-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white"><FaInstagram size={18} /></span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${connectedAccounts.instagram.connected && connectedAccounts.instagram.verified
                    ? "bg-aacp-olive/10 text-aacp-olive border border-aacp-olive/20"
                    : "bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                  }`}>
                  {connectedAccounts.instagram.connected && connectedAccounts.instagram.verified ? "Connected" : "Disconnected"}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">Instagram</h4>
              {connectedAccounts.instagram.connected && connectedAccounts.instagram.verified ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-pink-500">@{connectedAccounts.instagram.username}</p>
                  <p className="text-[10px] text-gray-400">
                    📈 {((connectedAccounts.instagram.metrics?.followers ?? 0) / 1000).toFixed(0)}K followers • {connectedAccounts.instagram.metrics?.engagementRate}% eng
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Import profile demographics & engagement rates.</p>
              )}
            </div>
            <div className="mt-4">
              {connectedAccounts.instagram.connected && connectedAccounts.instagram.verified ? (
                <button
                  disabled
                  className="w-full text-xs font-bold py-2.5 bg-aacp-olive/10 text-aacp-olive dark:text-aacp-gold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Connected
                </button>
              ) : (
                <button
                  onClick={() => handleOpenConnect('instagram')}
                  className="w-full text-xs font-bold py-2 bg-aacp-olive text-white hover:bg-aacp-gold rounded-xl transition-all shadow-md shadow-aacp-olive/15"
                >
                  Connect Account
                </button>
              )}
            </div>
          </div>

          {/* Facebook Connection Card */}
          <div className="bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[170px] relative overflow-hidden transition-all hover:border-aacp-olive/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><FaFacebook size={18} /></span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${connectedAccounts.facebook.connected && connectedAccounts.facebook.verified
                    ? "bg-aacp-olive/10 text-aacp-olive border border-aacp-olive/20"
                    : "bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                  }`}>
                  {connectedAccounts.facebook.connected && connectedAccounts.facebook.verified ? "Connected" : "Disconnected"}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">Facebook</h4>
              {connectedAccounts.facebook.connected && connectedAccounts.facebook.verified ? (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-blue-600">@{connectedAccounts.facebook.username}</p>
                  <p className="text-[10px] text-gray-400">
                    📈 {((connectedAccounts.facebook.metrics?.followers ?? 0) / 1000).toFixed(0)}K page likes
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Verify and sync your advertiser Page followers.</p>
              )}
            </div>
            <div className="mt-4">
              {connectedAccounts.facebook.connected && connectedAccounts.facebook.verified ? (
                <button
                  disabled
                  className="w-full text-xs font-bold py-2.5 bg-aacp-olive/10 text-aacp-olive dark:text-aacp-gold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Connected
                </button>
              ) : (
                <button
                  onClick={() => handleOpenConnect('facebook')}
                  className="w-full text-xs font-bold py-2 bg-aacp-olive text-white hover:bg-aacp-gold rounded-xl transition-all shadow-md shadow-aacp-olive/15"
                >
                  Connect Account
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 3: Content & Niche (Shown AFTER at least one connection is verified) ── */}
      <AnimatePresence mode="wait">
        {isAnySocialConnected ? (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={SECTION_STYLE}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-aacp-olive bg-aacp-olive/10 p-2 rounded-xl"><Target size={20} /></span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Section 3: Content & Niche</h3>
                <p className="text-xs text-gray-400">Customize your influencer categories and select your brand collaboration interests.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Niche Dropdown */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Primary Niche Category *</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Primary Niche</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="fashion">Fashion & Style</option>
                  <option value="tech">Technology & Gaming</option>
                  <option value="gaming">Gaming & Esports</option>
                  <option value="food">Food & Culinary</option>
                  <option value="travel">Travel & Adventure</option>
                  <option value="fitness">Fitness & Wellness</option>
                  <option value="lifestyle">Lifestyle & Blogs</option>
                  <option value="business">Business & Finance</option>
                  <option value="comedy">Comedy & Entertainment</option>
                  <option value="education">Education & Science</option>
                  <option value="music">Music & Dance</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="other">Other / General</option>
                </select>
              </div>

              {/* Content Types Checkboxes */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">Content Formats / Formats of Choice *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'tutorials', label: '🎥 Tutorials' },
                    { id: 'reviews', label: '⭐ Product Reviews' },
                    { id: 'unboxings', label: '📦 Unboxings' },
                    { id: 'vlogs', label: '🚶 Everyday Vlogs' },
                    { id: 'comedy', label: '🎭 Skits & Comedy' },
                    { id: 'educational', label: '🧠 Educational' },
                    { id: 'storytime', label: '🗣️ Storytimes' },
                    { id: 'challenges', label: '🏆 Challenges' },
                    { id: 'duets', label: '👥 Duets & Collabs' },
                    { id: 'live_streams', label: '🔴 Live Streaming' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleContentType(c.id)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${contentTypes.includes(c.id)
                          ? "bg-aacp-olive/10 text-aacp-olive border-aacp-olive dark:text-aacp-gold"
                          : "bg-gray-50 dark:bg-[#181818] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-emerald-300"
                        }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience Age, Gender & Interests */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-aacp-olive dark:text-aacp-gold uppercase tracking-widest flex items-center gap-1.5"><Globe size={14} /> Demographics of your Audience</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Age Range</label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aacp-olive transition-all"
                    >
                      <option value="">Select Age Group</option>
                      <option value="13-17">Gen Z Teens (13-17)</option>
                      <option value="18-24">Gen Z Adults (18-24)</option>
                      <option value="25-34">Young Millennials (25-34)</option>
                      <option value="35-44">Mature Millennials (35-44)</option>
                      <option value="45+">Boomers & Older (45+)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audience Gender Balance</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aacp-olive transition-all"
                    >
                      <option value="">Select Gender Balance</option>
                      <option value="all">Balanced / All Genders</option>
                      <option value="male">Mostly Male Audience</option>
                      <option value="female">Mostly Female Audience</option>
                      <option value="other">Diverse / Queer Audience</option>
                    </select>
                  </div>
                </div>

                {/* Audience Interest Tags Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Audience Key Interests (comma-separated or hit Enter)</label>
                  <form onSubmit={handleAddInterest} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. fashion, food, technology"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-aacp-olive transition-all"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs hover:opacity-95 transition-all"
                    >
                      Add
                    </button>
                  </form>
                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {interests.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-aacp-olive/10 text-aacp-olive dark:text-aacp-gold text-xs font-semibold rounded-full border border-aacp-olive/10"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(tag)}
                            className="hover:text-red-500 text-[10px] font-bold p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Level Dropdown */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-white/5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Experience Level *</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Creator Tier / Experience</option>
                  <option value="beginner">Beginner (Under 1 Year / Passionate)</option>
                  <option value="intermediate">Intermediate (1-2 Years / Rising Star)</option>
                  <option value="advanced">Advanced (3-5 Years / Professional)</option>
                  <option value="professional">Professional (5+ Years / Elite Influence)</option>
                </select>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-aacp-olive/5 border border-aacp-olive/10 rounded-3xl p-6 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            🔒 <span className="font-bold text-aacp-olive dark:text-aacp-gold">Niche & Content Customizer:</span> Please connect at least one social media account above to unlock Niche selection.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION 4: Submit Button ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center pt-6 space-y-4"
      >
        <button
          onClick={handleCompleteProfile}
          disabled={!isFormValid || saving}
          className={`w-full md:w-auto md:min-w-[280px] flex items-center justify-center gap-2 font-black py-4 px-8 rounded-2xl transition-all duration-300 text-sm tracking-wide ${isFormValid
              ? "bg-linear-to-r from-aacp-olive to-teal-500 hover:from-aacp-gold hover:to-teal-400 text-white shadow-lg shadow-aacp-olive/25 cursor-pointer scale-100 hover:scale-[1.01]"
              : "bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Completing Profile...
            </>
          ) : (
            <>
              Complete Profile
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {!isFormValid && (
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <AlertCircle size={14} /> Connect a platform and fill all required (*) fields to continue.
          </p>
        )}
      </motion.div>

      {/* ━━ STATE-OF-THE-ART SOCIAL CONNECTION MODALS ━━ */}
      <AnimatePresence>
        {modalPlatform !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!verifying) setModalPlatform(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Top Row / Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${modalPlatform === 'tiktok' ? "bg-black" :
                      modalPlatform === 'instagram' ? "bg-linear-to-tr from-yellow-500 via-pink-500 to-purple-600" :
                        "bg-blue-600"
                    }`}>
                    {modalPlatform === 'tiktok' && <FaTiktok size={18} />}
                    {modalPlatform === 'instagram' && <FaInstagram size={18} />}
                    {modalPlatform === 'facebook' && <FaFacebook size={18} />}
                  </span>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white capitalize">Connect {modalPlatform}</h4>
                    <p className="text-[10px] text-gray-400">Ownership verification protocol</p>
                  </div>
                </div>
                {!verifying && (
                  <button
                    onClick={() => setModalPlatform(null)}
                    className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* STEP 1: Enter Username */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">Enter Account Username *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                      <input
                        type="text"
                        placeholder="e.g. tiktok_star"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className={`${INPUT_STYLE} pl-8`}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                      💡 Tip: Use a mock account handle like <span className="font-semibold text-aacp-olive dark:text-aacp-gold">@tiktok_star</span>, <span className="font-semibold text-aacp-olive dark:text-aacp-gold">@instagram_star</span>, or <span className="font-semibold text-aacp-olive dark:text-aacp-gold">@facebook_star</span> to skip real Apify bio verification during development testing.
                    </p>
                  </div>
                  <button
                    onClick={handleInitiateConnection}
                    className="w-full font-bold py-3.5 bg-gray-950 dark:bg-white text-white dark:text-gray-900 rounded-2xl hover:opacity-90 transition-all text-xs tracking-wider"
                  >
                    Generate Verification Code
                  </button>
                </div>
              )}

              {/* STEP 2: Display Verification Code */}
              {modalStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-white/5 rounded-2xl p-5 text-center space-y-3 relative">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Your Unique Code</span>
                    <div className="flex items-center justify-center gap-3">
                      <code className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-widest">{verificationCode}</code>
                      <button
                        onClick={handleCopyCode}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 transition-all"
                      >
                        {copied ? <Check size={14} className="text-aacp-olive" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-red-500/80 flex items-center justify-center gap-1.5 mt-2">
                      <Clock size={12} /> Expires in 15 minutes (at {codeExpiresAt})
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-aacp-olive/10 text-aacp-olive font-bold text-xs flex items-center justify-center shrink-0">1</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                        Copy the generated 10-character code above.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-aacp-olive/10 text-aacp-olive font-bold text-xs flex items-center justify-center shrink-0">2</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                        Go to your {modalPlatform} profile settings.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-aacp-olive/10 text-aacp-olive font-bold text-xs flex items-center justify-center shrink-0">3</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                        Paste the code directly in your <span className="font-semibold text-gray-900 dark:text-white">Bio</span> (profile description). You can delete it immediately after ownership is verified.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalStep(1)}
                      className="flex-1 font-bold py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-2xl text-xs hover:bg-gray-100 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setModalStep(3)}
                      className="flex-1 font-bold py-3.5 bg-aacp-olive text-white rounded-2xl text-xs hover:bg-aacp-gold transition-all shadow-md shadow-aacp-olive/15"
                    >
                      Code is Added
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Verify Bio */}
              {modalStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-aacp-olive/10 flex items-center justify-center mx-auto text-aacp-olive mb-2">
                    <HelpCircle size={28} />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">Is the code in your bio?</h5>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mt-1">
                      Our system will run a brief scan on your public {modalPlatform} profile to locate <code className="font-bold text-gray-950 dark:text-white">{verificationCode}</code>.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalStep(2)}
                      className="flex-1 font-bold py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-2xl text-xs hover:bg-gray-100 transition-all"
                    >
                      View Code Again
                    </button>
                    <button
                      onClick={handleVerifyConnection}
                      className="flex-1 font-bold py-3.5 bg-aacp-olive text-white rounded-2xl text-xs hover:bg-aacp-gold transition-all shadow-md shadow-aacp-olive/15"
                    >
                      Verify Now
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Verification Loading Overlay */}
              {modalStep === 4 && (
                <div className="py-8 text-center space-y-6">
                  {verifying ? (
                    <>
                      <div className="relative w-20 h-20 mx-auto">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-aacp-olive/10 border-t-aacp-olive animate-spin" />
                        {/* Inner scanner line effect */}
                        <div className="absolute inset-2 rounded-full bg-aacp-olive/5 flex items-center justify-center text-aacp-olive animate-pulse">
                          <Globe size={24} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-gray-900 dark:text-white text-sm">Bio Scanning Protocol</h5>
                        <p className="text-xs text-aacp-olive dark:text-aacp-gold font-semibold">{scanMessage}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-aacp-olive/10 text-aacp-olive flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <Check size={32} />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white capitalize">{modalPlatform} Verified!</h5>
                        <p className="text-xs text-aacp-olive dark:text-aacp-gold font-semibold mt-1">
                          🎉 Stats imported for @{usernameInput.replace(/^@/, '')}
                        </p>
                      </div>
                      <button
                        onClick={() => setModalPlatform(null)}
                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl text-xs tracking-wider transition-all hover:opacity-90"
                      >
                        Finish & Close
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
