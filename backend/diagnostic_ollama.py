import httpx
import json
import time
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage

def test_ollama():
    print("🚦 Starting Ollama Diagnostic...")
    
    # 1. Check if server is up
    url = "http://localhost:11434/api/tags"
    print(f"🔗 Testing connection to {url}...")
    try:
        resp = httpx.get(url, timeout=5)
        if resp.status_code == 200:
            print("✅ Ollama server is UP")
            models = [m['name'] for m in resp.json().get('models', [])]
            print(f"📦 Available models: {models}")
            if "llama3.2:latest" in models:
                print("✨ llama3.2:latest is READY")
            else:
                print("❌ llama3.2:latest NOT FOUND. Run 'ollama pull llama3.2:latest'")
        else:
            print(f"❌ Ollama server returned status {resp.status_code}")
    except Exception as e:
        print(f"❌ Could not connect to Ollama server: {e}")
        return

    # 2. Test LangChain invocation
    print("\n🧠 Testing LangChain + Ollama invocation...")
    llm = ChatOllama(model="llama3.2:latest", base_url="http://localhost:11434", timeout=30)
    
    start = time.time()
    try:
        print("⏳ Sending 'Hello' to model (this tests RAM/CPU speed)...")
        response = llm.invoke([HumanMessage(content="Hello, just say 'ready'")])
        duration = time.time() - start
        print(f"✅ Response received: '{response.content.strip()}'")
        print(f"⏱️  Time taken: {duration:.2f}s")
        if duration > 20:
            print("⚠️ WARNING: Your local model is very slow. The agent might time out.")
    except Exception as e:
        print(f"❌ LangChain invocation failed: {e}")

if __name__ == "__main__":
    test_ollama()
