import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  ArrowLeft,
  BookmarkPlus,
  UploadCloud,
  CheckCircle2,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { cn } from '@/src/shared/utils/cn';
import { useOpportunity } from '@/src/hooks/useOpportunities';
import { useApply } from '@/src/hooks/useApplications';
import { useWalletBalance } from '@/src/hooks/useWallet';

export default function AdvertiserApplyMatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const { data: oppData, isLoading: isLoadingOpp } = useOpportunity(id || '');
  const activeJobData = oppData?.opportunity || location.state?.job || {};

  const { data: walletData } = useWalletBalance();
  const applyMutation = useApply();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user: clerkUser } = useClerkUser();
  const [resume, setResume] = useState<{ name: string; size: string } | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }
  };

  const handleRemoveResume = () => {
    setResume(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  // Form State
  const [formData, setFormData] = useState({
    firstName: clerkUser?.firstName || '',
    lastName: clerkUser?.lastName || '',
    email: clerkUser?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    city: '',
    country: '',
    linkedin: '',
    portfolio: '',
    currentTitle: '',
    currentCompany: '',
    experienceYears: '1-3',
    educationLevel: '',
    fieldOfStudy: '',
    skills: [] as string[],
    tools: [] as string[],
    proficiency: 'Intermediate',
    coverLetter: '',
    hasReactExperience: 'No',
    expectedSalary: '',
    relocate: 'No',
    availability: 'Immediate',
    jobType: 'Contract',
    workPreference: 'Remote',
    agreedToTerms: false,
    allowContact: true,
  });

  useEffect(() => {
    if (clerkUser) {
      setFormData(prev => ({
        ...prev,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
      }));
    }
  }, [clerkUser]);

  const [skillsInput, setSkillsInput] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillsInput.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skillsInput.trim()] }));
      }
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const APPLICATION_FEE = 50;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    // Use availableBalance to match backend logic (total - locked)
    const availableCoins = walletData?.availableBalance ?? walletData?.balance ?? 0;
    if (availableCoins < APPLICATION_FEE) {
      setShowInsufficientBalance(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await applyMutation.mutateAsync({
        opportunity: id || '',
        coverLetter: formData.coverLetter
      });
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Failed to apply:', error);
      let msg = error?.response?.data?.message || error?.message || 'Failed to submit application. Please try again.';
      
      // If there are detailed validation errors, display the first one to be clear
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
        msg = error.response.data.errors[0].message;
      }
      
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  if (isSuccess) {
    return (
      <AdvertiserLayout>
        <main className="min-h-[80vh] flex items-center justify-center p-4 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111] p-10 md:p-16 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl max-w-xl w-full text-center relative"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: -40, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-6 right-8 md:-top-8 md:-right-8 bg-amber-500 text-black font-bold px-6 py-3 rounded-2xl text-lg flex items-center gap-2 shadow-lg shadow-amber-500/30 rotate-12 z-10"
            >
              -50 Coins
            </motion.div>
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75"></div>
              <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed text-sm md:text-base">
              Your application for <strong>{activeJobData.campaign || activeJobData.title}</strong> at {activeJobData.brand || activeJobData.company} has been sent successfully. We'll contact you via email regarding the next steps.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/advertiser/matches')}
                className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                View Other Jobs
              </button>
              <button 
                onClick={() => navigate('/dashboard/advertiser')}
                className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </main>
      </AdvertiserLayout>
    );
  }

  return (
    <AdvertiserLayout>
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 pb-32">
        {/* Insufficient Balance Modal */}
        <AnimatePresence>
          {showInsufficientBalance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowInsufficientBalance(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#111] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 z-10 p-10 text-center"
              >
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-amber-500 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Insufficient Coins</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                  You need at least <strong>50 coins</strong> to apply for this opportunity.
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-bold mb-8">
                  Your current balance: <strong>{walletData?.availableBalance ?? walletData?.balance ?? 0} coins</strong>
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/advertiser/buy-coins')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                  >
                    Buy Coins Now
                  </button>
                  <button 
                    onClick={() => setShowInsufficientBalance(false)}
                    className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-4 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Step 1: Job Summary (Always visible at top) */}
        <div className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-emerald-500 transition-colors mb-4">
                <ArrowLeft size={16} /> Back to listings
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">{activeJobData.campaign || activeJobData.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Building2 size={16} /> {activeJobData.brand || activeJobData.company || activeJobData?.businessOwner?.companyName || 'Global Brand'}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} /> {activeJobData.location || 'Remote'}</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500"><DollarSign size={16} /> {(typeof activeJobData.budget === 'object' ? activeJobData.budget.amount : (activeJobData.budget || 0)).toLocaleString()}</span>
              </div>
            </div>
            <button className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-colors">
              <BookmarkPlus size={20} />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {activeJobData.description || 'No detailed description provided for this opportunity. Apply directly to connect with the brand.'}
          </p>
        </div>

        {/* Form Wizard Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", step <= currentStep ? "bg-emerald-500" : "bg-transparent")}
                style={{ width: step === currentStep ? "50%" : step < currentStep ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 relative">
                
                {/* Step 2: Personal Information */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Briefcase size={16} /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">First Name *</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Name *</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location (City, Country)</label>
                      <div className="flex gap-2">
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-1/2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white" />
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" className="w-1/2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">LinkedIn Profile</label>
                      <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </section>

                {/* Step 3: Resume / CV */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><FileText size={16} /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resume / CV</h2>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={resumeInputRef}
                    onChange={handleResumeUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />

                  {!resume ? (
                    <div 
                      onClick={() => resumeInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-500/30 rounded-3xl p-8 text-center bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group"
                    >
                      <UploadCloud size={40} className="mx-auto text-emerald-500 mb-4 group-hover:-translate-y-1 transition-transform" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/50 rounded-2xl border border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <FileText className="text-emerald-500" size={20} />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{resume.name}</p>
                          <p className="text-xs text-emerald-500">{resume.size} • Uploaded successfully</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveResume}
                        className="text-xs font-bold text-gray-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </section>

              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                
                {/* Step 4: Professional Details & Step 5: Skills */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><GraduationCap size={16} /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional & Skills</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Title</label>
                      <input type="text" name="currentTitle" value={formData.currentTitle} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Company</label>
                      <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Years of Experience</label>
                      <select name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white">
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5+">5+ years</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Education Level</label>
                      <input type="text" name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skills & Tools</label>
                      <input 
                        type="text" 
                        placeholder="Type a skill and press Enter" 
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white" 
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.skills.map(skill => (
                          <span key={skill} className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 border border-gray-200 dark:border-white/5">
                            {skill}
                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Proficiency</label>
                      <div className="flex gap-4">
                        {['Beginner', 'Intermediate', 'Expert'].map(level => (
                          <label key={level} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="proficiency" value={level} checked={formData.proficiency === level} onChange={handleInputChange} className="accent-emerald-500 w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 6: Cover Letter & Step 7: Screening */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex justify-between">Cover Letter<span>{formData.coverLetter.length} / 500 words</span></label>
                      <textarea 
                        name="coverLetter" 
                        rows={5} 
                        value={formData.coverLetter} 
                        onChange={handleInputChange} 
                        placeholder="Briefly explain why you're a good fit..." 
                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none resize-none text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-6">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" /> Screening Questions</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Do you have experience with React?</label>
                          <div className="flex gap-4">
                            {['Yes', 'No'].map(val => (
                              <label key={val} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="hasReactExperience" value={val} checked={formData.hasReactExperience === val} onChange={handleInputChange} className="accent-emerald-500 w-4 h-4" />
                                <span className="text-sm">{val}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected salary (USD)?</label>
                          <input type="text" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Are you willing to relocate?</label>
                          <select name="relocate" value={formData.relocate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none text-gray-900 dark:text-white">
                            <option>Yes</option><option>No</option><option>Maybe</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 8: Preferences */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                   <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Availability & Preferences</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Availability</label>
                        <select name="availability" value={formData.availability} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white">
                          <option>Immediate</option><option>2 weeks</option><option>1 month</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Job Type</label>
                        <select name="jobType" value={formData.jobType} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white">
                          <option>Full-time</option><option>Part-time</option><option>Contract</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Work Preference</label>
                        <select name="workPreference" value={formData.workPreference} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white">
                          <option>Remote</option><option>Hybrid</option><option>On-site</option>
                        </select>
                      </div>

                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                
                {/* Step 10: Review Section */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Sparkles size={16} /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Application</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex justify-between items-start border border-gray-100 dark:border-white/5">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Personal Information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.firstName} {formData.lastName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.email} • {formData.phone}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.city}, {formData.country}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-bold text-emerald-500 hover:text-emerald-400">Edit</button>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex justify-between items-start border border-gray-100 dark:border-white/5">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Professional Profile</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.currentTitle} at {formData.currentCompany}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.experienceYears} years experience</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"><span className="font-medium text-gray-900 dark:text-white">Skills:</span> {formData.skills.join(', ')}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-bold text-emerald-500 hover:text-emerald-400">Edit</button>
                    </div>
                  </div>
                </section>

                {/* Step 11: Consent */}
                <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-start pt-1">
                        <input required type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleInputChange} className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">I agree to the Terms and Privacy Policy *</p>
                        <p className="text-xs text-gray-500">You acknowledge that your data will be shared with the employer.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-start pt-1">
                        <input type="checkbox" name="allowContact" checked={formData.allowContact} onChange={handleInputChange} className="peer sr-only" />
                         <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Allow company to contact me</p>
                        <p className="text-xs text-gray-500">Stay updated on future opportunities.</p>
                      </div>
                    </label>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Navigation Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 z-40 transform lg:pl-64 transition-all">
            {/* Error Banner */}
            {submitError && (
              <div className="max-w-4xl mx-auto mb-3 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                {submitError}
              </div>
            )}
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
              ) : <div></div>}

              <button 
                type="submit"
                disabled={isSubmitting || (currentStep === 3 && !formData.agreedToTerms)}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all",
                  isSubmitting || (currentStep === 3 && !formData.agreedToTerms)
                    ? "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20"
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : currentStep === 3 ? (
                  <>Submit Application <ShieldCheck size={18} /></>
                ) : (
                  <>Continue <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </AdvertiserLayout>
  );
}
