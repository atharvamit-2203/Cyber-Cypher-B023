'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../lib/mock-data';
import { api } from '../lib/api';
import Chatbot from '../components/Chatbot';
import { FailureScenario, triggerFailure } from '../lib/simulation-store';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<Product[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [processStep, setProcessStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [activeScenario, setActiveScenario] = useState<FailureScenario>('NONE');

    useEffect(() => {
        const savedCart = sessionStorage.getItem('cyber_cart');
        const scenario = sessionStorage.getItem('active_scenario') as FailureScenario;

        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        if (scenario) {
            setActiveScenario(scenario);
        }
    }, []);

    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const steps = [
        "Initializing secure tunnel...",
        "Encrypting payment metadata...",
        "Routing through gateway...",
        "Awaiting bank authorization...",
        "Finalizing transaction..."
    ];

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setProcessStep(0);
        setError(null);

        // Simulate steps
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 1200));
            setProcessStep(i + 1);

            // Trigger failure at the "Routing through gateway" step if scenario is active
            if (i === 2 && activeScenario === 'CHECKOUT_GATEWAY_TIMEOUT') {
                await new Promise(r => setTimeout(r, 2000)); // Extra hang
                setError("Payment Gateway Timeout: The transaction could not be completed at this time.");
                setIsProcessing(false);

                // Trigger real failure signals
                triggerFailure('CHECKOUT_GATEWAY_TIMEOUT');
                try {
                    api.simulateIssue({
                        merchant_id: "Fashion Hub",
                        type: "checkout",
                        description: "High latency detected in payment gateway resulting in 504 Timeout for customer checkout."
                    }).then(() => api.triggerAgentScan());
                } catch (e) { }
                return;
            }
        }

        // Success Path
        await new Promise(r => setTimeout(r, 800));
        sessionStorage.removeItem('cyber_cart');
        setIsProcessing(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-6">
                <div className="max-w-md w-full glass-card rounded-3xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 border-emerald-500/20">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-5xl mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-bounce-short">
                        ✓
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold">Order Confirmed!</h1>
                        <p className="text-slate-400">Your digital assets are being provisioned into your secure vault.</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 text-left">
                        <div className="flex justify-between text-xs text-slate-500 uppercase tracking-widest mb-2">
                            <span>Transaction ID</span>
                            <span>Date</span>
                        </div>
                        <div className="flex justify-between font-mono text-sm text-slate-200">
                            <span>#TX-CYBER-7792</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/store')}
                        className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Return to Storefront
                    </button>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        A confirmation email has been dispatched.
                    </p>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && !isProcessing) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <button onClick={() => router.push('/store')} className="text-indigo-400 hover:underline">Return to Store</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                {/* Left Side: Order Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <button
                        onClick={() => router.push('/store')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Store
                    </button>

                    <div className="glass-card rounded-3xl p-6 border-slate-700/50">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            🛒 Order Summary
                        </h2>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-xl">
                                            {item.image}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{item.name}</div>
                                            <div className="text-xs text-slate-500">{item.category}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-indigo-400">₹{item.price.toLocaleString('en-IN')}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-emerald-400">
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white pt-2">
                                <span>Total</span>
                                <span className="text-indigo-400">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Form */}
                <div className="lg:col-span-8">
                    <div className="glass-card rounded-3xl p-8 md:p-12 border-slate-700/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />

                        <h2 className="text-3xl font-black italic tracking-tighter text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                            SECURE<span className="text-indigo-500">PAY</span>
                        </h2>

                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Card Number</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="···· ···· ···· 4242"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Card Holder</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="J. DOE"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="MM / YY"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">CVC</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="•••"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Pay ₹{total.toLocaleString('en-IN')}
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </button>
                                <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-[0.2em]">
                                    🔒 256-BIT ENCRYPTION ACTIVE • SECURE MIGRATION GATEWAY
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 animate-in slide-in-from-top-4">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl text-red-500 mt-1">⚠️</div>
                                <div>
                                    <h4 className="text-red-500 font-bold mb-1">Transaction Failed</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
                                    <p className="text-indigo-400 text-sm mt-3 font-medium animate-pulse">
                                        Our AI Assistant is investigating the connection glitch...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                            <div
                                className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"
                                style={{ animationDuration: '0.8s' }}
                            />
                            <div className="absolute inset-4 border-2 border-slate-700/50 rounded-full flex items-center justify-center text-3xl">
                                💳
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-white tracking-tight">Processing Payment</h3>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${(processStep / steps.length) * 100}%` }}
                                />
                            </div>
                            <p className="text-indigo-400 font-mono text-xs tracking-widest uppercase animate-pulse">
                                {steps[processStep] || "Completing..."}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-tighter">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                AI Shadow Monitoring Active
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Chatbot role="customer" activeScenario={error ? 'CHECKOUT_GATEWAY_TIMEOUT' : 'NONE'} />
        </div>
    );
}
