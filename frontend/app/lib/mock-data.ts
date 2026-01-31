export type TicketStatus = 'analyzing' | 'resolved' | 'pending_approval' | 'open';
export type AgentStatus = 'observing' | 'reasoning' | 'deciding' | 'acting' | 'waiting_approval' | 'completed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 'immediate_mitigation' | 'permanent_fix' | 'proactive_communication' | 'documentation' | 'tier_upgrade' | 'guidance';

export interface Ticket {
    id: string;
    customerId: string;
    customerName: string;
    title: string;
    description: string;
    category: string;
    status: TicketStatus;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    agentStatus: AgentStatus;
    confidence: number;
    riskLevel: RiskLevel;
}

export interface ProposedAction {
    id: string;
    type: ActionType;
    description: string;
    impact: string;
    risk: RiskLevel;
    confidence: number;
    requiresApproval: boolean;
    estimatedDuration: string;
    affectedMerchants: number;
}

export interface RootCause {
    primary: string;
    secondary: string;
    confidence: number;
    evidence: string[];
}

export interface Reasoning {
    observation: string[];
    rootCause: RootCause;
    proposedActions: ProposedAction[];
    assumptions: string[];
    uncertainty?: string;
}

export interface Signal {
    id: string;
    type: string;
    severity: RiskLevel | 'warning';
    count: number;
    timeWindow: string;
    pattern: string;
    affectedMerchants: number;
    timestamp: string;
}

export interface AgentActivity {
    id: string;
    timestamp: string;
    ticketId: string;
    stage: AgentStatus;
    action: string;
    confidence: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    stock: number;
    tags: string[];
}

export const mockProducts: Product[] = [
    {
        id: 'PROD-001',
        name: 'Cyber Runner 2077',
        price: 21999,
        category: 'Footwear',
        image: '👟',
        description: 'Self-lacing nervous system integration.',
        stock: 15,
        tags: ['new', 'featured']
    },
    {
        id: 'PROD-002',
        name: 'Neural Link Headset',
        price: 49999,
        category: 'Electronics',
        image: '🎧',
        description: 'Direct-to-brain audio interface with noise cancellation.',
        stock: 50,
        tags: ['electronics', 'premium']
    },
    {
        id: 'PROD-003',
        name: 'Holographic Display',
        price: 74999,
        category: 'Electronics',
        image: '🖥️',
        description: '3D projection display for immersive workspace.',
        stock: 8,
        tags: ['electronics', 'office']
    },
    {
        id: 'PROD-004',
        name: 'Quantum Core Processor',
        price: 249999,
        category: 'Components',
        image: '💾',
        description: 'Next-gen processing power for your home server.',
        stock: 3,
        tags: ['components', 'hardware']
    },
    {
        id: 'PROD-005',
        name: 'Stealth Drone',
        price: 38999,
        category: 'Drones',
        image: '🛸',
        description: 'Ultra-quiet surveillance drone with 4K camera.',
        stock: 25,
        tags: ['drones', 'outdoor']
    },
    {
        id: 'PROD-006',
        name: 'Smart Glasses',
        price: 29999,
        category: 'Wearables',
        image: '👓',
        description: 'AR-enabled glasses with real-time translation.',
        stock: 40,
        tags: ['wearables', 'fashion']
    },
    {
        id: 'PROD-007',
        name: 'Cyber Backpack',
        price: 10999,
        category: 'Accessories',
        image: '🎒',
        description: 'Anti-theft, solar-charging backpack.',
        stock: 100,
        tags: ['accessories', 'travel']
    },
    {
        id: 'PROD-008',
        name: 'Mechanical Keyboard',
        price: 15999,
        category: 'Electronics',
        image: '⌨️',
        description: 'RGB backlit mechanical keyboard with tactile switches.',
        stock: 60,
        tags: ['electronics', 'gaming']
    },
    {
        id: 'PROD-009',
        name: 'Gaming Mouse',
        price: 7499,
        category: 'Electronics',
        image: '🖱️',
        description: 'High-precision gaming mouse with customizable weights.',
        stock: 75,
        tags: ['electronics', 'gaming']
    },
    {
        id: 'PROD-010',
        name: 'Portable SSD',
        price: 13499,
        category: 'Storage',
        image: '💽',
        description: '2TB ultra-fast portable solid-state drive.',
        stock: 120,
        tags: ['storage', 'electronics']
    },
    {
        id: 'PROD-011',
        name: 'Smart Watch',
        price: 24999,
        category: 'Wearables',
        image: '⌚',
        description: 'Health monitoring smartwatch with holographic face.',
        stock: 35,
        tags: ['wearables', 'fitness']
    },
    {
        id: 'PROD-012',
        name: 'VR Headset',
        price: 42999,
        category: 'Electronics',
        image: '🥽',
        description: 'Immersive virtual reality headset with haptic feedback.',
        stock: 20,
        tags: ['electronics', 'gaming']
    },
    {
        id: 'PROD-013',
        name: 'Robot Vacuum',
        price: 33999,
        category: 'Home',
        image: '🤖',
        description: 'Autonomous cleaning robot with AI pathfinding.',
        stock: 45,
        tags: ['home', 'smart-home']
    },
    {
        id: 'PROD-014',
        name: 'Smart Thermostat',
        price: 16999,
        category: 'Home',
        image: '🌡️',
        description: 'AI-learning thermostat for energy efficiency.',
        stock: 55,
        tags: ['home', 'smart-home']
    },
    {
        id: 'PROD-015',
        name: 'Wireless Earbuds',
        price: 12999,
        category: 'Audio',
        image: '🎵',
        description: 'True wireless earbuds with crystal clear sound.',
        stock: 90,
        tags: ['audio', 'electronics']
    }
];

export const mockTickets: Ticket[] = [
    {
        id: 'TKT-001',
        customerId: 'merchant_123',
        customerName: 'Acme Corp',
        title: 'Checkout failing after migration',
        description: 'Our customers are unable to complete checkout. Getting error: "Payment gateway not configured"',
        category: 'checkout_failure',
        status: 'analyzing',
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        agentStatus: 'reasoning',
        confidence: 85,
        riskLevel: 'high'
    },
    {
        id: 'TKT-002',
        customerId: 'merchant_456',
        customerName: 'TechStart Inc',
        title: 'Webhook delivery failures',
        description: 'Not receiving order confirmation webhooks since yesterday',
        category: 'webhook_failure',
        status: 'resolved',
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        agentStatus: 'completed',
        confidence: 95,
        riskLevel: 'low'
    },
    {
        id: 'TKT-003',
        customerId: 'merchant_789',
        customerName: 'Global Retail Ltd',
        title: 'API rate limit errors',
        description: 'Getting 429 errors on product sync API',
        category: 'api_error',
        status: 'pending_approval',
        priority: 'medium',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 600000).toISOString(),
        agentStatus: 'deciding',
        confidence: 72,
        riskLevel: 'medium'
    }
];

export const mockReasonings: Record<string, Reasoning> = {
    'TKT-001': {
        observation: [
            'Detected 47 similar checkout failures in last 2 hours',
            'All failures from merchants migrated in batch MIG-2024-01-30',
            'Error pattern matches missing payment gateway configuration',
            'Migration logs show incomplete headless setup for this batch'
        ],
        rootCause: {
            primary: 'Migration configuration incomplete',
            secondary: 'Payment gateway credentials not transferred during headless migration',
            confidence: 85,
            evidence: [
                'Batch MIG-2024-01-30 migration script v2.1 has known issue #4521',
                '12 of 15 merchants in this batch experiencing same issue',
                'Manual verification confirms missing Stripe API keys in new environment'
            ]
        },
        proposedActions: [
            {
                id: 'ACT-001-1',
                type: 'immediate_mitigation',
                description: 'Temporarily route checkout to legacy hosted gateway',
                impact: 'Restores checkout functionality within 5 minutes',
                risk: 'medium',
                confidence: 90,
                requiresApproval: true,
                estimatedDuration: '5 minutes',
                affectedMerchants: 12
            },
            {
                id: 'ACT-001-2',
                type: 'permanent_fix',
                description: 'Run payment gateway credential migration script for batch MIG-2024-01-30',
                impact: 'Fixes root cause for all 12 affected merchants',
                risk: 'low',
                confidence: 95,
                requiresApproval: true,
                estimatedDuration: '15 minutes',
                affectedMerchants: 12
            },
            {
                id: 'ACT-001-3',
                type: 'proactive_communication',
                description: 'Send status update to all affected merchants',
                impact: 'Reduces support ticket volume, maintains trust',
                risk: 'low',
                confidence: 100,
                requiresApproval: false,
                estimatedDuration: '2 minutes',
                affectedMerchants: 12
            }
        ],
        assumptions: [
            'Merchants have valid Stripe accounts in legacy system',
            'API credentials are still accessible in legacy database',
            'No merchants have changed payment processors during migration'
        ],
        uncertainty: 'Unable to verify if all merchants want to continue using Stripe (15% uncertainty)'
    },
    'TKT-002': {
        observation: [
            'Webhook endpoint returned 404 for 6 hours',
            'Merchant recently updated their server configuration',
            'No similar issues from other merchants'
        ],
        rootCause: {
            primary: 'Merchant configuration error',
            secondary: 'Webhook URL changed without updating platform settings',
            confidence: 95,
            evidence: [
                'DNS records show merchant domain pointing to new server',
                'Old webhook endpoint no longer exists',
                'Merchant confirmed server migration in previous ticket'
            ]
        },
        proposedActions: [
            {
                id: 'ACT-002-1',
                type: 'documentation',
                description: 'Sent webhook reconfiguration guide to merchant',
                impact: 'Merchant updated webhook URL, deliveries resumed',
                risk: 'low',
                confidence: 100,
                requiresApproval: false,
                estimatedDuration: 'Completed',
                affectedMerchants: 1
            }
        ],
        assumptions: [
            'Merchant has access to platform webhook settings'
        ],
        uncertainty: 'None - issue resolved and verified'
    },
    'TKT-003': {
        observation: [
            'Rate limit errors started after merchant increased sync frequency',
            'Merchant on legacy tier with 100 req/min limit',
            'New headless API has different rate limit structure'
        ],
        rootCause: {
            primary: 'Rate limit tier mismatch',
            secondary: 'Migration did not map legacy tier to equivalent headless tier',
            confidence: 72,
            evidence: [
                'Merchant sync script making 150 req/min',
                'Legacy tier allowed burst traffic, headless does not',
                'Similar pattern in 3 other migrated merchants'
            ]
        },
        proposedActions: [
            {
                id: 'ACT-003-1',
                type: 'tier_upgrade',
                description: 'Upgrade merchant to Pro tier (500 req/min)',
                impact: 'Resolves rate limiting, may affect billing',
                risk: 'medium',
                confidence: 70,
                requiresApproval: true,
                estimatedDuration: '1 minute',
                affectedMerchants: 1
            },
            {
                id: 'ACT-003-2',
                type: 'guidance',
                description: 'Recommend implementing exponential backoff in sync script',
                impact: 'Reduces API load, works within current limits',
                risk: 'low',
                confidence: 85,
                requiresApproval: false,
                estimatedDuration: '5 minutes',
                affectedMerchants: 1
            }
        ],
        assumptions: [
            'Merchant willing to modify sync script',
            'Billing team approves tier upgrade without additional charge'
        ],
        uncertainty: 'Unclear if merchant budget allows tier upgrade (28% uncertainty)'
    }
};

export const mockSignals: Signal[] = [
    {
        id: 'SIG-001',
        type: 'checkout_failure',
        severity: 'critical',
        count: 47,
        timeWindow: '2 hours',
        pattern: 'Spike in payment gateway errors',
        affectedMerchants: 12,
        timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: 'SIG-002',
        type: 'api_error',
        severity: 'warning',
        count: 234,
        timeWindow: '1 hour',
        pattern: '429 rate limit errors',
        affectedMerchants: 4,
        timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'SIG-003',
        type: 'webhook_failure',
        severity: 'medium',
        count: 12,
        timeWindow: '30 minutes',
        pattern: 'Timeout on webhook delivery',
        affectedMerchants: 3,
        timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 'SIG-004',
        type: 'migration_anomaly',
        severity: 'low',
        count: 5,
        timeWindow: '24 hours',
        pattern: 'Merchants reverting to legacy API',
        affectedMerchants: 5,
        timestamp: new Date(Date.now() - 86400000).toISOString()
    }
];

export const mockAgentActivity: AgentActivity[] = [
    {
        id: 'LOG-001',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        ticketId: 'TKT-001',
        stage: 'observing',
        action: 'Detected pattern: checkout failures in batch MIG-2024-01-30',
        confidence: 85
    },
    {
        id: 'LOG-002',
        timestamp: new Date(Date.now() - 540000).toISOString(),
        ticketId: 'TKT-001',
        stage: 'reasoning',
        action: 'Root cause identified: Missing payment gateway credentials',
        confidence: 85
    },
    {
        id: 'LOG-003',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        ticketId: 'TKT-001',
        stage: 'deciding',
        action: 'Proposed 3 actions: mitigation, permanent fix, communication',
        confidence: 90
    },
    {
        id: 'LOG-004',
        timestamp: new Date(Date.now() - 420000).toISOString(),
        ticketId: 'TKT-001',
        stage: 'waiting_approval',
        action: 'Awaiting engineer approval for high-risk actions',
        confidence: 90
    },
    {
        id: 'LOG-005',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ticketId: 'TKT-002',
        stage: 'acting',
        action: 'Sent webhook reconfiguration guide to merchant',
        confidence: 100
    },
    {
        id: 'LOG-006',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ticketId: 'TKT-002',
        stage: 'completed',
        action: 'Verified webhook delivery resumed. Ticket resolved.',
        confidence: 100
    }
];
