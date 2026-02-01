const API_BASE_URL = 'http://localhost:8000';

export interface ApiError {
    message: string;
    status: number;
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw { message: response.statusText, status: response.status } as ApiError;
    }

    return response.json();
}

export const api = {
    // Merchants
    getMerchants: () => fetchJson<any[]>('/api/merchants'),

    // Tickets
    getTickets: () => fetchJson<any[]>('/api/tickets'),

    // Agent Actions
    getAgentActions: () => fetchJson<any[]>('/api/agent/actions'),
    triggerAgentScan: () => fetchJson<any>('/api/agent/trigger', { method: 'POST' }),
    approveAction: (actionId: string) => fetchJson<any>(`/api/agent/approve/${actionId}`, { method: 'POST' }),

    // Chat
    chatWithMerchant: (message: string, merchantId: string, userEmail: string = 'guest@example.com') =>
        fetchJson<any>(`/api/chat/merchant?message=${encodeURIComponent(message)}&merchant_id=${encodeURIComponent(merchantId)}&user_email=${encodeURIComponent(userEmail)}`, { method: 'POST' }),

    chatWithEngineer: (message: string, userEmail: string = 'engineer@cybercypher.com') =>
        fetchJson<any>(`/api/chat/engineer?message=${encodeURIComponent(message)}&user_email=${encodeURIComponent(userEmail)}`, { method: 'POST' }),

    simulateIssue: (issue: { merchant_id: string; type: string; description: string }) =>
        fetchJson<any>('/api/simulate/issue', {
            method: 'POST',
            body: JSON.stringify(issue)
        }),

    // Auth
    login: (credentials: { email: string; password: string; role: 'customer' | 'engineer' }) =>
        fetchJson<any>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
};
