import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-dvh w-full bg-white font-sans text-[#001e00]">
            {/* Left Side - Brand Section */}
            <div className="relative hidden w-[45%] flex-col items-start justify-between overflow-hidden bg-[#001e00] p-12 lg:flex xl:p-20">
                {/* Subtle Decorative Elements */}
                <div className="absolute top-0 right-0 w-full h-full bg-[#14a800]/5 box-decoration-slice pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#14a800] opacity-[0.03] blur-[120px] pointer-events-none" />

                <div className="relative z-10 w-full">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-full bg-[#14a800] flex items-center justify-center text-white transition-transform group-hover:scale-110">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white uppercase">AACP</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 flex flex-col justify-center text-white max-w-xl my-12"
                >
                    <h2 className="mb-8 text-5xl font-bold leading-tight">
                        Reach your <br />
                        <span className="text-[#14a800]">perfect</span> audience.
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-[#14a800] p-1 bg-[#14a800]/10 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Verified Marketplace</h4>
                                <p className="text-gray-400 text-sm">Every partner is authenticated, ensuring 100% legitimate ad placements and reach.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-[#14a800] p-1 bg-[#14a800]/10 rounded-lg">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Guaranteed Transparency</h4>
                                <p className="text-gray-400 text-sm">Full visibility into campaign performance with real-time conversion monitoring.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-[#14a800] p-1 bg-[#14a800]/10 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Scalable Growth</h4>
                                <p className="text-gray-400 text-sm">Powerful tools designed to scale campaigns from local tests to global movements.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="relative z-10 flex items-center justify-between w-full pt-8 border-t border-white/10 text-xs text-gray-500 font-medium">
                    <span>© {new Date().getFullYear()} AACP Platform.</span>
                    <div className="flex gap-4">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="relative flex w-full flex-col justify-center bg-white p-6 lg:w-[55%] lg:p-12 xl:p-20">
                <div className="absolute top-8 left-8 lg:left-12 xl:left-20">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-semibold text-[#5e6d55] hover:text-[#14a800] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to website
                    </Link>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
