# frontend_agent.py
import json
import time
from google.adk import LlmAgent, Runner, InMemorySessionService, Event, EventActions, Content, Part

class FrontendAgent:
    def __init__(self, model: str = "gemini-2.5-pro"):
        self.model = model
        self.agent_name = "frontend_agent"
        self.svc = InMemorySessionService()

    async def run(self, frontend_plan: dict) -> str:
        # Build the LLM agent
        agent = LlmAgent(
            name=self.agent_name,
            model=self.model,
            instruction=(
                "You are a frontend code generation assistant.\n\n"
                "INPUT: A JSON object under the key 'frontendPlan' describing UI components, layouts, styles, and behaviors.\n\n"
                "TASK: Produce complete, ready-to-use frontend code (e.g., React + Tailwind). "
                "Output ONLY the code—no extra commentary or JSON wrappers."
            ),
            output_key="code_output"
        )

        # Create an in-memory session
        session = await self.svc.create_session(
            app_name=self.agent_name,
            user_id="user1",
            session_id="session_frontend"
        )

        # Seed the plan as a system event
        await self.svc.append_event(
            session,
            Event(
                invocation_id="init-plan",
                author="system",
                timestamp=time.time(),
                content=Content(
                    role="system",
                    parts=[Part(text="FrontendPlan:\n" + json.dumps(frontend_plan, indent=2))]
                ),
                actions=EventActions()
            )
        )

        # Run the agent until final response
        runner = Runner(agent=agent, session_service=self.svc, app_name=self.agent_name)
        code_output = ""
        async for event in runner.run_async(
            user_id="user1",
            session_id="session_frontend",
            new_message=Content(role="user", parts=[Part(text="Generate code now.")])
        ):
            if event.is_final_response():
                code_output = event.content.parts[0].text.strip()
                break

        return code_output
