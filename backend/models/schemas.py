from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


class Issue(BaseModel):
    id: str
    type: Literal['api', 'webhook', 'payment', 'inventory', 'checkout']
    severity: Literal['low', 'medium', 'high', 'critical']
    title: str
    description: str
    affected_count: int
    detected_at: datetime
    status: Literal['detected', 'analyzing', 'resolved']


class Merchant(BaseModel):
    id: str
    name: str
    migration_step: int
    total_steps: int
    status: Literal['migrating', 'completed', 'issues']
    issues: List[Issue]


class AgentAction(BaseModel):
    id: str
    type: Literal['auto', 'recommended', 'escalated']
    title: str
    description: str
    confidence: float
    risk: Literal['low', 'medium', 'high']
    status: Literal['pending', 'approved', 'rejected', 'executed']
    reasoning: List[str]
    impact: str
    timestamp: datetime


class Ticket(BaseModel):
    id: str
    merchant_id: str
    merchant_name: str
    title: str
    description: str
    priority: Literal['low', 'medium', 'high', 'critical']
    status: Literal['open', 'in_progress', 'resolved']
    created_at: datetime
    ai_suggestion: Optional[str] = None


class AgentState(BaseModel):
    """State passed between agents in the graph"""
    current_signals: List[dict]
    detected_patterns: List[dict]
    root_causes: List[dict]
    recommended_actions: List[AgentAction]
    confidence: float
    requires_approval: bool
    trace_id: Optional[str] = None


class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str
    timestamp: datetime = datetime.now()
