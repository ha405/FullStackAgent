import json
import os
import time
import asyncio
from utils import *

class FrontendAgent:
    def __init__(self, output_dir: str, model: str = "gemini-2.5-pro"):
        self.model = model
        self.agent_name = "frontend_agent"
        self.svc = InMemorySessionService()
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    async def run(self, frontend_plan: dict) -> None:
        instruction = (
            "You are a frontend scaffolding assistant.\n"
            "INPUT: A JSON under 'frontendPlan' describing pages, components, styles, and behaviors.\n"
            "TASK: Return ONLY valid JSON with a single 'files' key whose value is an array of {path,content} objects.\n"
            "Do NOT output anything else."
        )
        agent = LlmAgent(
            name=self.agent_name,
            model=self.model,
            instruction=instruction,
            output_key="files_output"
        )

        session = await self.svc.create_session(
            app_name=self.agent_name,
            user_id="user1",
            session_id="session_frontend"
        )
        await self.svc.append_event(
            session,
            Event(
                invocation_id="seed-plan",
                author="system",
                timestamp=time.time(),
                content=Content(
                    role="system",
                    parts=[Part(text=json.dumps({"frontendPlan": frontend_plan}, indent=2))]
                ),
                actions=EventActions()
            )
        )

        runner = Runner(
            agent=agent,
            session_service=self.svc,
            app_name=self.agent_name
        )
        full_response = ""
        async for event in runner.run_async(
            user_id="user1",
            session_id="session_frontend",
            new_message=Content(role="user", parts=[Part(text="Generate project scaffold now.")])
        ):
            if event.content and event.content.parts and event.content.parts[0].text:
                full_response += event.content.parts[0].text
            if event.is_final_response():
                break

        if full_response.startswith("```json"):
            full_response = full_response[len("```json"):].lstrip("\n")
        if full_response.endswith("```"):
            full_response = full_response[:-3].rstrip("\n")

        manifest = json.loads(full_response)
        files = manifest["files"]
        for f in files:
            path = f["path"]
            content = f["content"]
            full_path = os.path.join(self.output_dir, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as fp:
                fp.write(content)


# if __name__ == "__main__":
#     sample_plan = {
#         "frontendPlan": {
#             "projectName": "MyApp",
#             "pages": [
#                 {
#                     "name": "Home",
#                     "components": [
#                         {"type":"Navbar","props":{"logo":"MyApp","links":["Home","About","Contact"]}},
#                         {"type":"Hero","props":{"title":"Welcome","subtitle":"Tagline"}},
#                         {"type":"Footer","props":{"text":"© 2025 MyApp Inc."}}
#                     ]
#                 }
#             ]
#         }
#     }
#     agent = FrontendAgent(output_dir=r"D:\Misc")
#     asyncio.run(agent.run(sample_plan["frontendPlan"]))