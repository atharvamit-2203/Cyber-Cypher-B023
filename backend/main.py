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

from config import settings
from models.schemas import (
    Ticket, Merchant, AgentAction, AgentState, ChatMessage, Issue
)
from agents.agent_system import agent_graph
from agents.tools import tools

# Set environment variables for LangSmith
os.environ["OPENAI_API_KEY"] = settings.openai_api_key
os.environ["LANGCHAIN_TRACING_V2"] = str(settings.langchain_tracing_v2)
os.environ["LANGCHAIN_API_KEY"] = settings.langchain_api_key
os.environ["LANGCHAIN_PROJECT"] = settings.langchain_project
os.environ["LANGCHAIN_ENDPOINT"] = settings.langchain_endpoint


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
            
            # Run the agent graph
            result = agent_graph.invoke({
                "signals": [],
                "patterns": [],
                "root_causes": [],
                "recommended_actions": [],
                "confidence": 0.0,
                "risk_level": "low",
                "requires_approval": False,
                "messages": []
            })
            
            # Broadcast results to connected clients
            await manager.broadcast({
                "type": "agent_update",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "patterns": result.get("patterns", []),
                    "actions": result.get("recommended_actions", []),
                    "confidence": result.get("confidence", 0.0),
                    "requires_approval": result.get("requires_approval", False)
                }
            })
            
            print(f"✅ Agent scan complete. Confidence: {result.get('confidence', 0.0)}")
            
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
    allow_origins=settings.cors_origins,
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


@app.post("/api/agent/trigger")
async def trigger_agent_scan():
    """Manually trigger an agent scan"""
    try:
        result = agent_graph.invoke({
            "signals": [],
            "patterns": [],
            "root_causes": [],
            "recommended_actions": [],
            "confidence": 0.0,
            "risk_level": "low",
            "requires_approval": False,
            "messages": []
        })
        
        return {
            "status": "success",
            "confidence": result.get("confidence", 0.0),
            "actions": result.get("recommended_actions", []),
            "requires_approval": result.get("requires_approval", False)
        }
    except Exception as e:
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


@app.post("/api/chat/merchant")
async def chat_with_merchant_assistant(message: str, merchant_id: str):
    """Chat endpoint for merchant AI assistant"""
    from langchain.schema import HumanMessage
    from langchain_openai import ChatOpenAI
    
    llm = ChatOpenAI(model="gpt-4-turbo-preview")
    
    response = llm.invoke([
        HumanMessage(content=f"""You are an AI assistant helping merchants with migration issues.
        Merchant: {merchant_id}
        Question: {message}
        
        Provide helpful guidance about migration steps, common issues, and solutions.""")
    ])
    
    return {
        "role": "assistant",
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/chat/engineer")
async def chat_with_engineer_assistant(message: str):
    """Chat endpoint for engineer AI assistant"""
    from langchain.schema import HumanMessage
    from langchain_openai import ChatOpenAI
    
    llm = ChatOpenAI(model="gpt-4-turbo-preview")
    
    response = llm.invoke([
        HumanMessage(content=f"""You are an AI assistant helping engineers analyze patterns and troubleshoot issues.
        
        Engineer question: {message}
        
        Provide technical analysis, pattern detection, and recommendations.""")
    ])
    
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
