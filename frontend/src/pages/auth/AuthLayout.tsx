import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-dvh w-full bg-[#080C0A] font-sans text-gray-100">
            {/* Left Side - Brand Section */}
            <div className="relative hidden w-1/2 flex-col items-start justify-center overflow-hidden bg-[#0F1E16] p-12 lg:flex xl:p-20">
                {/* Abstract Glows */}
                <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#183625] opacity-50 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0FE073] opacity-[0.08] blur-[100px]" />
                <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#183625] opacity-40 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 flex flex-col justify-center text-left text-white h-full max-w-xl"
                >
                    <div className="mt-10 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F1E16] border border-[#2A3E31] text-[#0FE073]">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-wide">AACP</h1>
                    </div>

                    <div className="my-auto">
                        <h2 className="mb-6 text-5xl font-serif font-bold leading-[1.1] text-white">
                            Empowering <span className="text-[#0FE073]">Creative</span><br />Intelligence
                        </h2>
                        <p className="text-lg font-normal text-gray-400 max-w-md">
                            Where AI Meets Advertising Excellence. Ensure verifiable, authentic ad reach.
                        </p>
                    </div>

                </motion.div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex w-full flex-col justify-center bg-[#080C0A] p-6 lg:w-1/2 lg:p-12 xl:p-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
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
