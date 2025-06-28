"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRegistry = void 0;
const apibase_js_1 = __importDefault(require("./api/apibase.js"));
const schema = __importStar(require("./tool.schema.js"));
const zod_1 = require("zod");
const defineTool = (name, description, inputSchema, handler) => ({ name, description, schema: inputSchema, handler });
exports.toolRegistry = [
    defineTool("figma_get_me", "Get the current user", zod_1.z.object({}), () => apibase_js_1.default.v1.getMe()),
    defineTool("figma_get_file", "Get a Figma file by key", schema.GetFileArgumentsSchema, (args) => apibase_js_1.default.v1.getFile(args.fileKey, args)),
    defineTool("figma_get_file_nodes", "Get specific nodes from a Figma file", schema.GetFileNodesArgumentsSchema, (args) => apibase_js_1.default.v1.getFileNodes(args.fileKey, args)),
    defineTool("figma_get_images", "Render images from a Figma file", schema.GetImagesArgumentsSchema, (args) => apibase_js_1.default.v1.getImages(args.fileKey, args)),
    defineTool("figma_get_image_fills", "Get image fills in a Figma file", schema.FileKeySchema, (args) => apibase_js_1.default.v1.getImageFills(args.fileKey)),
    defineTool("figma_get_file_versions", "Get version history of a Figma file", schema.GetFileVersionsArgumentsSchema, (args) => apibase_js_1.default.v1.getFileVersions(args.fileKey, args)),
    defineTool("figma_get_comments", "Get comments in a Figma file", schema.FigmaGetCommentsArgumentsSchema, (args) => apibase_js_1.default.v1.getComments(args.fileKey, args)),
    defineTool("figma_post_comment", "Add a comment to a Figma file", schema.PostCommentArgumentsSchema, (args) => apibase_js_1.default.v1.postComment(args.fileKey, args)),
    defineTool("figma_delete_comment", "Delete a comment from a Figma file", schema.DeleteCommentArgumentsSchema, (args) => apibase_js_1.default.v1.deleteComment(args.fileKey, args.commentId)),
    defineTool("figma_get_comment_reactions", "Get reactions for a comment", schema.GetCommentReactionsArgumentsSchema, (args) => apibase_js_1.default.v1.getCommentReactions(args.fileKey, args.commentId, args)),
    defineTool("figma_post_comment_reaction", "Add a reaction to a comment", schema.PostCommentReactionArgumentsSchema, (args) => apibase_js_1.default.v1.postCommentReaction(args.fileKey, args.commentId, args)),
    defineTool("figma_delete_comment_reaction", "Delete a reaction from a comment", schema.DeleteCommentReactionArgumentsSchema, (args) => apibase_js_1.default.v1.deleteCommentReaction(args.fileKey, args.commentId, args)),
    defineTool("figma_get_team_projects", "Get projects in a team", schema.GetTeamProjectsArgumentsSchema, (args) => apibase_js_1.default.v1.getTeamProjects(args.teamId)),
    defineTool("figma_get_project_files", "Get files in a project", schema.GetProjectFilesArgumentsSchema, (args) => apibase_js_1.default.v1.getProjectFiles(args.projectId, args)),
    defineTool("figma_get_team_components", "Get components in a team", schema.GetTeamComponentsArgumentsSchema, (args) => apibase_js_1.default.v1.getTeamComponents(args.teamId, args)),
    defineTool("figma_get_file_components", "Get components in a file", schema.FileKeySchema, (args) => apibase_js_1.default.v1.getFileComponents(args.fileKey)),
    defineTool("figma_get_component", "Get a component by key", schema.GetComponentArgumentsSchema, (args) => apibase_js_1.default.v1.getComponent(args.key)),
    defineTool("figma_get_team_component_sets", "Get component sets in a team", schema.GetTeamComponentSetsArgumentsSchema, (args) => apibase_js_1.default.v1.getTeamComponentSets(args.teamId, args)),
    defineTool("figma_get_file_component_sets", "Get component sets in a file", schema.FileKeySchema, (args) => apibase_js_1.default.v1.getFileComponentSets(args.fileKey)),
    defineTool("figma_get_component_set", "Get a component set by key", schema.GetComponentSetArgumentsSchema, (args) => apibase_js_1.default.v1.getComponentSet(args.key)),
    defineTool("figma_get_team_styles", "Get styles in a team", schema.GetTeamStylesArgumentsSchema, (args) => apibase_js_1.default.v1.getTeamStyles(args.teamId, args)),
    defineTool("figma_get_file_styles", "Get styles in a file", schema.FileKeySchema, (args) => apibase_js_1.default.v1.getFileStyles(args.fileKey)),
    defineTool("figma_get_style", "Get a style by key", schema.GetStyleArgumentsSchema, (args) => apibase_js_1.default.v1.getStyle(args.key)),
    defineTool("figma_post_webhook", "Create a webhook", schema.PostWebhookArgumentsSchema, (args) => apibase_js_1.default.v2.postWebhook(args)),
    defineTool("figma_get_webhook", "Get a webhook by ID", schema.GetWebhookArgumentsSchema, (args) => apibase_js_1.default.v2.getWebhook(args.webhook_id)),
    defineTool("figma_update_webhook", "Update a webhook", schema.UpdateWebhookArgumentsSchema, (args) => apibase_js_1.default.v2.putWebhook(args.webhook_id, args)),
    defineTool("figma_delete_webhook", "Delete a webhook", schema.DeleteWebhookArgumentsSchema, (args) => apibase_js_1.default.v2.deleteWebhook(args.webhook_id)),
    defineTool("figma_get_team_webhooks", "Get webhooks for a team", schema.GetTeamWebhooksArgumentsSchema, (args) => apibase_js_1.default.v2.getTeamWebhooks(args.team_id)),
    defineTool("figma_get_library_analytics_component_usages", "Get library component usage data", schema.GetLibraryAnalyticsComponentUsagesArgumentsSchema, (args) => apibase_js_1.default.v1.getLibraryAnalyticsComponentUsages(args.fileKey, args)),
    defineTool("figma_get_library_analytics_style_usages", "Get library style usage data", schema.GetLibraryAnalyticsStyleUsagesArgumentsSchema, (args) => apibase_js_1.default.v1.getLibraryAnalyticsStyleUsages(args.fileKey, args)),
    defineTool("figma_get_library_analytics_variable_usages", "Get library variable usage data", schema.GetLibraryAnalyticsVariableUsagesArgumentsSchema, (args) => apibase_js_1.default.v1.getLibraryAnalyticsVariableUsages(args.fileKey, args)),
];
