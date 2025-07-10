from a2a.types import AgentCard, AgentSkill, AgentCapabilities
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from FigmaAgent import FigAgent
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.server.apps import A2AStarletteApplication
import uvicorn
import json

skills = AgentSkill(
    id="generate_frontend_plan",
    name="Generate Frontend Plan",
    description="Extracts Figma design metadata and outputs a frontendPlan JSON.",
    tags=["figma", "ui planning", "frontend plan"],
    examples=["Generate a plan for https://www.figma.com/file/..."]
)

agent_card = AgentCard(
    name="Figma Planning Agent",
    description="Inspects a Figma file and produces a comprehensive UI planning JSON.",
    url="http://localhost:8000/",      
    version="1.0.0",
    defaultInputModes=["text"],        # expects a link
    defaultOutputModes=["json"],       # returns structured JSON
    capabilities=AgentCapabilities(streaming=False),
    skills=[skills]
)

class AgentExecutor():
    def __init__(self):
       self.agent = FigAgent(user_id="user1", session_id="session1")

    async def execute(self, task) -> dict:
        prompt_text = task.message.parts[0].text
        plan = await self.agent.run(prompt_text)
        return {
            "taskId": task.task_id,
            "status": "completed",
            "result": plan
        }


request_handler = DefaultRequestHandler(
    agent_executor=AgentExecutor(),
    task_store=InMemoryTaskStore()
)

app = A2AStarletteApplication(
    agent_card=agent_card,
    http_handler=request_handler
).build()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)