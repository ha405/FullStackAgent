#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const apibase_js_1 = require("./src/api/apibase.js");
const tool_registry_js_1 = require("./src/tool.registry.js");
const server = new index_js_1.Server({
    name: "mcp_figma_refactored",
    version: "1.0.0"
}, {
    capabilities: { tools: {} }
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        tools: tool_registry_js_1.toolRegistry.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(tool.schema),
        })),
    });
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { name, arguments: args } = request.params;
    const tool = tool_registry_js_1.toolRegistry.find(t => t.name === name);
    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }
    try {
        const parsedArgs = tool.schema.parse(args);
        const response = yield tool.handler(parsedArgs);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const validationErrors = error.errors.map(e => `${e.path.join(".")} - ${e.message}`).join(", ");
            throw new Error(`Invalid arguments for tool '${name}': ${validationErrors}`);
        }
        const err = error;
        const errorMessage = `Error executing tool ${name}: ${err.message}`;
        const errorDetails = ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) ? ` - Details: ${JSON.stringify(err.response.data)}` : '';
        console.error("Tool Execution Error:", {
            tool: name,
            message: err.message,
            status: (_b = err.response) === null || _b === void 0 ? void 0 : _b.status,
            data: (_c = err.response) === null || _c === void 0 ? void 0 : _c.data,
            stack: err.stack
        });
        throw new Error(`${errorMessage}${errorDetails}`);
    }
}));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const args = process.argv.slice(2);
            let apiToken;
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
                (0, apibase_js_1.setFigmaToken)(apiToken);
            }
            else {
                const errorMsg = "Figma API token is required. Set it via the FIGMA_TOKEN environment variable or the --figma-token flag.";
                console.error(`FATAL: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            console.error("Starting Refactored MCP Figma Server...");
            const transport = new stdio_js_1.StdioServerTransport();
            yield server.connect(transport);
            console.error("Server is running on stdio and awaiting client connection.");
        }
        catch (error) {
            console.error("Server failed to start:", error);
            process.exit(1);
        }
    });
}
startServer().catch((fatalError) => {
    console.error("A fatal, unhandled error occurred in the server's main process:", fatalError);
    process.exit(1);
});
