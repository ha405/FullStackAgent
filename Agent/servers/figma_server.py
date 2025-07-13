import os
import sys
import json
import traceback
import uvicorn
from utils import FIGMA_AGENT_BASE, OUTPUT_DIR, FIGMA_URL
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.utils import new_agent_text_message
from a2a.types import AgentCard, AgentSkill, AgentCapabilities
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.server.apps import A2AStarletteApplication

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from FigmaAgent import FigAgent


public_skill = AgentSkill(
    id="generate_frontend_plan",
    name="Generate Frontend Plan",
    description="Extracts Figma design metadata and outputs a frontendPlan JSON.",
    tags=["figma", "ui planning"],
    examples=["Generate a plan for https://www.figma.com/file/..."],
)

extended_skill = AgentSkill(
    id="super_frontend_plan",
    name="SUPER Generate Frontend Plan",
    description="Same as generate_frontend_plan but with enthusiastic commentary.",
    tags=["figma", "ui planning", "super"],
    examples=["Super plan for https://www.figma.com/file/..."],
)

public_agent_card = AgentCard(
    name="Figma Planning Agent",
    description="Inspect a Figma file and produce a frontendPlan JSON.",
    url="http://localhost:8000",
    version="1.0.0",
    defaultInputModes=["text"],
    defaultOutputModes=["json"],
    capabilities=AgentCapabilities(streaming=False),
    skills=[public_skill],
    supportsAuthenticatedExtendedCard=True,
)

extended_agent_card = public_agent_card.model_copy(
    update={
        "name": "Figma Planning Agent (Extended)",
        "version": "1.0.1",
        "description": "Extended edition with super planning skill.",
        "skills": [public_skill, extended_skill],
    }
)
class FigmaAgentExecutor(AgentExecutor):
    def __init__(self):
        self.figagent = FigAgent(user_id="user1", session_id="session1")

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        try:
            user_message = context.message  
            first_part   = user_message.parts[0]
            url          = getattr(first_part, "text", str(first_part))
            # print("[EXECUTOR] Received URL:", url)
            plan = await self.figagent.run(url)
            # print("[EXECUTOR] Plan keys:", list(plan.keys()))
            plan_json = json.dumps(plan)
            # print(plan_json)
            await event_queue.enqueue_event(
                new_agent_text_message(plan_json)
            )

        except Exception:
            print("[EXECUTOR] Exception during execution:")
            traceback.print_exc()
            # re‑raise to let the framework return an “Internal error”
            raise

    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> None:
        raise NotImplementedError("Cancel not supported")


if __name__ == "__main__":
    handler = DefaultRequestHandler(
        agent_executor=FigmaAgentExecutor(),
        task_store=InMemoryTaskStore(),
    )

    app = A2AStarletteApplication(
        agent_card=public_agent_card,
        http_handler=handler,
        extended_agent_card=extended_agent_card,
    ).build()

    uvicorn.run(app, host="0.0.0.0", port=8000)
