import { useLocation, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Star,
  ShieldCheck,
  Award,
  TrendingUp,
  Sparkles,
  Briefcase,
  Edit,
} from 'lucide-react';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';

export default function ViewProfilePage() {
  const { userRole, onboardingStatus } = useUser();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const isBusiness = location.pathname.includes('/business') || userRole === 'business';
  const Layout = isBusiness ? BusinessLayout : AdvertiserLayout;

  const isApproved = onboardingStatus === 'approved';

  // Build profile display data from context
  const profileData = {
    name: profile.businessName || `${profile.firstName} ${profile.lastName}`,
    type: isBusiness ? profile.industry || 'B2B Software' : 'Premium Advertiser',
    bio: profile.bio,
    established: '2019',
    rating: '4.9',
    reviews: isBusiness ? 128 : 84,
    location: 'San Francisco, CA',
    website: profile.website,
    email: profile.email,
    phone: profile.phone,
    coverImage: isBusiness
      ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop',
    avatarImage: profile.avatarUrl,
    badges: isBusiness
      ? ['Enterprise Software', 'High Match Rate', 'Verified Partner']
      : ['Top Rated', 'SaaS Expert', 'B2B Specialist'],
    stats: isBusiness
      ? [
          { label: 'Total Campaigns', value: '24' },
          { label: 'Avg ROI', value: '412%' },
          { label: 'Active Partnerships', value: '18' },
        ]
      : [
          { label: 'Campaigns Delivered', value: '156' },
          { label: 'Performance Score', value: '98/100' },
          { label: 'Avg Turnaround', value: '4 days' },
        ],
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <Layout>
      <main className="p-4 sm:p-8 max-w-[1200px] mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#111] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none"
          >
            {/* Cover Image */}
            <div className="h-48 md:h-64 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <ShieldCheck size={14} />
                  Approved Profile
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {profileData.rating} ({profileData.reviews})
                </span>
              </div>
            </div>

            <div className="p-6 md:p-10 relative">
              {/* Avatar */}
              <div className="absolute -top-16 md:-top-20 left-6 md:left-10 w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-white dark:border-[#111] overflow-hidden bg-white z-20 shadow-xl">
                <img
                  src={profileData.avatarImage}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-14 md:mt-16 sm:mt-0 sm:ml-40 md:ml-48 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                    {profileData.name}
                  </h1>
                  <p className="text-emerald-500 font-semibold mb-4 text-sm md:text-base flex items-center gap-2">
                    {isBusiness ? <Building2 size={16} /> : <Briefcase size={16} />}
                    {profileData.type}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-xl text-xs font-medium border border-gray-200 dark:border-white/10"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button
                    onClick={() =>
                      navigate(isBusiness ? '/profile/complete/business' : '/profile/complete/advertiser')
                    }
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-2.5 rounded-xl mb-1 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                    <MapPin size={18} className="text-emerald-500" />
                    {profileData.location}
                  </div>
                  <a
                    href={`http://${profileData.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5"
                  >
                    <Globe size={18} className="text-cyan-500" />
                    {profileData.website}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Award className="text-emerald-500" />
                  About
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {profileData.bio}
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profileData.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-500/5 dark:to-transparent border border-emerald-500/20 dark:border-emerald-500/10 p-6 rounded-3xl text-center hover:-translate-y-1 transition-transform cursor-default"
                  >
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>

                <div className="space-y-4">
                  <a
                    href={`mailto:${profileData.email}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {profileData.email}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`tel:${profileData.phone}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{profileData.phone}</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Pro Tip Box */}
              <div className="bg-emerald-500 p-8 rounded-[2.5rem] relative overflow-hidden text-black shadow-lg shadow-emerald-500/20 dark:shadow-none">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-black/10 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-black/80">Pro Tip</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Enhance Your Profile</h3>
                  <p className="text-sm font-medium text-black/70 mb-6">
                    Connect your {isBusiness ? 'Google Analytics' : 'Stripe'} account to unlock deeper insights and
                    more specific AI matching.
                  </p>
                  <button className="w-full bg-black text-white rounded-xl py-3 text-sm font-bold hover:bg-black/80 transition-colors shadow-xl">
                    Connect Now
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}
