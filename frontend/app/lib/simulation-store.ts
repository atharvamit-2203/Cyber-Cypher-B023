'use client';

import { Signal, Ticket, mockSignals, mockTickets } from './mock-data';

const STORAGE_KEYS = {
    SIGNALS: 'cyber_cypher_signals',
    TICKETS: 'cyber_cypher_tickets',
};

export type FailureScenario =
    | 'NONE'
    | 'AUTH_FAILURE_API'
    | 'INVENTORY_MISMATCH'
    | 'CART_SYNC_FAILURE'
    | 'CHECKOUT_GATEWAY_TIMEOUT'
    | 'WEBHOOK_DELIVERY_FAILURE';

export const initializeSimulation = () => {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.SIGNALS)) {
        localStorage.setItem(STORAGE_KEYS.SIGNALS, JSON.stringify(mockSignals));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(mockTickets));
    }
};

export const getSimulationState = () => {
    if (typeof window === 'undefined') return { signals: mockSignals, tickets: mockTickets };

    const signals = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGNALS) || '[]');
    const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');

    return { signals, tickets };
};

// Generic function to trigger different failure scenarios
export const triggerFailure = (scenario: FailureScenario, contextData?: any) => {
    if (typeof window === 'undefined') return;
    if (scenario === 'NONE') return;

    const { signals, tickets } = getSimulationState();
    let newSignal: Signal | null = null;
    let newTicket: Ticket | null = null;

    const timestamp = new Date().toISOString();
    const idSuffix = Date.now().toString().slice(-6);

    switch (scenario) {
        case 'AUTH_FAILURE_API':
            newSignal = {
                id: `SIG-${idSuffix}`,
                type: 'api_auth_error',
                severity: 'critical',
                count: 1, // Start small, would aggregate in real system
                timeWindow: '1 minute',
                pattern: '401 Unauthorized - Product Catalog API',
                affectedMerchants: 1,
                timestamp
            };
            // No ticket immediately for auth, maybe just signal? 
            // Let's create one for visibility
            newTicket = {
                id: `TKT-${idSuffix}`,
                customerId: 'demo_user',
                customerName: 'Store Visitor',
                title: 'Product Catalog API Auth Failure',
                description: 'Auto-detected: Frontend reporting 401 on /api/products. Potentially expired JWT or rotated keys.',
                category: 'api_error',
                status: 'analyzing',
                priority: 'high',
                createdAt: timestamp,
                updatedAt: timestamp,
                agentStatus: 'reasoning',
                confidence: 92,
                riskLevel: 'high'
            };
            break;

        case 'INVENTORY_MISMATCH':
            newSignal = {
                id: `SIG-${idSuffix}`,
                type: 'inventory_sync_error',
                severity: 'medium',
                count: 5,
                timeWindow: '10 minutes',
                pattern: 'Stock Check Failed (Legacy vs Headless)',
                affectedMerchants: 1,
                timestamp
            };
            newTicket = {
                id: `TKT-${idSuffix}`,
                customerId: 'demo_user',
                customerName: 'Shopper',
                title: 'Inventory Sync Mismatch',
                description: `Customer attempted to buy item ${contextData?.itemId || 'SKU-UNKNOWN'} which is OOS in legacy DB but available in Headless.`,
                category: 'migration_issue',
                status: 'analyzing',
                priority: 'medium',
                createdAt: timestamp,
                updatedAt: timestamp,
                agentStatus: 'deciding', // Faster resolution
                confidence: 88,
                riskLevel: 'medium'
            };
            break;

        case 'CART_SYNC_FAILURE':
            newSignal = {
                id: `SIG-${idSuffix}`,
                type: 'webhook_failure',
                severity: 'high',
                count: 1,
                timeWindow: 'instant',
                pattern: 'Cart Updated Webhook 500 Error',
                affectedMerchants: 1,
                timestamp
            };
            newTicket = {
                id: `TKT-${idSuffix}`,
                customerId: 'demo_user',
                customerName: 'Shopper',
                title: 'Cart Sync Failed',
                description: 'Frontend cart state passed to backend but webhook receiver returned 500.',
                category: 'webhook_failure',
                status: 'open',
                priority: 'high',
                createdAt: timestamp,
                updatedAt: timestamp,
                agentStatus: 'observing',
                confidence: 65,
                riskLevel: 'high'
            };
            break;

        case 'CHECKOUT_GATEWAY_TIMEOUT':
            // Logic from previous implementation
            newSignal = {
                id: `SIG-${idSuffix}`,
                type: 'checkout_failure',
                severity: 'critical',
                count: 1,
                timeWindow: '1 minute',
                pattern: 'Payment Gateway Timeout (504) - Migrated Endpoint',
                affectedMerchants: 1,
                timestamp
            };
            newTicket = {
                id: `TKT-${idSuffix}`,
                customerId: 'demo_user',
                customerName: 'Demo Store User',
                title: 'Checkout Failure: Gateway Timeout',
                description: 'Automatic ticket created by AI Agent. User experienced 504 Gateway Timeout during checkout.',
                category: 'checkout_failure',
                status: 'analyzing',
                priority: 'high',
                createdAt: timestamp,
                updatedAt: timestamp,
                agentStatus: 'reasoning',
                confidence: 88,
                riskLevel: 'high'
            };
            break;

        default:
            return;
    }

    if (newSignal && newTicket) {
        const updatedSignals = [newSignal, ...signals];
        const updatedTickets = [newTicket, ...tickets];
        localStorage.setItem(STORAGE_KEYS.SIGNALS, JSON.stringify(updatedSignals));
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updatedTickets));
        window.dispatchEvent(new Event('simulation-update'));
    }

    return { signal: newSignal, ticket: newTicket };
};
