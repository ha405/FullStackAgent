from utils import *
import json
import re
import time

class FigAgent:
    def __init__(self, user_id="user1", session_id="session1", model="gemini-2.5-pro"):
        self.user_id = user_id
        self.session_id = session_id
        self.model = model
        self.agent_name = "figma_agent"

    async def run(self, prompt):
        file_key = extract_figma_key(prompt)
        if not file_key:
            print("No valid Figma file key found in the prompt.")
            return

        async with stdio_client(params) as (rd, wr):
            async with ClientSession(rd, wr) as mcp_sess:
                await mcp_sess.initialize()
                print("MCP stdio session initialized.")

                toolset = await mcp_sess.list_tools()
                tools = toolset.tools
                tool_names = [t.name for t in tools]
                tool_args_meta = build_tool_metadata(tools)

                instruction = (
                    "You are a UI planning assistant. Your job is to interactively extract Figma design metadata and then emit a comprehensive `frontendPlan` JSON.\n\n"
                    "DATA GATHERING PHASE:\n"
                    "- Inspect the provided tool metadata at runtime and decide which API calls to make.\n"
                    "- Output only well-formed JSON tool-call objects, one per line, e.g.:\n"
                    "  { \"tool\": \"<toolName>\", \"arguments\": { /* according to schema */ } }\n"
                    "- You may include multiple such JSON objects in your response.\n\n"
                    "PLANNING PHASE:\n"
                    "- After gathering all necessary data, output exactly one JSON block:\n"
                    "  { \"frontendPlan\": { /* detailed UI plan */ } }\n"
                    "- Do NOT include any extra text, comments, or additional calls at this stage.\n"
                )

                agent = LlmAgent(
                    name=self.agent_name,
                    model=self.model,
                    instruction=instruction,
                    output_key="frontend_plan"
                )

                svc = InMemorySessionService()
                session = await svc.create_session(
                    app_name=self.agent_name,
                    user_id=self.user_id,
                    session_id=self.session_id,
                )

                tools_json = json.dumps({
                    "available_tools": tool_names,
                    "argument_schemas": tool_args_meta
                }, indent=2)

                await svc.append_event(
                    session,
                    Event(
                        invocation_id="init-tools",
                        author="system",
                        timestamp=time.time(),
                        content=Content(
                            role="system",
                            parts=[Part(text=f"Tool metadata:\n{tools_json}")]
                        ),
                        actions=EventActions()
                    )
                )

                runner = Runner(agent=agent, session_service=svc, app_name=self.agent_name)
                next_input = prompt
                try:
                    while True:
                        async for event in runner.run_async(
                            user_id=self.user_id,
                            session_id=self.session_id,
                            new_message=Content(role="user", parts=[Part(text=next_input)])
                        ):
                            if not event.is_final_response():
                                continue

                            raw_text = event.content.parts[0].text.strip()

                            json_blobs = re.findall(r'\{[\s\S]*?\}(?=\s*$)', raw_text)

                            if not json_blobs:
                                print("Invalid JSON. Got:\n", raw_text)
                                return

                            final_plan = None
                            for blob in json_blobs:
                                try:
                                    call = json.loads(blob)
                                except json.JSONDecodeError:
                                    print("Skipping invalid JSON block:\n", blob)
                                    continue

                                if call.get("frontendPlan"):
                                    final_plan = call
                                    continue

                                if call.get("tool") and call.get("arguments") is not None:
                                    name = call["tool"]
                                    args = call["arguments"]
                                    tool = next((t for t in tools if t.name == name), None)
                                    if not tool:
                                        print(f"Tool '{name}' not found.")
                                        return
                                    tool_event = await mcp_sess.call_tool(name=name, arguments=args)
                                    result = tool_event.content[0].text if tool_event.content else ""
                                    try:
                                        parsed_result = json.loads(result)
                                    except:
                                        parsed_result = result
                                    next_input = json.dumps({"tool": name, "result": parsed_result})
                                    print(f"Tool '{name}' called.")
                                else:
                                    print("Unrecognized JSON object:\n", call)

                            if final_plan:
                                print("Final frontend_plan generated:")
                                print(json.dumps(final_plan, indent=2))
                                return

                except McpError as e:
                    print("MCP error:", e)

def main():
    import anyio
    prompt = input("Enter your request: ")
    agent = FigAgent()
    anyio.run(agent.run, prompt)

if __name__ == "__main__":
    main()