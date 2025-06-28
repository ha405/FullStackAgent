"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLibraryAnalyticsVariableUsagesArgumentsSchema = exports.GetLibraryAnalyticsStyleUsagesArgumentsSchema = exports.GetLibraryAnalyticsComponentUsagesArgumentsSchema = exports.GetTeamWebhooksArgumentsSchema = exports.DeleteWebhookArgumentsSchema = exports.UpdateWebhookArgumentsSchema = exports.GetWebhookArgumentsSchema = exports.PostWebhookArgumentsSchema = exports.GetFileArgumentsSchema = exports.GetStyleArgumentsSchema = exports.GetComponentSetArgumentsSchema = exports.GetComponentArgumentsSchema = exports.GetTeamStylesArgumentsSchema = exports.GetTeamComponentSetsArgumentsSchema = exports.GetTeamComponentsArgumentsSchema = exports.GetProjectFilesArgumentsSchema = exports.GetTeamProjectsArgumentsSchema = exports.GetImagesArgumentsSchema = exports.GetFileVersionsArgumentsSchema = exports.GetFileNodesArgumentsSchema = exports.DeleteCommentReactionArgumentsSchema = exports.PostCommentReactionArgumentsSchema = exports.GetCommentReactionsArgumentsSchema = exports.DeleteCommentArgumentsSchema = exports.PostCommentArgumentsSchema = exports.FigmaGetCommentsArgumentsSchema = exports.FileKeySchema = void 0;
const zod_1 = require("zod");
exports.FileKeySchema = zod_1.z.object({
    fileKey: zod_1.z.string().describe("The file key for the operation")
});
exports.FigmaGetCommentsArgumentsSchema = exports.FileKeySchema.extend({
    as_md: zod_1.z.boolean().describe("Return comments as markdown").default(false),
});
exports.PostCommentArgumentsSchema = exports.FileKeySchema.extend({
    message: zod_1.z.string().describe("The text content of the comment"),
    comment_id: zod_1.z.string().optional().describe("ID of the comment to reply to"),
    client_meta: zod_1.z.any().optional().describe("Position of the comment")
});
exports.DeleteCommentArgumentsSchema = exports.FileKeySchema.extend({
    commentId: zod_1.z.string().describe("The ID of the comment to delete")
});
exports.GetCommentReactionsArgumentsSchema = exports.FileKeySchema.extend({
    commentId: zod_1.z.string().describe("The ID of the comment to get reactions for"),
    cursor: zod_1.z.string().optional().describe("Pagination cursor")
});
exports.PostCommentReactionArgumentsSchema = exports.FileKeySchema.extend({
    commentId: zod_1.z.string().describe("The ID of the comment to react to"),
    emoji: zod_1.z.string().describe("The emoji for the reaction")
});
exports.DeleteCommentReactionArgumentsSchema = exports.FileKeySchema.extend({
    commentId: zod_1.z.string().describe("The ID of the comment to remove a reaction from"),
    emoji: zod_1.z.string().describe("The emoji to remove")
});
exports.GetFileNodesArgumentsSchema = exports.FileKeySchema.extend({
    ids: zod_1.z.string().describe("Comma-separated list of node IDs to retrieve"),
    version: zod_1.z.string().optional().describe("A specific version ID"),
    depth: zod_1.z.number().optional().describe("Depth of tree traversal"),
    geometry: zod_1.z.string().optional().describe("Set to 'paths' to export vector data"),
    plugin_data: zod_1.z.string().optional().describe("Plugin IDs to include data for")
});
exports.GetFileVersionsArgumentsSchema = exports.FileKeySchema.extend({
    page_size: zod_1.z.number().optional().describe("Number of items per page"),
    before: zod_1.z.number().optional().describe("Get versions before this ID"),
    after: zod_1.z.number().optional().describe("Get versions after this ID")
});
exports.GetImagesArgumentsSchema = exports.FileKeySchema.extend({
    ids: zod_1.z.string().describe("Comma-separated list of node IDs to render"),
    version: zod_1.z.string().optional().describe("A specific version ID"),
    scale: zod_1.z.number().optional().describe("Image scaling factor (0.01 to 4)"),
    format: zod_1.z.enum(["jpg", "png", "svg", "pdf"]).optional().describe("Image output format"),
    svg_outline_text: zod_1.z.boolean().optional().describe("Render text as outlines in SVGs"),
    svg_include_id: zod_1.z.boolean().optional().describe("Include ID attributes for all SVG elements"),
    svg_include_node_id: zod_1.z.boolean().optional().describe("Include node ID attributes for all SVG elements"),
    svg_simplify_stroke: zod_1.z.boolean().optional().describe("Simplify strokes where possible"),
    contents_only: zod_1.z.boolean().optional().describe("Exclude content overlapping the node"),
    use_absolute_bounds: zod_1.z.boolean().optional().describe("Use full node dimensions regardless of cropping")
});
exports.GetTeamProjectsArgumentsSchema = zod_1.z.object({
    teamId: zod_1.z.string().describe("The ID of the team to get projects for")
});
exports.GetProjectFilesArgumentsSchema = zod_1.z.object({
    projectId: zod_1.z.string().describe("The ID of the project to get files for"),
    branch_data: zod_1.z.boolean().optional().describe("Return branch metadata")
});
exports.GetTeamComponentsArgumentsSchema = zod_1.z.object({
    teamId: zod_1.z.string().describe("The ID of the team to get components for"),
    page_size: zod_1.z.number().optional().describe("Number of items per page"),
    after: zod_1.z.number().optional().describe("Cursor for pagination (after ID)"),
    before: zod_1.z.number().optional().describe("Cursor for pagination (before ID)")
});
exports.GetTeamComponentSetsArgumentsSchema = zod_1.z.object({
    teamId: zod_1.z.string().describe("The ID of the team to get component sets for"),
    page_size: zod_1.z.number().optional().describe("Number of items per page"),
    after: zod_1.z.number().optional().describe("Cursor for pagination (after ID)"),
    before: zod_1.z.number().optional().describe("Cursor for pagination (before ID)")
});
exports.GetTeamStylesArgumentsSchema = zod_1.z.object({
    teamId: zod_1.z.string().describe("The ID of the team to get styles for"),
    page_size: zod_1.z.number().optional().describe("Number of items per page"),
    after: zod_1.z.number().optional().describe("Cursor for pagination (after ID)"),
    before: zod_1.z.number().optional().describe("Cursor for pagination (before ID)")
});
exports.GetComponentArgumentsSchema = zod_1.z.object({
    key: zod_1.z.string().describe("The key of the component to get")
});
exports.GetComponentSetArgumentsSchema = zod_1.z.object({
    key: zod_1.z.string().describe("The key of the component set to get")
});
exports.GetStyleArgumentsSchema = zod_1.z.object({
    key: zod_1.z.string().describe("The key of the style to get")
});
exports.GetFileArgumentsSchema = exports.FileKeySchema.extend({
    version: zod_1.z.string().optional().describe("A specific version ID"),
    ids: zod_1.z.string().optional().describe("Comma-separated list of nodes to include"),
    depth: zod_1.z.number().optional().describe("Tree traversal depth"),
    geometry: zod_1.z.string().optional().describe("Set to 'paths' for vector data"),
    plugin_data: zod_1.z.string().optional().describe("Plugin IDs for extra data"),
    branch_data: zod_1.z.boolean().optional().describe("Return branch metadata")
});
exports.PostWebhookArgumentsSchema = zod_1.z.object({
    event_type: zod_1.z.string().describe("Event type for the webhook"),
    team_id: zod_1.z.string().describe("Team ID to receive updates for"),
    endpoint: zod_1.z.string().describe("The HTTP endpoint to receive the POST request"),
    passcode: zod_1.z.string().describe("A verification string passed back to the endpoint"),
    status: zod_1.z.string().optional().describe("The state of the webhook"),
    description: zod_1.z.string().optional().describe("A description for the webhook")
});
exports.GetWebhookArgumentsSchema = zod_1.z.object({
    webhook_id: zod_1.z.string().describe("The ID of the webhook to get")
});
exports.UpdateWebhookArgumentsSchema = zod_1.z.object({
    webhook_id: zod_1.z.string().describe("The ID of the webhook to update"),
    endpoint: zod_1.z.string().optional().describe("The new HTTP endpoint"),
    passcode: zod_1.z.string().optional().describe("The new verification string"),
    status: zod_1.z.string().optional().describe("The new state of the webhook"),
    description: zod_1.z.string().optional().describe("The new description")
});
exports.DeleteWebhookArgumentsSchema = zod_1.z.object({
    webhook_id: zod_1.z.string().describe("The ID of the webhook to delete")
});
exports.GetTeamWebhooksArgumentsSchema = zod_1.z.object({
    team_id: zod_1.z.string().describe("The ID of the team to get webhooks for")
});
exports.GetLibraryAnalyticsComponentUsagesArgumentsSchema = exports.FileKeySchema.extend({
    cursor: zod_1.z.string().optional().describe("Pagination cursor"),
    group_by: zod_1.z.enum(["component", "file"]).describe("Dimension to group analytics by")
});
exports.GetLibraryAnalyticsStyleUsagesArgumentsSchema = exports.FileKeySchema.extend({
    cursor: zod_1.z.string().optional().describe("Pagination cursor"),
    group_by: zod_1.z.enum(["style", "file"]).describe("Dimension to group analytics by")
});
exports.GetLibraryAnalyticsVariableUsagesArgumentsSchema = exports.FileKeySchema.extend({
    cursor: zod_1.z.string().optional().describe("Pagination cursor"),
    group_by: zod_1.z.enum(["variable", "file"]).describe("Dimension to group analytics by")
});
