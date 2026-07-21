"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

const FreeTrialPage = () => {

    const router = useRouter();

    const handleFreeTrialClick = () => {
        // Redirect to login page
        console.log("Redirecting to home...");
        router.push("/");
    };

    const handleBackClick = () => {
        // Go back to pricing page
        console.log("Going back to pricing...");
        router.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-500/5 to-indigo-500/10"></div>
            
            {/* Header */}
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">W</span>
                        </div>
                        <span className="text-white text-2xl font-bold">Woxox</span>
                    </div>
                    <Button 
                        variant="outlined"
                        onClick={handleBackClick}
                    >
                        ← Back to Plans
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-6">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Logo */}
                    <div className="mb-12">
                        <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">W</span>
                            </div>
                            <span className="text-white text-xl font-semibold">Woxox Pro</span>
                        </div>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                        All Woxox.
                    </h1>
                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-12 leading-tight">
                        No limitations.
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-3xl mx-auto leading-relaxed">
                        Complete CRM solution with advanced automation, analytics, and team management
                    </p>

                    {/* CTA Button */}
                    <div className="mb-12">
                        <button
                            onClick={handleFreeTrialClick}
                            className="bg-gradient-to-r from-blue-500 cursor-pointer to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-lg font-semibold px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/25"
                        >
                            Try 14 days for free
                        </button>
                    </div>

                    {/* Additional info */}
                    <div className="text-white/70 space-y-2">
                        <p>Or save money with a <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline">team or enterprise plan</span></p>
                        <p className="text-sm">
                            You'll be reminded 3 days before your trial ends. Cancel anytime.
                        </p>
                        <p className="text-sm">
                            <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline">Terms and conditions apply</span>
                        </p>
                    </div>

                    {/* Features highlight */}
                    {/* <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Unlimited Users</h3>
                            <p className="text-white/70 text-sm">Scale your team without limits</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Advanced Analytics</h3>
                            <p className="text-white/70 text-sm">Real-time insights and reports</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Smart Automation</h3>
                            <p className="text-white/70 text-sm">Automate follow-ups and tasks</p>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
        </div>
    );
};

export default FreeTrialPage;