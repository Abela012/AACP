import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Loader2,
  BarChart3,
  Users,
  Globe,
  Target,
  DollarSign,
} from 'lucide-react';
import { FaTiktok, FaInstagram } from 'react-icons/fa6';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import type { AxiosInstance } from 'axios';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import { userApi } from '@/src/api/userApi';
import { toast } from 'react-hot-toast';
import {
  createInitialAdvertiserForm,
  type AdvertiserRegistrationForm,
  type PlatformAnalyticsInput,
  type PlatformKey,
} from '@/src/types/advertiserProfile';
import { buildAdvertiserSubmitPayload, computeEngagementRate } from '@/src/lib/advertiserProfilePayload';
import { WizardField, WizardSelect, WizardTagGroup, WizardSection } from './wizard-ui';

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: Users },
  { id: 'analytics', title: 'Social Media Analytics', icon: BarChart3 },
  { id: 'audience', title: 'Audience Demographics', icon: Globe },
  { id: 'content', title: 'Content & Niche', icon: Target },
  { id: 'pricing', title: 'Campaign Pricing & Collaboration', icon: DollarSign },
] as const;

const NICHE_OPTIONS = [
  'Comedy', 'Dance', 'Education', 'Fashion', 'Beauty', 'Food', 'Fitness', 'Tech',
  'Gaming', 'Travel', 'Lifestyle', 'Music', 'DIY', 'Finance', 'Pets',
];
const STYLE_OPTIONS = ['Educational', 'Entertainment', 'Tutorial', 'Vlog', 'Review', 'Behind the scenes', 'UGC'];
const COLLAB_TYPES = ['Sponsored Post', 'Brand Ambassador', 'Product Review', 'Affiliate', 'UGC', 'Event Appearance'];
const INTEREST_OPTIONS = ['Fashion', 'Tech', 'Beauty', 'Fitness', 'Food', 'Travel', 'Gaming', 'Finance', 'Parenting'];

type Props = {
  api: AxiosInstance;
  tradeLicenseUrl: string;
  onSubmitted: () => void;
};

function hydratePlatform(raw: Record<string, unknown> | undefined): PlatformAnalyticsInput {
  const base = createInitialAdvertiserForm().tiktok;
  if (!raw) return { ...base, enabled: false };
  const niche = raw.niche;
  const contentStyle = raw.contentStyle;
  return {
    ...base,
    enabled: true,
    username: String(raw.username ?? ''),
    profileLink: String(raw.profileLink ?? ''),
    accountType: String(raw.accountType ?? 'Creator'),
    location: String(raw.location ?? ''),
    followers: raw.followers != null ? String(raw.followers) : '',
    avgViews: raw.avgViews != null ? String(raw.avgViews) : '',
    totalLikes: raw.totalLikes != null ? String(raw.totalLikes) : '',
    avgComments: raw.avgComments != null ? String(raw.avgComments) : '',
    avgShares: raw.avgShares != null ? String(raw.avgShares) : '',
    postingFrequency: String(raw.postingFrequency ?? '3-5 per week'),
    postingConsistency: String(raw.postingConsistency ?? 'Consistent'),
    contentFrequency: String(raw.contentFrequency ?? 'Weekly'),
    audienceTopCountry: String(raw.audienceTopCountry ?? ''),
    audienceTopCity: String(raw.audienceTopCity ?? ''),
    audienceGender: String(raw.audienceGender ?? 'Mixed'),
    audienceAgeRange: String(raw.audienceAgeRange ?? '18-24'),
    audienceInterests: Array.isArray(raw.audienceInterests) ? (raw.audienceInterests as string[]) : [],
    audienceIncomeLevel: String(raw.audienceIncomeLevel ?? 'Middle'),
    primaryAudienceLanguage: String(raw.primaryAudienceLanguage ?? 'English'),
    niche: Array.isArray(niche) ? niche : [],
    contentStyle: Array.isArray(contentStyle) ? contentStyle : [],
  };
}

export default function AdvertiserOnboardingWizard({ api, tradeLicenseUrl, onSubmitted }: Props) {
  const navigate = useNavigate();
  const { setOnboardingStatus } = useUser();
  const { profile, updateProfile } = useProfile();
  const { user: clerkUser } = useClerkUser();
  const [form, setForm] = useState<AdvertiserRegistrationForm>(() => createInitialAdvertiserForm());
  const [step, setStep] = useState(0);
  const [activePlatform, setActivePlatform] = useState<PlatformKey>('tiktok');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const p = profile as Record<string, unknown>;
    setForm((f) => {
      const next = { ...f };
      next.firstName = (p.firstName as string) || clerkUser?.firstName || f.firstName;
      next.lastName = (p.lastName as string) || clerkUser?.lastName || f.lastName;
      next.profilePicture = (p.profilePicture as string) || (p.avatarUrl as string) || f.profilePicture;
      next.bio = (p.bio as string) || f.bio;
      next.location = (p.location as string) || f.location;
      if (p.tiktok) next.tiktok = hydratePlatform(p.tiktok as Record<string, unknown>);
      if (p.instagram) next.instagram = hydratePlatform(p.instagram as Record<string, unknown>);
      const pd = p.profileData as Record<string, unknown> | undefined;
      if (pd) {
        if (pd.phone) next.phone = String(pd.phone);
        if (pd.portfolioUrl) next.portfolioUrl = String(pd.portfolioUrl);
        if (pd.campaignPrice) next.campaignPrice = String(pd.campaignPrice);
        if (Array.isArray(pd.preferredCollaborationType)) next.preferredCollaborationType = pd.preferredCollaborationType as string[];
      }
      return next;
    });
  }, [profile, clerkUser]);

  const patch = useCallback(<K extends keyof AdvertiserRegistrationForm>(key: K, value: AdvertiserRegistrationForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const patchPlatform = useCallback((key: PlatformKey, partial: Partial<PlatformAnalyticsInput>) => {
    setForm((f) => ({ ...f, [key]: { ...f[key], ...partial } }));
  }, []);

  const togglePlatform = (id: PlatformKey) => {
    const enabled = !form[id].enabled;
    setForm((f) => {
      const platforms = enabled
        ? [...new Set([...f.availablePlatforms, id === 'tiktok' ? 'TikTok' : 'Instagram'])]
        : f.availablePlatforms.filter((p) => p !== (id === 'tiktok' ? 'TikTok' : 'Instagram'));
      return { ...f, availablePlatforms: platforms, [id]: { ...f[id], enabled } };
    });
    setActivePlatform(id);
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const p = form[activePlatform];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildAdvertiserSubmitPayload(form);
      await userApi.submitProfile(api, { ...payload, tradeLicenseUrl });
      updateProfile({
        firstName: payload.firstName,
        lastName: payload.lastName,
        avatarUrl: payload.profilePicture,
        socialProfiles: payload.socialProfiles,
        ...payload.profileData,
      });
      setOnboardingStatus('pending');
      toast.success('Profile submitted for review');
      onSubmitted();
      navigate('/dashboard/advertiser', { replace: true });
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } };
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        toast.error('Request timed out. Check that the backend is running and connected to MongoDB.');
      } else if (err.response?.status === 503) {
        toast.error(err.response.data?.message ?? 'Database unavailable');
      } else {
        toast.error(err.response?.data?.message ?? 'Failed to submit profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div className="space-y-3" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
          <span>Creator onboarding</span>
          <span>{progress}%</span>
        </motion.div>
        <motion.div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
        </motion.div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all',
                  i === step ? 'bg-emerald-500 text-white' : i < step ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                )}
              >
                <Icon size={12} />
                {s.title}
              </button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/6 p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-white/6">
            {(() => {
              const Icon = STEPS[step].icon;
              return (
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Icon size={22} />
                </div>
              );
            })()}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{STEPS[step].title}</h2>
            </motion.div>
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <motion.div className="relative group" whileHover={{ scale: 1.02 }}>
                  <motion.div className="w-28 h-28 rounded-full border-4 border-emerald-500/20 overflow-hidden shadow-xl">
                    <img
                      src={form.profilePicture || `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=10b981&color=fff`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer">
                    <Camera size={22} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append('image', file);
                          const res = await api.post('/users/profile/picture?type=avatar', fd, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });
                          patch('profilePicture', res.data.user.profilePicture);
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                  </label>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="animate-spin text-white" size={28} />
                    </div>
                  )}
                </motion.div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <WizardField label="First name" value={form.firstName} onChange={(v) => patch('firstName', v)} />
                <WizardField label="Last name" value={form.lastName} onChange={(v) => patch('lastName', v)} />
                <WizardField label="Location" value={form.location} onChange={(v) => patch('location', v)} placeholder="City, Country" />
                <WizardField label="Phone" value={form.phone} onChange={(v) => patch('phone', v)} />
                <WizardField label="Portfolio URL" value={form.portfolioUrl} onChange={(v) => patch('portfolioUrl', v)} placeholder="https://..." />
              </div>
              <WizardField label="Bio" value={form.bio} onChange={(v) => patch('bio', v)} placeholder="Tell brands who you are..." />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <WizardSection title="Platforms" subtitle="Select where you create content">
                <motion.div className="grid sm:grid-cols-2 gap-4">
                  {([
                    { id: 'tiktok' as const, label: 'TikTok', icon: FaTiktok },
                    { id: 'instagram' as const, label: 'Instagram', icon: FaInstagram },
                  ]).map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => togglePlatform(id)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-6 rounded-2xl border-2 text-left',
                        form[id].enabled ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' : 'border-gray-100 dark:border-white/10'
                      )}
                    >
                      <Icon size={28} className={id === 'instagram' ? 'text-pink-500' : ''} />
                      <p className="font-black mt-3">{label}</p>
                    </motion.button>
                  ))}
                </motion.div>
              </WizardSection>
              {(form.tiktok.enabled || form.instagram.enabled) && (
                <WizardSection title="Platform metrics">
                  <motion.div className="flex gap-2 mb-4">
                    {form.tiktok.enabled && (
                      <button type="button" onClick={() => setActivePlatform('tiktok')} className={cn('px-4 py-2 rounded-xl text-xs font-bold', activePlatform === 'tiktok' ? 'bg-gray-900 text-white' : 'bg-gray-100')}>TikTok</button>
                    )}
                    {form.instagram.enabled && (
                      <button type="button" onClick={() => setActivePlatform('instagram')} className={cn('px-4 py-2 rounded-xl text-xs font-bold', activePlatform === 'instagram' ? 'bg-pink-500 text-white' : 'bg-gray-100')}>Instagram</button>
                    )}
                  </motion.div>
                  <motion.div className="grid sm:grid-cols-2 gap-4" layout>
                    <WizardField label="Username" value={p.username} onChange={(v) => patchPlatform(activePlatform, { username: v })} placeholder="@handle" />
                    <WizardField label="Profile link" value={p.profileLink} onChange={(v) => patchPlatform(activePlatform, { profileLink: v })} />
                    <WizardSelect label="Account type" value={p.accountType} onChange={(v) => patchPlatform(activePlatform, { accountType: v })} options={['Creator', 'Business', 'Personal']} />
                    <WizardSelect label="Posting frequency" value={p.postingFrequency} onChange={(v) => patchPlatform(activePlatform, { postingFrequency: v })} options={['Daily', '3-5 per week', '1-2 per week', 'Bi-weekly', 'Monthly']} />
                    <WizardField label="Followers" value={p.followers} onChange={(v) => patchPlatform(activePlatform, { followers: v.replace(/\D/g, '') })} />
                    <WizardField label="Avg. views" value={p.avgViews} onChange={(v) => patchPlatform(activePlatform, { avgViews: v.replace(/\D/g, '') })} />
                    <WizardField label="Avg. likes" value={p.totalLikes} onChange={(v) => patchPlatform(activePlatform, { totalLikes: v.replace(/\D/g, '') })} />
                    <WizardField label="Avg. comments" value={p.avgComments} onChange={(v) => patchPlatform(activePlatform, { avgComments: v.replace(/\D/g, '') })} />
                    <WizardField label="Avg. shares" value={p.avgShares} onChange={(v) => patchPlatform(activePlatform, { avgShares: v.replace(/\D/g, '') })} />
                  </motion.div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Computed engagement</p>
                    <p className="text-2xl font-black text-emerald-600">{computeEngagementRate(p).toFixed(2)}%</p>
                  </div>
                </WizardSection>
              )}
            </div>
          )}

          {step === 2 && (form.tiktok.enabled || form.instagram.enabled) && (
            <div className="space-y-6">
              <div className="flex gap-2">
                {form.tiktok.enabled && <button type="button" onClick={() => setActivePlatform('tiktok')} className={cn('px-4 py-2 rounded-xl text-xs font-bold', activePlatform === 'tiktok' ? 'bg-gray-900 text-white' : 'bg-gray-100')}>TikTok</button>}
                {form.instagram.enabled && <button type="button" onClick={() => setActivePlatform('instagram')} className={cn('px-4 py-2 rounded-xl text-xs font-bold', activePlatform === 'instagram' ? 'bg-pink-500 text-white' : 'bg-gray-100')}>Instagram</button>}
              </div>
              <motion.div className="grid sm:grid-cols-2 gap-4" layout>
                <WizardField label="Top country" value={p.audienceTopCountry} onChange={(v) => patchPlatform(activePlatform, { audienceTopCountry: v })} />
                <WizardField label="Top city" value={p.audienceTopCity} onChange={(v) => patchPlatform(activePlatform, { audienceTopCity: v })} />
                <WizardSelect label="Gender" value={p.audienceGender} onChange={(v) => patchPlatform(activePlatform, { audienceGender: v })} options={['Mixed', 'Mostly Male', 'Mostly Female']} />
                <WizardSelect label="Age range" value={p.audienceAgeRange} onChange={(v) => patchPlatform(activePlatform, { audienceAgeRange: v })} options={['13-17', '18-24', '25-34', '35-44', '45+']} />
                <WizardSelect label="Income level" value={p.audienceIncomeLevel} onChange={(v) => patchPlatform(activePlatform, { audienceIncomeLevel: v })} options={['Low', 'Middle', 'High', 'Mixed']} />
                <WizardField label="Primary language" value={p.primaryAudienceLanguage} onChange={(v) => patchPlatform(activePlatform, { primaryAudienceLanguage: v })} />
              </motion.div>
              <WizardTagGroup label="Audience interests" options={INTEREST_OPTIONS} selected={p.audienceInterests} onChange={(tags) => patchPlatform(activePlatform, { audienceInterests: tags })} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {(form.tiktok.enabled || form.instagram.enabled) && (
                <motion.div className="flex gap-2">
                  {form.tiktok.enabled && <button type="button" onClick={() => setActivePlatform('tiktok')} className={cn('px-4 py-2 rounded-xl text-xs font-bold', activePlatform === 'tiktok' ? 'bg-gray-900 text-white' : 'bg-gray-100')}>TikTok</button>}
                  {form.instagram.enabled && <button type="button" onClick={() => setActivePlatform('instagram')} className={cn('px-4 py-2 rounded-xl text-xs font-bold', activePlatform === 'instagram' ? 'bg-pink-500 text-white' : 'bg-gray-100')}>Instagram</button>}
                </motion.div>
              )}
              <WizardTagGroup label="Niche" options={NICHE_OPTIONS} selected={form.tiktok.enabled || form.instagram.enabled ? p.niche : []} onChange={(tags) => patchPlatform(activePlatform, { niche: tags })} />
              <WizardTagGroup label="Content style" options={STYLE_OPTIONS} selected={form.tiktok.enabled || form.instagram.enabled ? p.contentStyle : []} onChange={(tags) => patchPlatform(activePlatform, { contentStyle: tags })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <WizardSelect label="Posting consistency" value={p.postingConsistency} onChange={(v) => patchPlatform(activePlatform, { postingConsistency: v })} options={['Very consistent', 'Consistent', 'Irregular']} />
                <WizardSelect label="Content frequency" value={p.contentFrequency} onChange={(v) => patchPlatform(activePlatform, { contentFrequency: v })} options={['Daily', 'Weekly', 'Bi-weekly', 'Monthly']} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <WizardField label="Campaign price (per post)" value={form.campaignPrice} onChange={(v) => patch('campaignPrice', v.replace(/\D/g, ''))} />
                <WizardSelect label="Currency" value={form.currency} onChange={(v) => patch('currency', v)} options={['ETB', 'USD', 'EUR']} />
              </div>
              <WizardTagGroup label="Preferred collaboration types" options={COLLAB_TYPES} selected={form.preferredCollaborationType} onChange={(tags) => patch('preferredCollaborationType', tags)} />
              <WizardField label="Previous brand collaborations" value={form.previousBrandCollaborations} onChange={(v) => patch('previousBrandCollaborations', v)} placeholder="Brands you've worked with..." />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <motion.div className="flex justify-between gap-4 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-600 disabled:opacity-40">
          <ArrowLeft size={18} /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            Continue <ArrowRight size={18} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-emerald-500 text-white disabled:opacity-60">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
            Submit for review
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
