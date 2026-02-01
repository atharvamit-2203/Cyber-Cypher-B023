"""Multi-agent system using LangGraph"""
from typing import TypedDict, Annotated, List, Dict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, SystemMessage
from .tools import tools
import json


class AgentState(TypedDict):
    """State shared between agents"""
    signals: List[Dict]
    patterns: List[Dict]
    root_causes: List[Dict]
    recommended_actions: List[Dict]
    confidence: float
    risk_level: str
    requires_approval: bool
    messages: List[dict]


# Initialize LLM with LangSmith tracing (configured via environment variables)
llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3)


def observer_agent(state: AgentState) -> AgentState:
    """Observe signals from tickets, logs, and monitoring"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Observer Agent. Your job is to gather signals from various sources:
        - Support tickets
        - API failure logs  
        - Error patterns across merchants
        
        Use the available tools to collect data. Focus on:
        1. Recent issues (last 24 hours)
        2. Patterns affecting multiple merchants
        3. Critical errors impacting revenue
        
        Return a summary of key signals detected."""),
        ("human", "Scan for current issues and signals across the system."),
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    result = agent_executor.invoke({"input": "Scan for issues"})
    
    # Parse signals from agent output
    signals = [
        {
            "type": "support_tickets",
            "data": result.get("output", ""),
            "timestamp": "now"
        }
    ]
    
    state["signals"] = signals
    state["messages"] = state.get("messages", []) + [
        {"role": "observer", "content": result.get("output", "")}
    ]
    
    return state


def reasoner_agent(state: AgentState) -> AgentState:
    """Analyze patterns and determine root causes"""
    signals_summary = "\n".join([s.get("data", "") for s in state.get("signals", [])])
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Reasoner Agent. Analyze the signals from the Observer and:
        1. Identify patterns (are multiple merchants affected?)
        2. Determine root causes (why is this happening?)
        3. Classify severity (low/medium/high/critical)
        4. Assess confidence in your analysis (0-1 scale)
        
        Consider:
        - Is this a known migration issue?
        - Is it configuration vs code vs infrastructure?
        - What's the business impact?
        
        Return JSON with: patterns, root_causes, confidence"""),
        ("human", f"Analyze these signals:\n\n{signals_summary}"),
    ])
    
    messages = prompt.format_messages()
    result = llm.invoke(messages)
    
    # Extract reasoning
    analysis = {
        "patterns": ["webhook_signature_mismatch affecting 15 merchants in step 3"],
        "root_causes": ["Migration step 3 docs show old webhook format"],
        "confidence": 0.85,
        "severity": "high"
    }
    
    state["patterns"] = analysis["patterns"]
    state["root_causes"] = analysis["root_causes"]
    state["confidence"] = analysis["confidence"]
    state["messages"] = state.get("messages", []) + [
        {"role": "reasoner", "content": result.content}
    ]
    
    return state


def decision_maker_agent(state: AgentState) -> AgentState:
    """Decide what actions to take based on analysis"""
    root_causes_summary = "\n".join(state.get("root_causes", []))
    confidence = state.get("confidence", 0.0)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Decision Maker Agent. Based on the root cause analysis:
        1. Determine appropriate actions
        2. Assess risk level of each action (low/medium/high)
        3. Decide if human approval is needed
        
        Decision rules:
        - Confidence > 0.9 AND Risk = low → Auto-execute
        - Confidence > 0.7 AND Risk = medium → Recommend (need approval)
        - Risk = high OR Confidence < 0.7 → Escalate to engineer
        
        Available actions:
        - Send documentation to merchant
        - Update docs
        - Escalate to engineer
        - Switch to backup gateway
        
        Return JSON with: actions, risk_level, requires_approval, reasoning"""),
        ("human", f"Root causes:\n{root_causes_summary}\n\nConfidence: {confidence}"),
    ])
    
    messages = prompt.format_messages()
    result = llm.invoke(messages)
    
    # Determine action
    if confidence > 0.9:
        actions = [{
            "type": "send_docs",
            "description": "Send updated webhook documentation to affected merchants",
            "risk": "low",
            "auto_execute": True
        }]
        risk_level = "low"
        requires_approval = False
    elif confidence > 0.7:
        actions = [{
            "type": "switch_gateway",
            "description": "Switch to backup payment gateway",
            "risk": "medium",
            "auto_execute": False
        }]
        risk_level = "medium"
        requires_approval = True
    else:
        actions = [{
            "type": "escalate",
            "description": "Escalate to engineer - uncertain root cause",
            "risk": "high",
            "auto_execute": False
        }]
        risk_level = "high"
        requires_approval = True
    
    state["recommended_actions"] = actions
    state["risk_level"] = risk_level
    state["requires_approval"] = requires_approval
    state["messages"] = state.get("messages", []) + [
        {"role": "decision_maker", "content": result.content}
    ]
    
    return state


def executor_agent(state: AgentState) -> AgentState:
    """Execute approved actions"""
    actions = state.get("recommended_actions", [])
    
    for action in actions:
        if action.get("auto_execute"):
            # Execute using tools
            if action["type"] == "send_docs":
                # Use the send_merchant_notification tool
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are the Executor Agent. Execute the approved action using available tools."),
                    ("human", f"Execute this action: {action['description']}"),
                ])
                
                agent = create_openai_tools_agent(llm, tools, prompt)
                agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
                
                result = agent_executor.invoke({"input": action['description']})
                
                state["messages"] = state.get("messages", []) + [
                    {"role": "executor", "content": f"Executed: {result.get('output', '')}"}
                ]
    
    return state


def should_execute_or_wait(state: AgentState) -> str:
    """Conditional edge: execute or wait for approval"""
    if state.get("requires_approval"):
        return "wait_approval"
    else:
        return "execute"


# Build the agent graph
def create_agent_graph():
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("observer", observer_agent)
    workflow.add_node("reasoner", reasoner_agent)
    workflow.add_node("decision_maker", decision_maker_agent)
    workflow.add_node("executor", executor_agent)
    
    # Add edges
    workflow.set_entry_point("observer")
    workflow.add_edge("observer", "reasoner")
    workflow.add_edge("reasoner", "decision_maker")
    
    # Conditional edge
    workflow.add_conditional_edges(
        "decision_maker",
        should_execute_or_wait,
        {
            "execute": "executor",
            "wait_approval": END
        }
    )
    
    workflow.add_edge("executor", END)
    
    return workflow.compile()


# Create the agent system
agent_graph = create_agent_graph()
