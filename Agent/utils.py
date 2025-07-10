import os
import re
from dotenv import load_dotenv
import google.generativeai as genai
import json
import anyio
import time
from dotenv import load_dotenv
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from google.adk.events import Event, EventActions
from mcp.shared.exceptions import McpError


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
FIGMA_TOKEN = os.getenv("FIGMA_TOKEN")
if not (GOOGLE_API_KEY and FIGMA_TOKEN):
    print("❌ GOOGLE_API_KEY and FIGMA_TOKEN must be set")
    exit(1)
genai.configure(api_key=GOOGLE_API_KEY)


script = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "Figma-MCP", "dist", "main.js"
))
params = StdioServerParameters(
    command="node",
    args=[script, "--figma-token", FIGMA_TOKEN],
    env=os.environ
)

def extract_figma_key(prompt: str) -> str | None:
    m = re.search(r"figma\.com/(?:file|design)/([A-Za-z0-9]{22})", prompt)
    return m.group(1) if m else None

def build_tool_metadata(tools):
    meta = {}
    for t in tools:
        schema = t.inputSchema or {}
        props = schema.get('properties', {})
        required = set(schema.get('required', []))
        args_info = {}
        for arg, info in props.items():
            args_info[arg] = {
                'type': info.get('type', ''),
                'desc': info.get('description', ''),
                'required': arg in required,
                'enum': info.get('enum', None)
            }
        meta[t.name] = args_info
    return meta
