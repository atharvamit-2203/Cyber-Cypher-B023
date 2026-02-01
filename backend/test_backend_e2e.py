import asyncio
import websockets
import json
import httpx
import time

BACKEND_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws"

async def test_e2e_flow():
    print("🚀 Starting End-to-End Backend Test...")
    
    # 1. Connect to WebSocket
    try:
        async with websockets.connect(WS_URL) as websocket:
            print("✅ Connected to WebSocket")
            
            # 2. Simulate an order failure (api issue)
            print("\n🛒 Simulating Order Failure: 'Gateway Timeout'...")
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"{BACKEND_URL}/api/simulate/issue", json={
                    "merchant_id": "Fashion Hub",
                    "type": "api",
                    "description": "Critical Gateway Timeout during checkout process",
                    "severity": "critical",
                    "title": "Payment Processing Failure"
                })
                print(f"📥 Simulation Response: {resp.json()}")
                
                # 3. Trigger immediate agent scan
                print("\n🧠 Triggering Agent Analysis...")
                trigger_resp = await client.post(f"{BACKEND_URL}/api/agent/trigger")
                print(f"📥 Trigger Response: Scan initiated (Confidence: {trigger_resp.json()['data']['confidence']})")
            
            # 4. Listen for real-time update on WebSocket
            print("\n⏳ Waiting for Real-time Signal on WebSocket...")
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                
                if data.get("type") == "agent_update":
                    update = data["data"]
                    print("\n🚨 REAL-TIME SIGNAL RECEIVED!")
                    print(f"🕒 Timestamp: {update['timestamp']}")
                    print(f"🔍 Root Cause: {update['root_cause']}")
                    print(f"🛡️ Confidence: {update['confidence']:.2f}")
                    print(f"⚡ Scan Time: {update['scan_time_ms']:.0f}ms")
                    print("\n📝 Actions Suggested:")
                    for action in update["actions"]:
                        print(f"   - [{action['risk_level'].upper()}] {action['description']} (Requires Approval: {action['requires_approval']})")
                    break
                    
    except Exception as e:
        print(f"❌ Test Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_e2e_flow())
