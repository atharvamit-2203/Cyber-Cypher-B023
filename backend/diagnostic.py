import traceback
import sys

print("Checking imports...")
try:
    import langchain
    print(f"langchain version: {langchain.__version__}")
    from langchain.tools import Tool
    print("Tool import successful")
except ImportError as e:
    print(f"ImportError: {e}")
    traceback.print_exc()
except Exception as e:
    print(f"General Error: {e}")
    traceback.print_exc()

print("\nChecking agents.tools...")
try:
    import agents.tools
    print("agents.tools import successful")
except Exception as e:
    print(f"agents.tools Error: {e}")
    traceback.print_exc()
