from utils import *

async def run_figma_agent():
    prompt = input("Enter your request: ")
    file_key = extract_figma_key(prompt)
    if not file_key:
        print("No valid Figma file key found in the prompt.")
        return

    async with stdio_client(params) as (rd, wr):
        async with ClientSession(rd, wr) as mcp_sess:
            await mcp_sess.initialize()
            print("✅ MCP stdio session initialized.")

            toolset = await mcp_sess.list_tools()
            tools = toolset.tools
            tool_names = [t.name for t in tools]
            tool_args_meta = build_tool_metadata(tools)

            instruction = (
                "You are a helpful assistant. Use only the available tools. Get comments from the file "
                "When calling a tool, use *exactly* the argument names as shown in the tool schema (case-sensitive) like if its fileKey then output fileKey and not file_key. When calling a tool, output *only* JSON:\n"
                "{ \"tool\": \"TOOL_NAME\", \"arguments\": { ... } }\n"
                "No extra text or questions."
                "If you dont find any comments exit"
            )
            agent = LlmAgent(
                name="figma_agent",
                model="gemini-2.0-flash",
                instruction=instruction,
                output_key="frontend_plan"
            )

            svc = InMemorySessionService()
            session = await svc.create_session(
                app_name="figma_agent",
                user_id="user1",
                session_id="session1",
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
                        parts=[Part(text=f"Tool metadata:\n```json\n{tools_json}\n```")]
                    ),
                    actions=EventActions()
                )
            )

            runner = Runner(agent=agent, session_service=svc, app_name="figma_agent")

            # Manual loop
            next_input = prompt
            full = ""
            try:
                while True:
                    async for event in runner.run_async(
                        user_id="user1",
                        session_id="session1",
                        new_message=Content(role="user", parts=[Part(text=next_input)])
                    ):
                        if event.partial and event.content:
                            full += event.content.parts[0].text
                        if not event.is_final_response():
                            continue

                        text = event.content.parts[0].text.strip()
                        # print("LLM→", text)
                        match = re.search(r"\{[\s\S]*\}", text)
                        if not match and event.is_final_response():
                            print("LLM final message (not a tool call):", text)
                            return
                        json_block = match.group(0)

                        try:
                            call = json.loads(json_block)
                            name = call["tool"]
                            args = call.get("arguments", {})
                        except Exception:
                            print("Invalid tool call. Got:", full or text)
                            break

                        tool = next((t for t in tools if t.name == name), None)
                        if not tool:
                            print(f"Tool '{name}' not found.")
                            return

                        # print(f"Calling tool '{name}' with arguments:", args)
                        tool_event = await mcp_sess.call_tool(name=name, arguments=args)
                        # print(f"📦 Raw tool_event:\n{tool_event!r}")

                        if tool_event.content and len(tool_event.content) > 0:
                            result = tool_event.content[0].text
                            print(f"Tool '{name}' returned:", result)
                        else:
                            print(f"⚠️ Tool '{name}' returned no text content.")

                        next_input = json.dumps({"tool": name, "result": result if 'result' in locals() else "no result"})
                        full = ""
                        break
            except McpError as e:
                print("MCP error:", e)


if __name__ == "__main__":
    anyio.run(run_figma_agent)
