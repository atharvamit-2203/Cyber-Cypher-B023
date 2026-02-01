'use client';

import React, { useState, useEffect } from 'react';
import { mockProducts, Product } from '../lib/mock-data';
import { triggerFailure, FailureScenario, initializeSimulation } from '../lib/simulation-store';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function StorefrontComponent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeScenario, setActiveScenario] = useState<FailureScenario>('NONE');

    // Dev Controls State
    const [showDevControls, setShowDevControls] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<FailureScenario>('NONE');
    const router = useRouter();

    useEffect(() => {
        initializeSimulation();
        executeAction('LOAD');
    }, []);

    const executeAction = async (action: 'LOAD' | 'ADD_TO_CART' | 'CHECKOUT', item?: Product) => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));

        let currentScenario = selectedScenario;
        let failureOccurred = false;

        if (action === 'LOAD' && selectedScenario === 'AUTH_FAILURE_API') {
            failureOccurred = true;
            setProducts([]);
        } else if (action === 'ADD_TO_CART' && selectedScenario === 'INVENTORY_MISMATCH') {
            failureOccurred = true;
        } else if (action === 'ADD_TO_CART' && selectedScenario === 'CART_SYNC_FAILURE') {
            failureOccurred = true;
            setCart([...cart, item!]);
        } else if (action === 'CHECKOUT' && selectedScenario === 'CHECKOUT_GATEWAY_TIMEOUT') {
            failureOccurred = true;
        }

        setLoading(false);

        if (failureOccurred) {
            setActiveScenario(currentScenario);
            triggerFailure(currentScenario, { itemId: item?.id });
            try {
                const scenarioTypeMap: Record<string, string> = {
                    'AUTH_FAILURE_API': 'api',
                    'INVENTORY_MISMATCH': 'inventory',
                    'CART_SYNC_FAILURE': 'webhook',
                    'CHECKOUT_GATEWAY_TIMEOUT': 'checkout'
                };
                api.simulateIssue({
                    merchant_id: "Fashion Hub",
                    type: (scenarioTypeMap[currentScenario] || 'api') as any,
                    description: `Migration Anomaly: Customer encountered ${currentScenario.replace(/_/g, ' ')} during ${action} for product ${item?.name || 'Catalog'}.`
                }).then(() => api.triggerAgentScan());
            } catch (e) { }
        } else {
            if (action === 'LOAD') setProducts(mockProducts);
            if (action === 'ADD_TO_CART' && item) setCart([...cart, item]);
            if (action === 'CHECKOUT') {
                sessionStorage.setItem('cyber_cart', JSON.stringify(cart));
                sessionStorage.setItem('active_scenario', selectedScenario);
                router.push('/checkout');
            }
            setActiveScenario('NONE');
        }
    };

    return (
        <div className="text-slate-100 pb-20">
            {/* Dev Controls */}
            <div className="mb-8">
                <button
                    onClick={() => setShowDevControls(!showDevControls)}
                    className="bg-slate-800 text-xs text-slate-400 px-3 py-1.5 rounded-lg hover:text-white transition-colors border border-slate-700"
                >
                    🕵️ {showDevControls ? 'Hide' : 'Show'} Simulation Controls
                </button>
                {showDevControls && (
                    <div className="mt-4 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 max-w-sm">
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
                                            setActiveScenario('NONE');
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

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <div className="text-4xl mb-4 text-slate-600">👻</div>
                    <h3 className="text-xl font-bold text-white mb-2">Catalog Unavailable</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        {selectedScenario === 'AUTH_FAILURE_API'
                            ? 'System Error: Unable to fetch product catalog. API Authentication failed during legacy sync.'
                            : 'Our shelves are currently being updated. Check back soon!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="group glass-card rounded-2xl p-4 hover:bg-slate-800/60 transition-all duration-300">
                            <div className="aspect-square bg-slate-950/60 rounded-xl mb-4 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                                {product.image}
                                <button
                                    onClick={() => executeAction('ADD_TO_CART', product)}
                                    className="absolute bottom-4 right-4 bg-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-100 truncate pr-2">{product.name}</h3>
                                    <span className="font-bold text-indigo-400">₹{product.price.toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-2 h-7">{product.description}</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {product.tags.map(tag => (
                                        <span key={tag} className="text-[8px] uppercase font-black text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded tracking-tighter">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cart Summary */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-8 py-4 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] flex items-center gap-8 z-[60] animate-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛒</div>
                        <div>
                            <div className="text-xs uppercase font-black tracking-widest opacity-80">Cart Total</div>
                            <div className="font-mono font-bold leading-tight">₹{cart.reduce((a, b) => a + b.price, 0).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => executeAction('CHECKOUT')}
                        className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-sm font-black hover:bg-slate-100 transition-all transform hover:scale-105 active:scale-95"
                        disabled={loading}
                    >
                        {loading ? 'PROCESSING...' : 'CHECKOUT'}
                    </button>
                </div>
            )}
        </div>
    );
}
