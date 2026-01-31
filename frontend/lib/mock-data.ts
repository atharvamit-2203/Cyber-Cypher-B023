// Mock data for the system

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

export interface Merchant {
  id: string;
  name: string;
  migrationStep: number;
  totalSteps: number;
  status: 'migrating' | 'completed' | 'issues';
  issues: Issue[];
}

export interface Issue {
  id: string;
  type: 'api' | 'webhook' | 'payment' | 'inventory' | 'checkout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedCount: number;
  detectedAt: string;
  status: 'detected' | 'analyzing' | 'resolved';
}

export interface AgentAction {
  id: string;
  type: 'auto' | 'recommended' | 'escalated';
  title: string;
  description: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  reasoning: string[];
  impact: string;
}

export interface Ticket {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  aiSuggestion?: string;
}

// Mock Products
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Wireless Headphones', price: 89.99, stock: 15, image: '🎧' },
  { id: 'p2', name: 'Smart Watch', price: 249.99, stock: 8, image: '⌚' },
  { id: 'p3', name: 'Laptop Stand', price: 39.99, stock: 25, image: '💻' },
  { id: 'p4', name: 'Mechanical Keyboard', price: 129.99, stock: 12, image: '⌨️' },
  { id: 'p5', name: 'USB-C Hub', price: 49.99, stock: 0, image: '🔌' },
  { id: 'p6', name: 'Webcam HD', price: 79.99, stock: 20, image: '📷' },
  { id: 'p7', name: 'Mouse Pad XL', price: 24.99, stock: 50, image: '🖱️' },
  { id: 'p8', name: 'Phone Case', price: 19.99, stock: 100, image: '📱' },
];

// Mock Merchants
export const mockMerchants: Merchant[] = [
  {
    id: 'm1',
    name: 'Fashion Hub',
    migrationStep: 3,
    totalSteps: 5,
    status: 'issues',
    issues: [
      {
        id: 'i1',
        type: 'webhook',
        severity: 'high',
        title: 'Webhook Signature Mismatch',
        description: 'Order confirmation webhooks failing due to signature format change',
        affectedCount: 45,
        detectedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'analyzing',
      },
      {
        id: 'i2',
        type: 'payment',
        severity: 'critical',
        title: 'Payment Gateway Timeout',
        description: 'Checkout payments timing out on final step',
        affectedCount: 12,
        detectedAt: new Date(Date.now() - 1800000).toISOString(),
        status: 'detected',
      },
    ],
  },
  {
    id: 'm2',
    name: 'Tech Store Pro',
    migrationStep: 4,
    totalSteps: 5,
    status: 'migrating',
    issues: [
      {
        id: 'i3',
        type: 'inventory',
        severity: 'medium',
        title: 'Inventory Sync Delay',
        description: 'Product stock counts not updating in real-time',
        affectedCount: 8,
        detectedAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'resolved',
      },
    ],
  },
  {
    id: 'm3',
    name: 'Home Essentials',
    migrationStep: 2,
    totalSteps: 5,
    status: 'migrating',
    issues: [],
  },
];

// Mock Agent Actions
export const mockAgentActions: AgentAction[] = [
  {
    id: 'a1',
    type: 'auto',
    title: 'Send Webhook Configuration Guide',
    description: 'Automatically send updated webhook documentation to Fashion Hub',
    confidence: 0.95,
    risk: 'low',
    status: 'executed',
    reasoning: [
      'Pattern detected: 15 merchants with same webhook signature error',
      'Known issue from migration step 3',
      'Solution documented and tested',
      'Low risk: documentation only, no system changes',
    ],
    impact: 'Resolves issue for ~45 affected customers',
  },
  {
    id: 'a2',
    type: 'recommended',
    title: 'Update Payment Gateway Endpoint',
    description: 'Switch Fashion Hub to backup payment gateway',
    confidence: 0.72,
    risk: 'medium',
    status: 'pending',
    reasoning: [
      'Primary gateway showing high latency (avg 8.5s)',
      '12 timeout errors in last 30 minutes',
      'Backup gateway operational with <200ms response',
      'Medium risk: requires config change on live system',
    ],
    impact: 'Prevents further checkout failures, affects ~$15K/hour revenue',
  },
  {
    id: 'a3',
    type: 'escalated',
    title: 'Investigate Database Connection Pool',
    description: 'Abnormal connection pool exhaustion detected',
    confidence: 0.45,
    risk: 'high',
    status: 'pending',
    reasoning: [
      'Unusual pattern: connections not being released',
      'Started after deployment 2 hours ago',
      'Could indicate code regression',
      'High risk: potential cascading failure',
    ],
    impact: 'Critical: Could affect all merchants if not addressed',
  },
];

// Mock Support Tickets
export const mockTickets: Ticket[] = [
  {
    id: 't1',
    merchantId: 'm1',
    merchantName: 'Fashion Hub',
    title: 'Customers unable to complete checkout',
    description: 'Multiple customers reporting payment errors at final checkout step',
    priority: 'critical',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    aiSuggestion: 'Payment gateway timeout detected. Recommend switching to backup gateway.',
  },
  {
    id: 't2',
    merchantId: 'm1',
    merchantName: 'Fashion Hub',
    title: 'Order confirmations not being sent',
    description: 'Customers completing orders but not receiving confirmation emails',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    aiSuggestion: 'Webhook signature mismatch. Configuration guide has been sent to merchant.',
  },
  {
    id: 't3',
    merchantId: 'm2',
    merchantName: 'Tech Store Pro',
    title: 'Products showing incorrect stock levels',
    description: 'Inventory count not matching between admin and storefront',
    priority: 'medium',
    status: 'resolved',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    aiSuggestion: 'Inventory sync issue resolved. Webhook subscription was missing.',
  },
];
