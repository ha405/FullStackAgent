
import { z } from 'zod';

export const FileKeySchema = z.object({
    fileKey: z.string().describe("The file key for the operation")
});

export const FigmaGetCommentsArgumentsSchema = FileKeySchema.extend({
    as_md: z.boolean().describe("Return comments as markdown").default(false),
});

export const PostCommentArgumentsSchema = FileKeySchema.extend({
    message: z.string().describe("The text content of the comment"),
    comment_id: z.string().optional().describe("ID of the comment to reply to"),
    client_meta: z.any().optional().describe("Position of the comment")
});

export const DeleteCommentArgumentsSchema = FileKeySchema.extend({
    commentId: z.string().describe("The ID of the comment to delete")
});

export const GetCommentReactionsArgumentsSchema = FileKeySchema.extend({
    commentId: z.string().describe("The ID of the comment to get reactions for"),
    cursor: z.string().optional().describe("Pagination cursor")
});

export const PostCommentReactionArgumentsSchema = FileKeySchema.extend({
    commentId: z.string().describe("The ID of the comment to react to"),
    emoji: z.string().describe("The emoji for the reaction")
});

export const DeleteCommentReactionArgumentsSchema = FileKeySchema.extend({
    commentId: z.string().describe("The ID of the comment to remove a reaction from"),
    emoji: z.string().describe("The emoji to remove")
});

export const GetFileNodesArgumentsSchema = FileKeySchema.extend({
    ids: z.string().describe("Comma-separated list of node IDs to retrieve"),
    version: z.string().optional().describe("A specific version ID"),
    depth: z.number().optional().describe("Depth of tree traversal"),
    geometry: z.string().optional().describe("Set to 'paths' to export vector data"),
    plugin_data: z.string().optional().describe("Plugin IDs to include data for")
});

export const GetFileVersionsArgumentsSchema = FileKeySchema.extend({
    page_size: z.number().optional().describe("Number of items per page"),
    before: z.number().optional().describe("Get versions before this ID"),
    after: z.number().optional().describe("Get versions after this ID")
});

export const GetImagesArgumentsSchema = FileKeySchema.extend({
    ids: z.string().describe("Comma-separated list of node IDs to render"),
    version: z.string().optional().describe("A specific version ID"),
    scale: z.number().optional().describe("Image scaling factor (0.01 to 4)"),
    format: z.enum(["jpg", "png", "svg", "pdf"]).optional().describe("Image output format"),
    svg_outline_text: z.boolean().optional().describe("Render text as outlines in SVGs"),
    svg_include_id: z.boolean().optional().describe("Include ID attributes for all SVG elements"),
    svg_include_node_id: z.boolean().optional().describe("Include node ID attributes for all SVG elements"),
    svg_simplify_stroke: z.boolean().optional().describe("Simplify strokes where possible"),
    contents_only: z.boolean().optional().describe("Exclude content overlapping the node"),
    use_absolute_bounds: z.boolean().optional().describe("Use full node dimensions regardless of cropping")
});

export const GetTeamProjectsArgumentsSchema = z.object({
    teamId: z.string().describe("The ID of the team to get projects for")
});

export const GetProjectFilesArgumentsSchema = z.object({
    projectId: z.string().describe("The ID of the project to get files for"),
    branch_data: z.boolean().optional().describe("Return branch metadata")
});

export const GetTeamComponentsArgumentsSchema = z.object({
    teamId: z.string().describe("The ID of the team to get components for"),
    page_size: z.number().optional().describe("Number of items per page"),
    after: z.number().optional().describe("Cursor for pagination (after ID)"),
    before: z.number().optional().describe("Cursor for pagination (before ID)")
});

export const GetTeamComponentSetsArgumentsSchema = z.object({
    teamId: z.string().describe("The ID of the team to get component sets for"),
    page_size: z.number().optional().describe("Number of items per page"),
    after: z.number().optional().describe("Cursor for pagination (after ID)"),
    before: z.number().optional().describe("Cursor for pagination (before ID)")
});

export const GetTeamStylesArgumentsSchema = z.object({
    teamId: z.string().describe("The ID of the team to get styles for"),
    page_size: z.number().optional().describe("Number of items per page"),
    after: z.number().optional().describe("Cursor for pagination (after ID)"),
    before: z.number().optional().describe("Cursor for pagination (before ID)")
});

export const GetComponentArgumentsSchema = z.object({
    key: z.string().describe("The key of the component to get")
});

export const GetComponentSetArgumentsSchema = z.object({
    key: z.string().describe("The key of the component set to get")
});

export const GetStyleArgumentsSchema = z.object({
    key: z.string().describe("The key of the style to get")
});

export const GetFileArgumentsSchema = FileKeySchema.extend({
    version: z.string().optional().describe("A specific version ID"),
    ids: z.string().optional().describe("Comma-separated list of nodes to include"),
    depth: z.number().optional().describe("Tree traversal depth"),
    geometry: z.string().optional().describe("Set to 'paths' for vector data"),
    plugin_data: z.string().optional().describe("Plugin IDs for extra data"),
    branch_data: z.boolean().optional().describe("Return branch metadata")
});

export const PostWebhookArgumentsSchema = z.object({
    event_type: z.string().describe("Event type for the webhook"),
    team_id: z.string().describe("Team ID to receive updates for"),
    endpoint: z.string().describe("The HTTP endpoint to receive the POST request"),
    passcode: z.string().describe("A verification string passed back to the endpoint"),
    status: z.string().optional().describe("The state of the webhook"),
    description: z.string().optional().describe("A description for the webhook")
});

export const GetWebhookArgumentsSchema = z.object({
    webhook_id: z.string().describe("The ID of the webhook to get")
});

export const UpdateWebhookArgumentsSchema = z.object({
    webhook_id: z.string().describe("The ID of the webhook to update"),
    endpoint: z.string().optional().describe("The new HTTP endpoint"),
    passcode: z.string().optional().describe("The new verification string"),
    status: z.string().optional().describe("The new state of the webhook"),
    description: z.string().optional().describe("The new description")
});

export const DeleteWebhookArgumentsSchema = z.object({
    webhook_id: z.string().describe("The ID of the webhook to delete")
});

export const GetTeamWebhooksArgumentsSchema = z.object({
    team_id: z.string().describe("The ID of the team to get webhooks for")
});

export const GetLibraryAnalyticsComponentUsagesArgumentsSchema = FileKeySchema.extend({
    cursor: z.string().optional().describe("Pagination cursor"),
    group_by: z.enum(["component", "file"]).describe("Dimension to group analytics by")
});

export const GetLibraryAnalyticsStyleUsagesArgumentsSchema = FileKeySchema.extend({
    cursor: z.string().optional().describe("Pagination cursor"),
    group_by: z.enum(["style", "file"]).describe("Dimension to group analytics by")
});

export const GetLibraryAnalyticsVariableUsagesArgumentsSchema = FileKeySchema.extend({
    cursor: z.string().optional().describe("Pagination cursor"),
    group_by: z.enum(["variable", "file"]).describe("Dimension to group analytics by")
});