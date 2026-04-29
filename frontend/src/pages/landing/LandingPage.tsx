import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  BarChart3,
  Megaphone,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Search,
  CheckCircle2,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';

/* ─── Animation Variants ─── */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#001e00] font-sans selection:bg-[#14a800]/20 selection:text-[#001e00]">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 w-full z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-[#14a800] flex items-center justify-center text-white">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#14a800]">AACP</span>
              </Link>

              <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#001e00]">
                <a href="#" className="hover:text-[#14a800] transition-colors">Find Advertisers</a>
                <a href="#" className="hover:text-[#14a800] transition-colors">Find Business</a>
                <a href="#" className="hover:text-[#14a800] transition-colors">Why AACP</a>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#14a800]" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] transition-all w-64 bg-gray-50"
                />
              </div>

              <SignedOut>
                <Link to="/auth/login" className="text-sm font-bold text-[#001e00] hover:text-[#14a800] px-4">Log in</Link>
                <Link
                  to="/auth/register"
                  className="px-6 py-2 rounded-full bg-[#14a800] text-sm font-bold text-white hover:bg-[#108a00] transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs font-bold leading-none mb-1">{user?.firstName}</span>
                    <span className="text-[10px] text-gray-400 leading-none">Logged in</span>
                  </div>
                  <Link to="/dashboard">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#14a800] font-bold text-xs ring-1 ring-gray-200">
                        {user?.firstName?.[0]}
                      </div>
                    )}
                  </Link>
                </div>
              </SignedIn>
            </div>

            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative bg-white pt-10 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 text-center lg:text-left"
          >
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#001e00] mb-6">
              How work <br className="hidden lg:block" /> should work
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-[#5e6d55] max-w-lg mb-8 mx-auto lg:mx-0">
              Forget the old rules. You can have the best advertisers and businesses working together in an authentic marketplace.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <SignedOut>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#14a800] text-lg font-bold text-white hover:bg-[#108a00] transition-all shadow-md active:scale-95"
                >
                  Get started
                </button>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#14a800] text-lg font-bold text-white hover:bg-[#108a00] transition-all shadow-md active:scale-95"
                >
                  Enter Dashboard
                </button>
              </SignedIn>
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-[#14a800] text-lg font-bold text-[#14a800] hover:bg-gray-50 transition-all active:scale-95">
                Learn more
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-40 grayscale text-sm">
              <span className="font-bold">TrustSignals</span>
              <span className="font-bold">GrowthLabs</span>
              <span className="font-bold">AdReach</span>
              <span className="font-bold">Verifi</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10 transition-transform hover:scale-[1.01] duration-500">
              <img
                src="/assets/hero-workspace.png"
                alt="Professional Collaborative Workspace"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Floating Card Design */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden sm:block border border-gray-50">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#14a800]/10 flex items-center justify-center text-[#14a800]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#001e00]">Campaign Verified</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">AACP Authenticated</p>
                </div>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#14a800]"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Browse Talent Section ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-10">Browse role by category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Influencer Marketing', rating: '4.8/5', skills: '1.2k advertisers', icon: Users },
              { title: 'Social Media Management', rating: '4.9/5', skills: '850 agencies', icon: Megaphone },
              { title: 'Performance Ads', rating: '4.7/5', skills: '540 experts', icon: TrendingUp },
              { title: 'Conversion Tracking', rating: '4.9/5', skills: '320 partners', icon: BarChart3 }
            ].map((cat, i) => (
              <div key={i} className="p-6 rounded-xl bg-[#f7faf7] border border-transparent hover:border-gray-200 hover:bg-white transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-6 shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-6 h-6 text-[#14a800]" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#14a800] transition-colors">{cat.title}</h3>
                <div className="flex items-center justify-between text-sm text-[#5e6d55]">
                  <span className="flex items-center gap-1 font-medium"><Zap className="w-3.5 h-3.5 fill-current text-[#14a800]" /> {cat.rating}</span>
                  <span>{cat.skills}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why AACP Section (Dark) ─── */}
      <section className="bg-[#001e00] rounded-[40px] mx-4 sm:mx-8 my-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#14a800] opacity-5 box-decoration-slice"></div>
        <div className="max-w-7xl mx-auto px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#bcbcbc] mb-6 tracking-wide uppercase">WHY AACP</h2>
            <h3 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-8">
              The platform <br /> for authentic <br /> growth.
            </h3>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#14a800]"><CheckCircle2 className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Verified Impressions</h4>
                  <p className="text-gray-400">Every ad placement is authenticated via our proprietary AACP verification engine.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#14a800]"><CheckCircle2 className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Transparency First</h4>
                  <p className="text-gray-400">Real-time dashboards show exactly where your budget goes and what results it brings.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-[#14a800]"><CheckCircle2 className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Scalable Solutions</h4>
                  <p className="text-gray-400">From solo businesses to large agencies, our platform adapts to your scale.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="bg-[#14a800]/20 backdrop-blur-sm p-6 rounded-2xl border border-white/5 h-48 flex flex-col justify-end">
                <span className="text-4xl font-bold text-white">99%</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Accuracy rate</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/5 h-64 flex flex-col justify-end">
                <span className="text-4xl font-bold text-white">24/7</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Expert support</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/5 h-64 flex flex-col justify-end">
                <span className="text-4xl font-bold text-white">Award</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Best Ads Tool 2025</span>
              </div>
              <div className="bg-[#14a800] p-6 rounded-2xl h-48 flex flex-col justify-center items-center text-center shadow-lg shadow-[#14a800]/20 cursor-pointer hover:bg-[#108a00] transition-colors">
                <Plus className="w-10 h-10 text-white mb-2" />
                <span className="text-sm font-bold text-white leading-tight">Join the marketplace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Post Opportunity CTA ─── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-[#f7faf7] p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h3 className="text-4xl font-bold mb-6">Find the best advertisers for your business campaign.</h3>
              <p className="text-lg text-[#5e6d55] mb-8">Post your requirements and let verified advertisers apply to you directly.</p>
              <button
                onClick={() => navigate('/auth/register')}
                className="px-10 py-4 rounded-full bg-[#14a800] text-lg font-bold text-white hover:bg-[#108a00] transition-all"
              >
                Post a Campaign
              </button>
            </div>
            <div className="hidden lg:block w-[400px]">
              {/* Abstract illustration representated by icons */}
              <div className="grid grid-cols-3 gap-4">
                {[Megaphone, ShieldCheck, Zap, Users, BarChart3, TrendingUp].map((Icon, i) => (
                  <div key={i} className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <Icon className="w-10 h-10 text-[#14a800]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#001e00] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#14a800] flex items-center justify-center text-white">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#14a800]">AACP</span>
              </Link>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer">f</div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer">x</div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer">in</div>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-[#5e6d55]">For Clients</h5>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How to hire</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Project Catalog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-[#5e6d55]">For Advertisers</h5>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How to find work</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Direct Contracts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success stories</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-[#5e6d55]">Resources</h5>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ad School</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div className="hidden lg:block">
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-[#5e6d55]">Company</h5>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trust & Safety</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs text-gray-500 font-medium">
            <div className="flex gap-6">
              <span>© {new Date().getFullYear()} AACP Global Inc.</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
            <div className="flex gap-4">
              <span>Accessibility</span>
              <span>Sitemap</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Mobile Menu ─── */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16 p-6">
          <ul className="space-y-6 text-xl font-bold">
            <li><a href="#">Find Advertisers</a></li>
            <li><a href="#">Find Business</a></li>
            <li><a href="#">Why AACP</a></li>
            <li className="pt-6 border-t border-gray-100">
              <Link to="/auth/login" className="text-[#14a800]">Log in</Link>
            </li>
            <li>
              <Link to="/auth/register" className="text-[#14a800]">Sign up</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
