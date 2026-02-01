"""Unified Analyst Agent using LangGraph"""
from typing import TypedDict, List, Dict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from .tools import (
    query_support_tickets,
    check_api_logs,
    detect_error_patterns,
    get_merchant_migration_status,
    send_merchant_notification,
    escalate_to_engineer,
    update_documentation,
    check_payment_gateway_health
)
import json
import time

# LLM Configuration
from config import settings

if settings.llm_provider == "ollama":
    llm = ChatOllama(
        model=settings.ollama_model,
        base_url=settings.ollama_base_url,
        temperature=0.1,  # Lower temperature for faster, more predictable output
        timeout=180,
        num_predict=512,  # Limit output length for speed
        num_ctx=2048      # Limit context window
    )
else:
    llm = ChatOpenAI(temperature=0.7, model="gpt-4o-mini")

class AgentState(TypedDict):
    """State shared across the agent system"""
    signals: List[Dict]
    analysis: Dict
    recommended_actions: List[Dict]
    messages: List[Dict]
    requires_approval: bool
    scan_time_ms: float

def analyst_agent(state: AgentState) -> AgentState:
    """Unified agent that observes, reasons, and decides in one pass to save latency"""
    print("\n   --- Analyst Node Started ---")
    start_time = time.time()
    
    # 1. Collect Data (Tools are local and fast)
    print("   🔍 Collecting signals from tools...")
    tickets = query_support_tickets("checkout issues")
    print("      -> Tickets collected")
    logs = check_api_logs()
    print("      -> Logs collected")
    patterns = detect_error_patterns()
    print("      -> Patterns collected")
    print(f"   📊 Collected: {len(json.loads(tickets))} tickets, {len(json.loads(logs))} logs")
    
    # 2. Unified Reasoning Prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Role: Cyber Analyst. Task: Analyze signals. Output: JSON ONLY. No text before/after. Fields: detected_signals, root_cause, confidence, actions (type, description, risk_level, requires_approval)."),
        ("human", "TICKETS: {tickets}\nLOGS: {logs}\nPATTERNS: {patterns}\nOutput JSON:"),
    ])
    
    # Remove pretty printing from inputs to save tokens
    tickets_compact = json.dumps(json.loads(tickets))
    logs_compact = json.dumps(json.loads(logs))
    patterns_compact = json.dumps(json.loads(patterns))
    
    chain = prompt | llm
    
    try:
        print(f"   🧠 Invoking LLM ({settings.ollama_model})...")
        llm_start = time.time()
        result = chain.invoke({
            "tickets": tickets_compact,
            "logs": logs_compact,
            "patterns": patterns_compact
        })
        print(f"   📉 LLM Response received in {time.time() - llm_start:.2f}s")
        
        # Robust JSON extraction
        content = result.content.strip()
        
        # Look for the first '{' and last '}'
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx:end_idx+1]
        else:
            json_str = content

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as je:
            print(f"   ⚠️ Initial JSON parse failed: {je}. Trying to clean content...")
            # Fallback: simple cleanup of common LLM artifacts
            json_str = json_str.replace("'", '"').replace('True', 'true').replace('False', 'false')
            data = json.loads(json_str)
            
        print(f"   ✅ JSON parsed successfully")
        
        state["analysis"] = {
            "root_cause": data.get("root_cause", "Unknown"),
            "confidence": data.get("confidence", 0.5),
            "summary": data.get("detected_signals", "")
        }
        state["recommended_actions"] = data.get("actions", [])
        state["requires_approval"] = any(a.get("requires_approval", False) for a in state["recommended_actions"])
        state["messages"] = state.get("messages", []) + [
            {"role": "analyst", "content": content}
        ]
    except Exception as e:
        print(f"   ❌ Error in analyst agent: {e}")
        print(f"   ❌ Raw Content that failed to parse: {result.content if 'result' in locals() else 'No result'}")
        # Fallback state
        state["analysis"] = {"root_cause": "Error parsing AI response", "confidence": 0.0}
        state["recommended_actions"] = []
        state["requires_approval"] = False
        
    state["scan_time_ms"] = (time.time() - start_time) * 1000
    return state

def executor_agent(state: AgentState) -> AgentState:
    """Execute non-blocking or approved actions"""
    actions = state.get("recommended_actions", [])
    
    for action in actions:
        # Only execute if it DOES NOT require approval
        if not action.get("requires_approval", False):
            if action["type"] == "send_docs":
                send_merchant_notification(
                    merchant_id="merchant_1",
                    message=action["description"]
                )
            elif action["type"] == "escalate":
                escalate_to_engineer(
                    issue_summary=action["description"],
                    severity="high",
                    recommended_action="Manual review needed"
                )
            
            state["messages"] = state.get("messages", []) + [
                {"role": "executor", "content": f"Executed: {action['description']}"}
            ]
    
    return state

def should_wait_for_approval(state: AgentState) -> str:
    """Router to determine if we should stop for human approval"""
    if state.get("requires_approval", False):
        return "end"
    return "continue"

# Build the agent graph
def create_agent_graph():
    """Create the optimized one-pass agent system"""
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("analyst", analyst_agent)
    workflow.add_node("executor", executor_agent)
    
    # Add edges
    workflow.set_entry_point("analyst")
    
    workflow.add_conditional_edges(
        "analyst",
        should_wait_for_approval,
        {
            "continue": "executor",
            "end": END
        }
    )
    
    workflow.add_edge("executor", END)
    
    return workflow.compile()

# Create the compiled graph
agent_graph = create_agent_graph()

def run_agent_system() -> Dict:
    """Run the optimized multi-agent system"""
    initial_state = {
        "signals": [],
        "analysis": {},
        "recommended_actions": [],
        "messages": [],
        "requires_approval": False,
        "scan_time_ms": 0.0
    }
    
    result = agent_graph.invoke(initial_state)
    return result
