# BackendAgent.py

import os
import json
import time
import asyncio

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from google.adk.events import Event, EventActions


class BackendAgent:
    def __init__(self, output_dir: str, model: str = "gemini-2.5-pro"):
        self.model = model
        self.agent_name = "backend_agent"
        self.svc = InMemorySessionService()
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    async def run(self,
                  frontend_files: list[dict],
                  backend_prompt: str
                  ) -> None:
        instruction = (
            "You are a backend scaffolding assistant.\n"
            "INPUT:\n"
            "  1) A JSON array `frontendFiles` describing the project's generated frontend files.\n"
            "  2) A user prompt describing the desired backend features.\n"
            "TASK:\n"
            "  Return ONLY valid JSON with a single key `files` whose value is an array of "
            "{path,content} objects representing backend files (e.g. server code, routes, models).\n"
            "  Do NOT output anything else."
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
            session_id="session_backend"
        )

        payload = {
            "frontendFiles": frontend_files,
            "backendPrompt": backend_prompt
        }

        await self.svc.append_event(
            session,
            Event(
                invocation_id="seed-input",
                author="system",
                timestamp=time.time(),
                content=Content(
                    role="system",
                    parts=[Part(text=json.dumps(payload, indent=2))]
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
            session_id="session_backend",
            new_message=Content(
                role="user",
                parts=[Part(text="Generate backend scaffold now.")]
            )
        ):
            if event.content and event.content.parts and event.content.parts[0].text:
                full_response += event.content.parts[0].text
            if event.is_final_response():
                break

        if full_response.startswith("```json"):
            full_response = full_response[len("```json"):].lstrip()
        if full_response.endswith("```"):
            full_response = full_response[:-3].rstrip()

        manifest = json.loads(full_response)
        files = manifest.get("files", [])
        for f in files:
            path = f["path"]
            content = f["content"]
            full_path = os.path.join(self.output_dir, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as fp:
                fp.write(content)
