#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { setFigmaToken } from "./src/api/apibase.js";
import { toolRegistry } from './src/tool.registry.js';

const server = new Server({
    name: "mcp_figma_refactored",
    version: "1.0.0"
}, {
    capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolRegistry.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: zodToJsonSchema(tool.schema),
    })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolRegistry.find(t => t.name === name);

    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }

    try {
        const parsedArgs = tool.schema.parse(args);
        const response = await tool.handler(parsedArgs);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.errors.map(e => `${e.path.join(".")} - ${e.message}`).join(", ");
            throw new Error(`Invalid arguments for tool '${name}': ${validationErrors}`);
        }
        
        const err = error as any;
        const errorMessage = `Error executing tool ${name}: ${err.message}`;
        const errorDetails = err.response?.data ? ` - Details: ${JSON.stringify(err.response.data)}` : '';
        
        console.error("Tool Execution Error:", {
            tool: name,
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            stack: err.stack
        });

        throw new Error(`${errorMessage}${errorDetails}`);
    }
});

async function startServer() {
    try {
        const args = process.argv.slice(2);
        let apiToken: string | undefined;

        for (let i = 0; i < args.length; i++) {
            if ((args[i] === '--figma-token' || args[i] === '-ft') && i + 1 < args.length) {
                apiToken = args[i + 1];
                break;
            }
        }

        if (!apiToken) {
            apiToken = process.env.FIGMA_TOKEN;
        }

        if (apiToken) {
            setFigmaToken(apiToken);
        } else {
            const errorMsg = "Figma API token is required. Set it via the FIGMA_TOKEN environment variable or the --figma-token flag.";
            console.error(`FATAL: ${errorMsg}`);
            throw new Error(errorMsg);
        }

        console.error("Starting Refactored MCP Figma Server...");
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Server is running on stdio and awaiting client connection.");

    } catch (error) {
        console.error("Server failed to start:", error);
        process.exit(1);
    }
}

startServer().catch((fatalError) => {
    console.error("A fatal, unhandled error occurred in the server's main process:", fatalError);
    process.exit(1);
});