import 'dotenv/config';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const FIGMA_TOKEN = process.env.FIGMA_TOKEN; 
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error("[CLIENT] ERROR: Make sure FIGMA_TOKEN and FIGMA_FILE_KEY are set in your .env file.");
  process.exit(1);
}

const log = (message) => console.log(`[CLIENT] ${message}`);


const transport = new StdioClientTransport({
  command: "node",
  args: [
    "./dist/main.js", // <-- We are now running plain JavaScript!
    "--figma-token", 
    FIGMA_TOKEN
  ]
});

const client = new Client({
  name: "figma-pro-client",
  version: "1.0.0"
});

async function runTest() {
  try {
    log("Connecting to the professional Figma server...");
    await client.connect(transport);
    log("Connection established!");

    log("\n[TEST 1] Calling tool 'figma_get_me'...");
    const meResult = await client.callTool({
      name: "figma_get_me",
      arguments: {}
    });
    const meData = JSON.parse(meResult.content[0].text);
    console.log("✅ Success! Current user:", meData.email);

    log("\n[TEST 2] Calling tool 'figma_get_file'...");
    const fileResult = await client.callTool({
      name: "figma_get_file",
      arguments: {
        fileKey: FIGMA_FILE_KEY
      }
    });
    const fileData = JSON.parse(fileResult.content[0].text);
    console.log(`✅ Success! File name: "${fileData.name}"`);

  } catch (error) {
    console.error("❌ CLIENT-SIDE ERROR:", error);
  } finally {
    if (client.isConnected) {
        await client.close();
        log("\nDisconnected.");
    }
  }
}

runTest();