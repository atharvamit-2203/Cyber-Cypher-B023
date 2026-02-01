"""
Cyber Cypher - AI-Powered Self-Healing Support System
FastAPI backend with LangChain agents and LangSmith tracing
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Dict
import asyncio
import os
from datetime import datetime
import json
import psycopg2
import urllib.parse
from pydantic import BaseModel

from config import settings

# Set environment variables for LangChain/OpenAI before importing agents
import os
os.environ["OPENAI_API_KEY"] = settings.openai_api_key
os.environ["LANGCHAIN_TRACING_V2"] = str(settings.langchain_tracing_v2)
os.environ["LANGCHAIN_API_KEY"] = settings.langchain_api_key
os.environ["LANGCHAIN_PROJECT"] = settings.langchain_project
os.environ["LANGCHAIN_ENDPOINT"] = settings.langchain_endpoint

from models.schemas import (
    Ticket, Merchant, AgentAction, AgentState, ChatMessage, Issue
)

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str # 'customer' or 'engineer'
from agents.agent_system import agent_graph, llm
from agents.tools import tools


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


# Background agent monitoring task
async def run_agent_monitoring():
    """Continuously run agent to monitor for issues"""
    while True:
        try:
            print("🤖 Agent: Scanning for issues...")
            
            # Run the agent graph in a thread to avoid blocking the event loop
            result = await asyncio.to_thread(
                agent_graph.invoke,
                {
                    "signals": [],
                    "analysis": {},
                    "recommended_actions": [],
                    "requires_approval": False,
                    "messages": [],
                    "scan_time_ms": 0.0
                }
            )
            
            # Broadcast results to connected clients
            analysis = result.get("analysis", {})
            await manager.broadcast({
                "type": "agent_update",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "root_cause": analysis.get("root_cause", "Analyzing..."),
                    "summary": analysis.get("summary", ""),
                    "actions": result.get("recommended_actions", []),
                    "confidence": analysis.get("confidence", 0.0),
                    "requires_approval": result.get("requires_approval", False),
                    "scan_time_ms": result.get("scan_time_ms", 0.0)
                }
            })
            
            print(f"✅ Agent scan complete ({result.get('scan_time_ms', 0):.0f}ms). Confidence: {analysis.get('confidence', 0.0)}")
            
        except Exception as e:
            print(f"❌ Agent error: {e}")
        
        # Wait before next scan
        await asyncio.sleep(30)  # Scan every 30 seconds


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background agent monitoring
    task = asyncio.create_task(run_agent_monitoring())
    yield
    # Shutdown: Cancel background task
    task.cancel()


# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Autonomous AI agent for SaaS migration support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= API Endpoints =============

@app.get("/")
async def root():
    return {
        "message": "Cyber Cypher Agent System",
        "status": "operational",
        "langsmith_enabled": settings.langchain_tracing_v2
    }


@app.get("/api/merchants")
async def get_merchants() -> List[Merchant]:
    """Get all merchants and their migration status"""
    # Mock data - replace with database query
    return [
        Merchant(
            id="m1",
            name="Fashion Hub",
            migration_step=3,
            total_steps=5,
            status="issues",
            issues=[
                Issue(
                    id="i1",
                    type="webhook",
                    severity="high",
                    title="Webhook Signature Mismatch",
                    description="Order confirmation webhooks failing",
                    affected_count=45,
                    detected_at=datetime.now(),
                    status="analyzing"
                )
            ]
        )
    ]


@app.get("/api/tickets")
async def get_tickets() -> List[Ticket]:
    """Get support tickets"""
    return [
        Ticket(
            id="t1",
            merchant_id="m1",
            merchant_name="Fashion Hub",
            title="Checkout not working",
            description="Customers can't complete checkout",
            priority="critical",
            status="open",
            created_at=datetime.now(),
            ai_suggestion="Payment gateway timeout detected. Recommend switching to backup."
        )
    ]


@app.get("/api/agent/actions")
async def get_agent_actions() -> List[AgentAction]:
    """Get recent agent actions"""
    return [
        AgentAction(
            id="a1",
            type="auto",
            title="Send Webhook Configuration Guide",
            description="Auto-send updated docs to Fashion Hub",
            confidence=0.95,
            risk="low",
            status="executed",
            reasoning=[
                "Pattern: 15 merchants with same error",
                "Known issue from migration step 3",
                "Low risk: documentation only"
            ],
            impact="Resolves issue for ~45 customers",
            timestamp=datetime.now()
        )
    ]

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Secure login against Supabase database"""
    # Use environment variables for DB connection
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "Atharv@2203") # Fallback to user provided if not in env
    encoded_password = urllib.parse.quote_plus(db_password)
    db_url = f"postgresql://postgres:{encoded_password}@db.miklfwbuhqogjnztmmgo.supabase.co:5432/postgres"

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        table = "customers" if request.role == "customer" else "engineers"
        query = f"SELECT id, name, email FROM {table} WHERE email = %s AND password = %s"
        cur.execute(query, (request.email, request.password))
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if user:
            return {
                "status": "success",
                "user": {
                    "id": user[0],
                    "name": user[1],
                    "email": user[2],
                    "role": request.role
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

@app.post("/api/simulate/issue")
async def simulate_issue(issue: Issue):
    """Simulate a new production issue by injecting it into mock storage"""
    from agents.tools import MOCK_API_LOGS, MOCK_TICKETS
    
    if issue.type == "ticket":
        MOCK_TICKETS.append({
            "id": f"TICK-{len(MOCK_TICKETS) + 1:03d}",
            "merchant": issue.merchant_id,
            "issue": issue.description,
            "priority": "high",
            "created_at": datetime.now().isoformat()
        })
    else:
        MOCK_API_LOGS.append({
            "merchant": issue.merchant_id,
            "endpoint": "/payments/process",
            "status": 500,
            "error": issue.description,
            "count": 1,
            "timestamp": datetime.now().isoformat()
        })
    
    return {"status": "injected", "type": issue.type}


@app.post("/api/agent/trigger")
async def trigger_agent_scan():
    """Manually trigger an agent scan and broadcast results"""
    try:
        print("⚡ Manual Trigger: Scanning for issues...")
        result = agent_graph.invoke({
            "signals": [],
            "analysis": {},
            "recommended_actions": [],
            "requires_approval": False,
            "messages": [],
            "scan_time_ms": 0.0
        })
        
        analysis = result.get("analysis", {})
        payload = {
            "type": "agent_update",
            "data": {
                "timestamp": datetime.now().isoformat(),
                "root_cause": analysis.get("root_cause", "Analyzing..."),
                "summary": analysis.get("summary", ""),
                "actions": result.get("recommended_actions", []),
                "confidence": analysis.get("confidence", 0.0),
                "requires_approval": result.get("requires_approval", False),
                "scan_time_ms": result.get("scan_time_ms", 0.0)
            }
        }
        
        await manager.broadcast(payload)
        
        return {
            "status": "success",
            "data": payload["data"]
        }
    except Exception as e:
        print(f"❌ Manual Trigger Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/approve/{action_id}")
async def approve_action(action_id: str):
    """Approve a pending agent action"""
    # In production, execute the approved action
    return {
        "status": "approved",
        "action_id": action_id,
        "executed_at": datetime.now().isoformat()
    }


# ============= Chat & Persistence Utilities =============

def get_db_conn():
    """Helper to get a Supabase DB connection"""
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "Atharv@2203")
    encoded_password = urllib.parse.quote_plus(db_password)
    db_url = f"postgresql://postgres:{encoded_password}@db.miklfwbuhqogjnztmmgo.supabase.co:5432/postgres"
    return psycopg2.connect(db_url)

def save_chat_message(role: str, sender_id: str, message: str, chat_type: str = 'text', ticket_id: str = None, metadata: dict = None):
    """Save a chat message to Supabase chat_history table"""
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO chat_history (role, sender_id, message, type, ticket_id, metadata) VALUES (%s, %s, %s, %s, %s, %s)",
            (role, sender_id, message, chat_type, ticket_id, json.dumps(metadata) if metadata else None)
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"⚠️ Error saving chat message: {e}")

def get_chat_history(sender_id: str, limit: int = 10) -> List[tuple]:
    """Fetch the last N messages for a sender"""
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT role, message FROM chat_history WHERE sender_id = %s ORDER BY created_at ASC LIMIT %s",
            (sender_id, limit)
        )
        history = cur.fetchall()
        cur.close()
        conn.close()
        return history
    except Exception as e:
        print(f"⚠️ Error fetching chat history: {e}")
        return []

@app.post("/api/chat/merchant")
async def chat_with_merchant_assistant(message: str, merchant_id: str, user_email: str = "guest@example.com"):
    """Chat endpoint for merchant/customer AI assistant with memory and context"""
    from langchain.schema import HumanMessage, AIMessage, SystemMessage
    
    # 1. Fetch History
    history = get_chat_history(user_email)
    messages = [SystemMessage(content=f"You are an AI assistant helping a customer ({user_email}) with their migration to a headless store (Fashion Hub). Be empathetic and helpful.")]
    
    for h_role, h_text in history:
        if h_role == 'user':
            messages.append(HumanMessage(content=h_text))
        else:
            messages.append(AIMessage(content=h_text))
            
    # 2. Inject Context (Active Tickets)
    recent_tickets = MOCK_TICKETS[-3:] # Use mock or live data
    context = f"\nSystem Context: Active tickets for this user: {json.dumps(recent_tickets)}"
    
    # 3. Save User Message
    save_chat_message('user', user_email, message)
    
    # 4. Generate Response
    messages.append(HumanMessage(content=f"{message}\n{context}"))
    response = llm.invoke(messages)
    
    # 5. Save AI Response
    save_chat_message('ai', user_email, response.content)
    
    return {
        "role": "assistant",
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/chat/engineer")
async def chat_with_engineer_assistant(message: str, user_email: str = "engineer@cybercypher.com"):
    """Chat endpoint for engineer AI assistant with diagnostic context"""
    from langchain.schema import HumanMessage, AIMessage, SystemMessage
    
    # 1. Fetch History
    history = get_chat_history(user_email)
    messages = [SystemMessage(content="You are an expert DevOps AI assistant helping an engineer monitor a production migration. Provide technical, data-driven answers.")]
    
    for h_role, h_text in history:
        if h_role == 'user':
            messages.append(HumanMessage(content=h_text))
        else:
            messages.append(AIMessage(content=h_text))
            
    # 2. Inject Diagnostic Context
    log_summary = MOCK_API_LOGS[-5:]
    active_tickets = MOCK_TICKETS
    context = f"\nTECHNICAL SNAPSHOT:\nRecent logs: {json.dumps(log_summary)}\nActive tickets: {json.dumps(active_tickets)}\nSystem Status: DEGRADED"
    
    # 3. Save User Message
    save_chat_message('user', user_email, message)
    
    # 4. Generate Response
    messages.append(HumanMessage(content=f"{message}\n{context}"))
    response = llm.invoke(messages)
    
    # 5. Save AI Response
    save_chat_message('ai', user_email, response.content)
    
    return {
        "role": "assistant",
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }


# ============= WebSocket for Real-time Updates =============

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            # Echo back for now
            await websocket.send_json({"type": "ack", "message": "received"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ============= Health Check =============

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "langsmith": settings.langchain_tracing_v2,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
