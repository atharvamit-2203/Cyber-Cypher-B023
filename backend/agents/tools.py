"""Agent tools for monitoring and taking actions"""
from langchain_core.tools import Tool
from typing import List, Dict
import json
from datetime import datetime, timedelta
import random


# Mock data storage (in production, use real database)
MOCK_TICKETS = [
    {
        "id": "TICK-001",
        "merchant": "Fashion Hub",
        "issue": "Checkout not working after migration",
        "priority": "critical",
        "created_at": datetime.now().isoformat()
    }
]
MOCK_API_LOGS = [
    {
        "merchant": "Fashion Hub",
        "endpoint": "/checkout/create",
        "status": 400,
        "error": "webhook_signature_invalid",
        "count": 5,
        "timestamp": datetime.now().isoformat()
    }
]
MOCK_MERCHANTS = {}


def query_support_tickets(query: str = "") -> str:
    """Query support tickets database for patterns"""
    return json.dumps(MOCK_TICKETS, indent=2)


def check_api_logs(merchant_id: str = None, last_minutes: int = 60) -> str:
    """Check API failure logs"""
    return json.dumps(MOCK_API_LOGS, indent=2)


def detect_error_patterns(time_window_hours: int = 24) -> str:
    """Detect recurring error patterns across merchants"""
    patterns = [
        {
            "pattern": "webhook_signature_mismatch",
            "affected_merchants": 15,
            "common_migration_step": 3,
            "first_seen": (datetime.now() - timedelta(hours=2)).isoformat(),
            "frequency": "high"
        },
        {
            "pattern": "payment_gateway_timeout",
            "affected_merchants": 12,
            "common_migration_step": 3,
            "first_seen": (datetime.now() - timedelta(minutes=30)).isoformat(),
            "frequency": "increasing"
        }
    ]
    return json.dumps(patterns, indent=2)


def get_merchant_migration_status(merchant_id: str) -> str:
    """Get merchant's current migration status"""
    status = {
        "merchant_id": merchant_id,
        "name": "Fashion Hub",
        "migration_step": 3,
        "total_steps": 5,
        "step_name": "Checkout Integration",
        "started_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "known_issues": [
            "webhook_signature_format_changed",
            "api_authentication_updated"
        ]
    }
    return json.dumps(status, indent=2)


def send_merchant_notification(merchant_id: str, message: str, doc_link: str = None) -> str:
    """Send notification/documentation to merchant"""
    notification = {
        "status": "sent",
        "merchant_id": merchant_id,
        "message": message,
        "doc_link": doc_link,
        "sent_at": datetime.now().isoformat()
    }
    return json.dumps(notification, indent=2)


def escalate_to_engineer(issue_summary: str, severity: str, recommended_action: str) -> str:
    """Escalate issue to on-call engineer"""
    escalation = {
        "status": "escalated",
        "severity": severity,
        "issue": issue_summary,
        "recommended_action": recommended_action,
        "escalated_at": datetime.now().isoformat(),
        "engineer_notified": True
    }
    return json.dumps(escalation, indent=2)


def update_documentation(doc_id: str, updates: str) -> str:
    """Update migration documentation"""
    result = {
        "status": "updated",
        "doc_id": doc_id,
        "updates": updates,
        "updated_at": datetime.now().isoformat()
    }
    return json.dumps(result, indent=2)


def check_payment_gateway_health() -> str:
    """Check payment gateway status and latency"""
    health = {
        "primary_gateway": {
            "status": "degraded",
            "avg_latency_ms": 8500,
            "error_rate": 0.15
        },
        "backup_gateway": {
            "status": "healthy",
            "avg_latency_ms": 180,
            "error_rate": 0.001
        },
        "recommendation": "switch_to_backup"
    }
    return json.dumps(health, indent=2)


# Create LangChain tools
tools = [
    Tool(
        name="query_support_tickets",
        func=query_support_tickets,
        description="Query the support ticket database to find patterns, recurring issues, or merchant-specific problems. Input should be a search query string."
    ),
    Tool(
        name="check_api_logs",
        func=check_api_logs,
        description="Check API failure logs for a specific merchant or time period. Returns error patterns, status codes, and failure counts."
    ),
    Tool(
        name="detect_error_patterns",
        func=detect_error_patterns,
        description="Analyze error patterns across all merchants to find common issues. Useful for identifying widespread problems."
    ),
    Tool(
        name="get_merchant_migration_status",
        func=get_merchant_migration_status,
        description="Get detailed migration status for a specific merchant including current step, known issues, and timeline."
    ),
    Tool(
        name="send_merchant_notification",
        func=send_merchant_notification,
        description="Send a notification or documentation link to a merchant. Use this for low-risk auto-fixes."
    ),
    Tool(
        name="escalate_to_engineer",
        func=escalate_to_engineer,
        description="Escalate a high-risk or uncertain issue to an on-call engineer for manual review."
    ),
    Tool(
        name="update_documentation",
        func=update_documentation,
        description="Update migration documentation when a gap is discovered."
    ),
    Tool(
        name="check_payment_gateway_health",
        func=check_payment_gateway_health,
        description="Check the health and performance of payment gateways. Returns latency, error rates, and recommendations."
    )
]
