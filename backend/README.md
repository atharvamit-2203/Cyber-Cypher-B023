# Cyber Cypher - Backend

AI-Powered Self-Healing Support System using LangChain, LangGraph, and LangSmith.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. **Run the server:**
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Architecture

### Multi-Agent System (LangGraph)

```
Observer Agent → Reasoner Agent → Decision Maker → Executor Agent
     ↓               ↓                  ↓               ↓
  Signals        Patterns          Actions         Execute
  (Tickets,      (Root            (Auto/          (Send docs,
   API logs)      causes)          Recommend/       Escalate)
                                   Escalate)
```

### Agent Tools

- `query_support_tickets` - Search ticket database
- `check_api_logs` - Monitor API failures
- `detect_error_patterns` - Find recurring issues
- `get_merchant_migration_status` - Check migration progress
- `send_merchant_notification` - Auto-send docs
- `escalate_to_engineer` - Page on-call engineer
- `check_payment_gateway_health` - Monitor gateways

### LangSmith Integration

All agent actions are automatically traced to LangSmith:
- Full decision chain visibility
- Confidence scores
- Tool usage logs
- Reasoning transparency

## API Endpoints

- `GET /` - Health check
- `GET /api/merchants` - List merchants
- `GET /api/tickets` - Support tickets
- `GET /api/agent/actions` - Agent actions
- `POST /api/agent/trigger` - Manual agent scan
- `POST /api/agent/approve/{action_id}` - Approve action
- `POST /api/chat/merchant` - Merchant AI chat
- `POST /api/chat/engineer` - Engineer AI chat
- `WS /ws` - WebSocket for real-time updates

## Environment Variables

```
OPENAI_API_KEY=your-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=cyber-cypher-agent
```

## Features

✅ Autonomous agent loop (runs every 30s)
✅ Pattern detection across merchants
✅ Risk-based decision making
✅ Auto-execute low-risk actions
✅ Escalate high-risk actions
✅ LangSmith tracing for explainability
✅ Real-time WebSocket updates
✅ AI chat assistants for merchants & engineers
