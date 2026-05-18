import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Megaphone, 
  DollarSign, 
  Users, 
  Target, 
  CheckCircle2, 
  X,
  Loader2,
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useCreateOpportunity } from '@/src/hooks/useOpportunities';
import { useProfile } from '@/src/shared/context/ProfileContext';

const CATEGORIES = [
  'Technology', 'Fashion', 'Beauty', 'Gaming', 
  'Fitness', 'Food', 'Travel', 'Education', 'Lifestyle', 'Other'
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube'];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { mutateAsync: createOpportunity, isPending } = useCreateOpportunity();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [deadline, setDeadline] = useState('');
  const [paymentType, setPaymentType] = useState<'Fixed-price' | 'Hourly'>('Fixed-price');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Expert');
  const [locationReq, setLocationReq] = useState('Global');
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.industry && CATEGORIES.includes(profile.industry)) {
        setCategory(profile.industry);
      } else if (profile.industry) {
        setCategory('Other');
        setCustomCategory(profile.industry);
      }
      
      if (profile.monthlyBudget) {
        setBudgetAmount(profile.monthlyBudget.toString());
      }
    }
  }, [profile]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const addDeliverable = () => {
    if (newDeliverable.trim() && !deliverables.includes(newDeliverable.trim())) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (item: string) => {
    setDeliverables(deliverables.filter(d => d !== item));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !budgetAmount) {
      setError('Please fill in all required fields.');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please specify your category.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    try {
      await createOpportunity({
        title,
        description,
        category: category === 'Other' ? customCategory.trim() : category,
        platforms: selectedPlatforms,
        deliverables,
        paymentType,
        experienceLevel,
        budget: {
          amount: Number(budgetAmount),
          currency: 'ETB'
        },
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        requirements: {
          minFollowers: Number(minFollowers) || 0,
          preferredNiches: [category === 'Other' ? customCategory.trim() : category],
          location: locationReq
        },
        status: 'open',
        maxApplicants: 10
      });

      navigate('/campaigns');
    } catch (err: any) {
      const respData = err.response?.data;
      if (respData?.data && Array.isArray(respData.data)) {
        // Backend returns validation errors in data array
        setError(respData.data.map((e: any) => e.message).join(' | '));
      } else {
        setError(respData?.message || err.message || 'Failed to create campaign');
      }
    }
  };

  return (
    <BusinessLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Campaigns
        </button>

        <div className="mb-10">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create New Campaign</h1>
          <p className="text-gray-500 dark:text-gray-400">Post an opportunity and find the perfect creators for your brand.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Basic Details */}
          <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText size={20} className="text-emerald-500" />
              Basic Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Campaign Title *</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Skincare Launch Video"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need, your brand values, and campaign goals... (Minimum 20 characters)"
                  rows={5}
                  minLength={20}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all mb-4"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {category === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <input 
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Type your category..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                        required
                      />
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Budget (Birr) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ETB</span>
                    <input 
                      type="number"
                      min="1"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="e.g. 30000"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Due Date *</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Payment Type *</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'Fixed-price' | 'Hourly')}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Fixed-price">Fixed-price</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Experience Level *</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Expert')}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Requirements & Platforms */}
          <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target size={20} className="text-emerald-500" />
              Requirements & Reach
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Target Platforms *</label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        selectedPlatforms.includes(platform)
                          ? "bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-emerald-500/50"
                      )}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Minimum Followers</label>
                <div className="relative max-w-xs">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="number"
                    min="0"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Location Requirement</label>
                <input 
                  type="text"
                  value={locationReq}
                  onChange={(e) => setLocationReq(e.target.value)}
                  placeholder="e.g. Global, US Only, UK Only"
                  className="w-full max-w-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Deliverables</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                    placeholder="e.g. 1x 60s TikTok Video"
                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                </div>
                {deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {deliverables.map(d => (
                      <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        {d}
                        <button type="button" onClick={() => removeDeliverable(d)} className="ml-1 text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "px-10 py-4 rounded-2xl font-bold text-white transition-all shadow-xl",
                isPending 
                  ? "bg-emerald-400 cursor-not-allowed" 
                  : "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              )}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Publishing...
                </span>
              ) : (
                'Publish Campaign'
              )}
            </button>
          </div>
        </form>
      </main>
    </BusinessLayout>
  );
}
