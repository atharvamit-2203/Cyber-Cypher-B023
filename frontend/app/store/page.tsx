'use client';

import React, { useState, useEffect } from 'react';
import Chatbot from '../components/Chatbot';
import { mockProducts, Product } from '../lib/mock-data';
import { triggerFailure, FailureScenario, initializeSimulation } from '../lib/simulation-store';
import Image from 'next/image';

export default function Storefront() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeScenario, setActiveScenario] = useState<FailureScenario>('NONE');

    // Dev Controls State
    const [showDevControls, setShowDevControls] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<FailureScenario>('NONE');

    useEffect(() => {
        initializeSimulation();
        // Simulate initial load
        setProducts(mockProducts);
    }, []);

    // Handle Scenario Triggers
    const executeAction = async (action: 'LOAD' | 'ADD_TO_CART' | 'CHECKOUT', item?: Product) => {
        setLoading(true);
        await wait(800); // Simulate network latency

        let currentScenario = selectedScenario;

        // Logic to determine if action should fail based on selected scenario
        let failureOccurred = false;

        if (action === 'LOAD' && selectedScenario === 'AUTH_FAILURE_API') {
            failureOccurred = true;
            setProducts([]); // Clear products to simulate failure
        } else if (action === 'ADD_TO_CART' && selectedScenario === 'INVENTORY_MISMATCH') {
            failureOccurred = true;
        } else if (action === 'ADD_TO_CART' && selectedScenario === 'CART_SYNC_FAILURE') {
            failureOccurred = true;
            // Item adds locally but triggers background error
            setCart([...cart, item!]);
        } else if (action === 'CHECKOUT' && selectedScenario === 'CHECKOUT_GATEWAY_TIMEOUT') {
            failureOccurred = true;
        }

        setLoading(false);

        if (failureOccurred) {
            setActiveScenario(currentScenario);
            triggerFailure(currentScenario, { itemId: item?.id });
        } else {
            // Success path
            if (action === 'ADD_TO_CART' && item) {
                setCart([...cart, item]);
            }
            if (action === 'CHECKOUT') {
                alert('Order placed successfully! (Simulation)');
                setCart([]);
            }
            setActiveScenario('NONE');
        }
    };

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 pb-20">

            {/* Dev Controls (Hidden Toggle) */}
            <div className="fixed top-4 left-4 z-50">
                <button
                    onClick={() => setShowDevControls(!showDevControls)}
                    className="bg-slate-900 text-xs text-white px-2 py-1 rounded opacity-20 hover:opacity-100 transition-opacity"
                >
                    🕵️ Simulation Controls
                </button>
                {showDevControls && (
                    <div className="mt-2 bg-slate-900 text-white p-4 rounded-xl shadow-xl w-64 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Force Failure Mode</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'NONE', label: '✅ Normal Operation' },
                                { id: 'AUTH_FAILURE_API', label: '🔒 API Auth Failure (Load)' },
                                { id: 'INVENTORY_MISMATCH', label: '📦 Inventory Sync (Add)' },
                                { id: 'CART_SYNC_FAILURE', label: '🛒 Cart Webhook (Add)' },
                                { id: 'CHECKOUT_GATEWAY_TIMEOUT', label: '💳 Gateway Timeout (Buy)' }
                            ].map((mode) => (
                                <label key={mode.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-indigo-400">
                                    <input
                                        type="radio"
                                        name="scenario"
                                        checked={selectedScenario === mode.id}
                                        onChange={() => {
                                            setSelectedScenario(mode.id as FailureScenario);
                                            setActiveScenario('NONE'); // Reset active trigger
                                            if (mode.id === 'AUTH_FAILURE_API') executeAction('LOAD');
                                            else if (mode.id === 'NONE') setProducts(mockProducts);
                                        }}
                                        className="accent-indigo-500"
                                    />
                                    {mode.label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <div className="text-2xl font-black italic tracking-tighter text-slate-900">CYBER<span className="text-indigo-600">STORE</span></div>
                            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
                                <a href="#" className="text-slate-900">New Arrivals</a>
                                <a href="#" className="hover:text-slate-900">Electronics</a>
                                <a href="#" className="hover:text-slate-900">Wearables</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                className="relative group p-2"
                                onClick={() => cart.length > 0 && executeAction('CHECKOUT')}
                            >
                                <span className="text-2xl">🛒</span>
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-12 rounded-3xl bg-slate-900 overflow-hidden relative min-h-[300px] flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
                    <div className="relative z-10 p-12 max-w-2xl">
                        <span className="text-indigo-400 font-bold tracking-wider text-sm uppercase mb-2 block">Migration Special</span>
                        <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">Future Tech.<br />Headless Speed.</h1>
                        <p className="text-slate-300 text-lg mb-8">Experience the next generation of commerce. Powered by autonomous agent infrastructure.</p>
                        <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors">
                            Shop Collection
                        </button>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-600 to-transparent opacity-20" />
                </div>

                {/* Product Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="text-4xl mb-4">👻</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {selectedScenario === 'AUTH_FAILURE_API'
                                ? 'System Error: Unable to fetch product catalog. API Authentication failed.'
                                : 'Our shelves are currently empty. Check back later.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group bg-white rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
                                <div className="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                                    {product.image}
                                    <button
                                        onClick={() => executeAction('ADD_TO_CART', product)}
                                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-slate-900 hover:text-white"
                                    >
                                        +
                                    </button>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-900 truncate pr-2">{product.name}</h3>
                                        <span className="font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed mb-4">{product.description}</p>
                                    <div className="flex gap-2">
                                        {product.tags.map(tag => (
                                            <span key={tag} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md tracking-wide">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Summary (Fixed Bottom) */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                        <span className="font-bold">{cart.length} Items</span>
                        <span className="text-slate-500">|</span>
                        <span className="font-bold text-indigo-400">₹{cart.reduce((a, b) => a + b.price, 0).toLocaleString('en-IN')}</span>
                    </div>
                    <button
                        onClick={() => executeAction('CHECKOUT')}
                        className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Checkout ->'}
                    </button>
                </div>
            )}

            {/* Global AI Chatbot for Customer */}
            <Chatbot role="customer" activeScenario={activeScenario} />
        </div>
    );
}
