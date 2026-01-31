'use client';

import { useState } from 'react';
import { mockMerchants, mockAgentActions } from '@/lib/mock-data';

export default function MerchantDashboard() {
  const [merchant] = useState(mockMerchants[0]); // Fashion Hub
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI migration assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setChatMessages([...chatMessages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = '';
      
      if (input.toLowerCase().includes('checkout') || input.toLowerCase().includes('payment')) {
        aiResponse = 'I detected payment gateway timeouts affecting your store. The issue is with the primary payment gateway experiencing high latency. I recommend:\n\n1. Switch to the backup gateway (I can do this automatically)\n2. Update your webhook signature format\n\nWould you like me to apply these fixes?';
      } else if (input.toLowerCase().includes('webhook')) {
        aiResponse = 'Your webhook configuration needs to be updated for the new headless architecture. The signature format has changed. Here\'s the fix:\n\n```\nOld: HMAC-SHA256\nNew: HMAC-SHA512 with timestamp\n```\n\nI\'ve sent detailed documentation to your email. Would you like me to update the configuration automatically?';
      } else if (input.toLowerCase().includes('migration')) {
        aiResponse = `You're currently on Migration Step ${merchant.migrationStep}/${merchant.totalSteps}. Here's what's left:\n\n✅ Step 1: API Setup - Completed\n✅ Step 2: Product Sync - Completed\n⚠️ Step 3: Checkout Integration - Issues detected\n⏳ Step 4: Webhook Configuration - Pending\n⏳ Step 5: Final Testing - Pending\n\nFocus on fixing the webhook issues first.`;
      } else {
        aiResponse = 'I can help you with:\n- Migration status and next steps\n- Debugging checkout issues\n- Webhook configuration\n- API integration problems\n\nWhat would you like to know more about?';
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }, 1000);

    setInput('');
  };

  const autoFixIssues = merchant.issues.filter(i => i.severity !== 'critical');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Merchant Dashboard</h1>
          <p className="text-gray-600">Welcome back, {merchant.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Migration Progress</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold">{merchant.migrationStep}</span>
              <span className="text-xl text-gray-400 mb-1">/ {merchant.totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(merchant.migrationStep / merchant.totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Issues</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold text-red-600">{merchant.issues.length}</span>
              <span className="text-sm text-gray-500 mb-2">detected</span>
            </div>
            <div className="text-sm text-gray-600">
              {merchant.issues.filter(i => i.severity === 'critical').length} critical
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">AI Actions</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold text-green-600">
                {mockAgentActions.filter(a => a.status === 'executed').length}
              </span>
              <span className="text-sm text-gray-500 mb-2">auto-fixed</span>
            </div>
            <div className="text-sm text-gray-600">
              {mockAgentActions.filter(a => a.status === 'pending').length} pending approval
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">🔴 Active Issues</h2>
            
            {merchant.issues.length === 0 ? (
              <p className="text-gray-500">No active issues. Everything looks good! 🎉</p>
            ) : (
              <div className="space-y-4">
                {merchant.issues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{issue.type}</span>
                        </div>
                        <h3 className="font-semibold mb-1">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        <p className="text-xs text-gray-500">
                          Affecting {issue.affectedCount} customers • Detected {new Date(issue.detectedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {issue.severity !== 'critical' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="bg-blue-50 rounded p-3 mb-2">
                          <p className="text-sm text-blue-900 mb-2">
                            🤖 <strong>AI Recommendation:</strong> I can fix this automatically. 
                            {issue.type === 'webhook' && ' Update your webhook signature to the new format.'}
                            {issue.type === 'payment' && ' Switch to backup payment gateway.'}
                          </p>
                        </div>
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          Apply AI Fix
                        </button>
                      </div>
                    )}

                    {issue.severity === 'critical' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="bg-red-50 rounded p-3">
                          <p className="text-sm text-red-900">
                            ⚠️ Critical issue requires engineer approval. Our team has been notified.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-[600px]">
            <h2 className="text-xl font-bold mb-4">💬 AI Assistant Chat</h2>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about migration issues..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setInput('What is my migration status?')}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                Migration status
              </button>
              <button
                onClick={() => setInput('Why is checkout failing?')}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                Checkout issues
              </button>
              <button
                onClick={() => setInput('Help with webhooks')}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                Webhook help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
