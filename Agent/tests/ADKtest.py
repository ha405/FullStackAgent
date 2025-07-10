import os
import json # <-- Import the json library
import asyncio
from dotenv import load_dotenv

from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

import google.generativeai as genai
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
FIGMA_FILE_KEY = os.getenv("FIGMA_FILE_KEY")
FIGMA_TOKEN = os.getenv("FIGMA_TOKEN")

if not all([GOOGLE_API_KEY, FIGMA_FILE_KEY, FIGMA_TOKEN]):
    print("❌ GOOGLE_API_KEY, FIGMA_FILE_KEY, and FIGMA_TOKEN must be set in .env")
    exit(1)

genai.configure(api_key=GOOGLE_API_KEY)


async def figma_get_file_tool(fileKey: str) -> str:
    print("🚀 Spawning MCP server via stdio...")

    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    server_script_path = os.path.normpath(
        os.path.join(
            current_script_dir,
            '..',
            'Figma-MCP',
            'dist',
            'main.js'
        )
    )

    if not os.path.exists(server_script_path):
        raise FileNotFoundError(f"Server script not found at: {server_script_path}")

    server_params = StdioServerParameters(
        command="node",
        args=[
            server_script_path,
            "--figma-token",
            FIGMA_TOKEN
        ]
    )

    async with stdio_client(server_params) as (rd, wr):
        async with ClientSession(rd, wr) as session:
            await session.initialize()
            print("✅ MCP stdio session initialized.")

            print(f"📞 Calling tool 'figma_get_file' with key: {fileKey}")
            result = await session.call_tool("figma_get_file", {"fileKey": fileKey})

            # --- START OF THE FIX ---
            # 1. Get the raw JSON string from the tool's response
            raw_json_string = result.content[0].text

            # 2. Parse the JSON string into a Python dictionary
            file_data = json.loads(raw_json_string)
            print(file_data)
            # 3. Extract only the 'name' field that the LLM needs
            file_name = file_data.get('name')

            # 4. Return just the file name (or a helpful message if not found)
            if file_name:
                print(f"✅ Tool extracted file name: '{file_name}'")
                return file_name
            else:
                return "Error: Could not find the 'name' field in the Figma API response."
            # --- END OF THE FIX ---


figma_agent = LlmAgent(
    name="figma_stdio_agent",
    model="gemini-1.5-flash-latest",
    tools=[figma_get_file_tool],
    instruction="You are a helpful assistant. Use the figma_get_file_tool to fetch metadata about a Figma file when asked.",
    output_key="figma_tool_result"
)


async def main():
    session_service = InMemorySessionService()
    runner = Runner(
        agent=figma_agent,
        session_service=session_service,
        app_name="figma_stdio_app"
    )

    await session_service.create_session(
        app_name=runner.app_name,
        user_id="test-user",
        session_id="test-session"
    )

    prompt = f'What is the name of the Figma file with key "{FIGMA_FILE_KEY}"?'
    print(f">>> Prompt: {prompt}")
    user_msg = Content(role="user", parts=[Part(text=prompt)])

    async for e in runner.run_async(
        user_id="test-user",
        session_id="test-session",
        new_message=user_msg
    ):
        if e.is_final_response() and e.content:
            print(f"\n<<< Final Answer: {e.content.parts[0].text}")
            break

if __name__ == "__main__":
    asyncio.run(main())