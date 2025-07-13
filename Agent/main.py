import logging
import os
import sys
import json
import asyncio
from uuid import uuid4
import httpx
from a2a.client import A2ACardResolver, A2AClient
from a2a.types import SendMessageRequest, MessageSendParams
from FrontendAgent import FrontendAgent
from utils import FIGMA_AGENT_BASE,FIGMA_URL,OUTPUT_DIR
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    # logger.info("🚀 Starting frontend generation…")
    timeout = httpx.Timeout(
        timeout=None,  
        connect=10.0,
        read=300.0,
        write=60.0,
        pool=60.0
    )
    async with httpx.AsyncClient(timeout=timeout) as httpx_client:
        resolver = A2ACardResolver(
            httpx_client=httpx_client,
            base_url=FIGMA_AGENT_BASE
        )
        # logger.info(f"Fetching agent card from {FIGMA_AGENT_BASE}/.well‑known/agent.json")
        agent_card = await resolver.get_agent_card()
        # logger.info("Fetched Agent Card:\n%s",
        #             agent_card.model_dump_json(indent=2, exclude_none=True))

        client = A2AClient(httpx_client=httpx_client, agent_card=agent_card)
        # logger.info("A2AClient initialized")

        user_message = {
            "messageId": uuid4().hex,
            "role": "user",
            "type": "text",
            "parts": [{"text": FIGMA_URL}],
        }
        params  = MessageSendParams(
            skill_id="generate_frontend_plan",
            message=user_message
        )
        request = SendMessageRequest(id=str(uuid4()), params=params)
        # logger.info("Sending generate_frontend_plan request…")
        response = await client.send_message(request)

    # logger.info("Raw response:\n%s",
    #             response.model_dump_json(indent=2, exclude_none=True))

    root = response.root
    if getattr(root, "error", None) is not None:
        logger.error("Agent returned error: %s", root.error)
        return

    msg = root.result

    raw_plan_str = None
    for part in msg.parts:
        if hasattr(part, "text"):
            raw_plan_str = part.text
            break
        if hasattr(part, "root") and hasattr(part.root, "text"):
            raw_plan_str = part.root.text
            break

    if raw_plan_str is None:
        logger.error("Could not find any text in message parts: %r", msg.parts)
        return

    try:
        plan = json.loads(raw_plan_str)
    except Exception as e:
        logger.error("Failed to parse plan JSON: %s", e)
        logger.debug("Raw text was:\n%s", raw_plan_str)
        return

    if not isinstance(plan, dict) or "pages" not in plan:
        logger.error("Invalid plan structure:\n%s", json.dumps(plan, indent=2))
        return

    # logger.info("Received plan with %d pages", len(plan["pages"]))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # logger.info("Running FrontendAgent…")
    await FrontendAgent(output_dir=OUTPUT_DIR).run(plan)
    # logger.info("Frontend files generated at %s", OUTPUT_DIR)


if __name__ == "__main__":
    asyncio.run(main())
