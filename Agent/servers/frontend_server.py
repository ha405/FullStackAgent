import os
import sys
import json
import traceback
import uvicorn

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.utils import new_agent_text_message
from a2a.types import AgentCard, AgentSkill, AgentCapabilities
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.server.apps import A2AStarletteApplication

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from FrontendAgent import FrontendAgent 

public_skill = AgentSkill(
    id="generate_frontend_files",
    name="Generate Frontend Files",
    description="Scaffolds frontend files from a validated frontendPlan JSON.",
    tags=["frontend", "scaffold"],
    examples=["Generate files for the given plan JSON"]
)

extended_skill = AgentSkill(
    id="super_generate_frontend_files",
    name="SUPER Generate Frontend Files",
    description="Same as generate_frontend_files but with verbose comments and extra tooling.",
    tags=["frontend", "scaffold", "super"],
    examples=["Super generate with comments for the given plan JSON"]
)

public_agent_card = AgentCard(
    name="Frontend Scaffolding Agent",
    description="Takes a frontendPlan JSON and produces a set of frontend files.",
    url="http://localhost:8001",  
    version="1.0.0",
    defaultInputModes=["json"],
    defaultOutputModes=["json"],
    capabilities=AgentCapabilities(streaming=False),
    skills=[public_skill],
    supportsAuthenticatedExtendedCard=True
)

extended_agent_card = public_agent_card.model_copy(
    update={
        "name": "Frontend Scaffolding Agent (Extended)",
        "version": "1.0.1",
        "description": "Extended edition with extra comments and tests.",
        "skills": [public_skill, extended_skill],
    }
)

class FrontendAgentExecutor(AgentExecutor):
    def __init__(self):
        super().__init__()
        self.output_dir = os.path.abspath(os.path.join(os.getcwd(), "generated_frontend"))
        self.agent = FrontendAgent(output_dir=self.output_dir)

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        try:
            incoming = context.message.parts[0]
            plan_json = getattr(incoming, "text", str(incoming))
            plan = json.loads(plan_json)
            await self.agent.run(plan)
            manifest = {"files": []}
            for root, _, files in os.walk(self.output_dir):
                for fname in files:
                    full_path = os.path.join(root, fname)
                    rel_path = os.path.relpath(full_path, self.output_dir)
                    with open(full_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    manifest["files"].append({
                        "path": rel_path.replace(os.sep, "/"),
                        "content": content
                    })
            await event_queue.enqueue_event(
                new_agent_text_message(json.dumps(manifest))
            )

        except Exception:
            print("[Executor] Exception during execution:")
            traceback.print_exc()
            raise

    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> None:
        raise NotImplementedError("Cancel not supported")

if __name__ == "__main__":
    handler = DefaultRequestHandler(
        agent_executor=FrontendAgentExecutor(),
        task_store=InMemoryTaskStore(),
    )

    app = A2AStarletteApplication(
        agent_card=public_agent_card,
        http_handler=handler,
        extended_agent_card=extended_agent_card,
    ).build()

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
