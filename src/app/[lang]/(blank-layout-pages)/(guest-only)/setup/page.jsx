"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
    const [selectedPlan, setSelectedPlan] = useState("");
    const router = useRouter();

    const handlePlanChange = (plan) => {
        setSelectedPlan(plan);
    };

const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    if (selectedPlan) {
        console.log("Selected plan:", selectedPlan);
        
        if (selectedPlan === 'lite') {
            router.push("/"); 
        } else if (selectedPlan === 'pro') {
            router.push("/free-trial"); 
        }
    }
};

    const features = [
        { 
            name: "User Limit", 
            lite: "1–2 Users", 
            pro: "10+ Users (Scalable)"
        },
        { 
            name: "Lead Management", 
            lite: "Basic Add/View/Edit", 
            pro: "Advanced Filters + Bulk Upload"
        },
        { 
            name: "Call/WhatsApp/SMS Logs", 
            lite: "Not Available", 
            pro: "Integrated & Auto-Logged",
            liteUnavailable: true
        },
        { 
            name: "Task & Reminder System", 
            lite: "Manual", 
            pro: "Recurring, Smart Reminders"
        },
        { 
            name: "Dashboard Analytics", 
            lite: "Not Available", 
            pro: "Real-time Dashboard",
            liteUnavailable: true
        },
        { 
            name: "Team Management", 
            lite: "Not Available", 
            pro: "Roles, Permissions, Team Leader Views",
            liteUnavailable: true
        },
        { 
            name: "Follow-up Automation", 
            lite: "Not Available", 
            pro: "Auto-Scheduled Follow-ups",
            liteUnavailable: true
        },
        { 
            name: "Document Management", 
            lite: "Basic Upload", 
            pro: "Auto-Tagging + Expiry Alerts"
        },
        { 
            name: "Notes & Tags", 
            lite: "Add Notes", 
            pro: "Smart Tags, Priority Marking"
        },
        { 
            name: "Location Tracking", 
            lite: "Not Available", 
            pro: "Track Field Agents (GPS Check-in)",
            liteUnavailable: true
        },
        { 
            name: "Email/SMS Templates", 
            lite: "Not Available", 
            pro: "Save & Reuse Templates",
            liteUnavailable: true
        },
        { 
            name: "Reports & Exports", 
            lite: "Not Available", 
            pro: "Excel/CSV Export, Activity Logs",
            liteUnavailable: true
        },
        { 
            name: "Third-party Integrations", 
            lite: "Not Available", 
            pro: "Zoom, Google, Calendar, etc.",
            liteUnavailable: true
        },
        { 
            name: "Data Backup", 
            lite: "Manual Only", 
            pro: "Auto Daily Backups"
        },
        { 
            name: "Custom Pipelines & Stages", 
            lite: "Not Available", 
            pro: "Unlimited Pipelines",
            liteUnavailable: true
        },
        { 
            name: "Branding", 
            lite: "Woxox Branding", 
            pro: "White Label (Use Your Logo)"
        },
        { 
            name: "Support", 
            lite: "Community Forum Only", 
            pro: "Priority WhatsApp & Email Support"
        },
        { 
            name: "Onboarding Support", 
            lite: "Not Available", 
            pro: "Free Setup & Training",
            liteUnavailable: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Section - Plan Selection */}
                        <div className="w-full lg:w-2/5 p-8 border-b lg:border-b-0 lg:border-r border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30">
                            <div className="sticky top-8">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">Choose Your Plan</h2>
                                
                                {/* Woxox Lite Option */}
                                <div className="mb-6">
                                    <label className="block cursor-pointer">
                                        <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                            selectedPlan === 'lite' 
                                                ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-100' 
                                                : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                                        }`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="plan"
                                                        value="lite"
                                                        checked={selectedPlan === 'lite'}
                                                        onChange={() => handlePlanChange('lite')}
                                                        className="w-5 h-5 text-emerald-500 mr-4"
                                                    />
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-slate-900">Woxox Lite</h3>
                                                        <p className="text-sm text-slate-600">Perfect for small teams</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Free</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <p className="flex items-center"><span className="text-emerald-500 mr-2">✓</span>Basic CRM features</p>
                                                <p className="flex items-center"><span className="text-emerald-500 mr-2">✓</span>1–2 Users</p>
                                                <p className="flex items-center"><span className="text-emerald-500 mr-2">✓</span>Community support</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Woxox Pro Option */}
                                <div className="mb-8">
                                    <label className="block cursor-pointer">
                                        <div className={`p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                                            selectedPlan === 'pro' 
                                                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100' 
                                                : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                                        }`}>
                                            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                                                POPULAR
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="plan"
                                                        value="pro"
                                                        checked={selectedPlan === 'pro'}
                                                        onChange={() => handlePlanChange('pro')}
                                                        className="w-5 h-5 text-blue-600 mr-4"
                                                    />
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-slate-900">Woxox Pro</h3>
                                                        <p className="text-sm text-slate-600">For growing businesses</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">₹1499</div>
                                                    <div className="text-sm text-slate-500">/month</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <p className="flex items-center"><span className="text-blue-500 mr-2">✓</span>All Lite features +</p>
                                                <p className="flex items-center"><span className="text-blue-500 mr-2">✓</span>Advanced automation</p>
                                                <p className="flex items-center"><span className="text-blue-500 mr-2">✓</span>10+ users (scalable)</p>
                                                <p className="flex items-center"><span className="text-blue-500 mr-2">✓</span>Priority support</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Continue Button */}
                                <button
                                    onClick={handlePurchaseSubmit}
                                    disabled={!selectedPlan}
                                    className={`w-full py-4 px-6 rounded-xl cursor-pointer font-semibold transition-all duration-300 ${
                                        selectedPlan
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transform hover:scale-[1.02]'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {selectedPlan ? `Continue with ${selectedPlan === 'lite' ? 'Woxox Lite' : 'Woxox Pro'}` : 'Select a Plan'}
                                </button>
                            </div>
                        </div>

                        {/* Right Section - Feature Comparison */}
                        <div className="w-full lg:w-3/5 p-8 bg-gradient-to-br from-white to-slate-50/30">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Feature Comparison</h3>
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mr-2"></div>
                                        <span className="text-slate-600">Lite Plan</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mr-2"></div>
                                        <span className="text-slate-600">Pro Plan</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-3xl border border-slate-200/60 overflow-visible">
                                <div className="grid grid-cols-12 gap-0 bg-white border-b border-slate-200/60">
                                    <div className="col-span-4 px-6 py-4">
                                        <h4 className="font-semibold text-slate-800">Feature</h4>
                                    </div>
                                    <div className="col-span-4 px-6 py-4 text-center border-l border-slate-200/60">
                                        <h4 className="font-semibold text-emerald-600">Woxox Lite (Free)</h4>
                                    </div>
                                    <div className="col-span-4 px-4 py-4 text-center border-t-2 border-r-2 border-l-2 border-blue-400 rounded-t-lg relative z-10">
                                        <h4 className="font-semibold text-blue-600">Woxox Pro (₹1499/mo)</h4>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {features.map((feature, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-0 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/30 transition-all duration-200">
                                            <div className="col-span-4 px-6 py-5">
                                                <p className="text-md text-slate-900">{feature.name}</p>
                                            </div>
                                            <div className="col-span-4 px-6 py-5 text-center border-l border-slate-100">
                                                {feature.liteUnavailable ? (
                                                    <span className="text-red-500 font-medium text-sm">-</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-medium text-sm">{feature.lite}</span>
                                                )}
                                            </div>
                                            <div className={`col-span-4 px-4 py-5 text-center border-r-2 border-l-2 border-blue-400 relative z-10 ${
                                                index === features.length - 1 ? 'border-b-2 border-b-blue-400 rounded-b-lg' : ''
                                            }`}>
                                                <span className="text-blue-600 font-medium text-sm">{feature.pro}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;