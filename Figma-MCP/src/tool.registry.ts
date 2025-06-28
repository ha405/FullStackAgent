import apiClientInstance from "./api/apibase.js";
import * as schema from './tool.schema.js';
import { z } from "zod";

const defineTool = (
    name: string,
    description: string,
    inputSchema: any,
    handler: (args: any) => Promise<any>
) => ({ name, description, schema: inputSchema, handler });

export const toolRegistry = [
    defineTool("figma_get_me", "Get the current user", z.object({}), 
        () => apiClientInstance.v1.getMe()),
    
    defineTool("figma_get_file", "Get a Figma file by key", schema.GetFileArgumentsSchema, 
        (args) => apiClientInstance.v1.getFile(args.fileKey, args)),

    defineTool("figma_get_file_nodes", "Get specific nodes from a Figma file", schema.GetFileNodesArgumentsSchema, 
        (args) => apiClientInstance.v1.getFileNodes(args.fileKey, args)),

    defineTool("figma_get_images", "Render images from a Figma file", schema.GetImagesArgumentsSchema, 
        (args) => apiClientInstance.v1.getImages(args.fileKey, args)),

    defineTool("figma_get_image_fills", "Get image fills in a Figma file", schema.FileKeySchema, 
        (args) => apiClientInstance.v1.getImageFills(args.fileKey)),

    defineTool("figma_get_file_versions", "Get version history of a Figma file", schema.GetFileVersionsArgumentsSchema, 
        (args) => apiClientInstance.v1.getFileVersions(args.fileKey, args)),

    defineTool("figma_get_comments", "Get comments in a Figma file", schema.FigmaGetCommentsArgumentsSchema, 
        (args) => apiClientInstance.v1.getComments(args.fileKey, args)),

    defineTool("figma_post_comment", "Add a comment to a Figma file", schema.PostCommentArgumentsSchema, 
        (args) => apiClientInstance.v1.postComment(args.fileKey, args)),

    defineTool("figma_delete_comment", "Delete a comment from a Figma file", schema.DeleteCommentArgumentsSchema, 
        (args) => apiClientInstance.v1.deleteComment(args.fileKey, args.commentId)),

    defineTool("figma_get_comment_reactions", "Get reactions for a comment", schema.GetCommentReactionsArgumentsSchema, 
        (args) => apiClientInstance.v1.getCommentReactions(args.fileKey, args.commentId, args)),

    defineTool("figma_post_comment_reaction", "Add a reaction to a comment", schema.PostCommentReactionArgumentsSchema, 
        (args) => apiClientInstance.v1.postCommentReaction(args.fileKey, args.commentId, args)),

    defineTool("figma_delete_comment_reaction", "Delete a reaction from a comment", schema.DeleteCommentReactionArgumentsSchema, 
        (args) => apiClientInstance.v1.deleteCommentReaction(args.fileKey, args.commentId, args)),
        
    defineTool("figma_get_team_projects", "Get projects in a team", schema.GetTeamProjectsArgumentsSchema, 
        (args) => apiClientInstance.v1.getTeamProjects(args.teamId)),

    defineTool("figma_get_project_files", "Get files in a project", schema.GetProjectFilesArgumentsSchema, 
        (args) => apiClientInstance.v1.getProjectFiles(args.projectId, args)),
        
    defineTool("figma_get_team_components", "Get components in a team", schema.GetTeamComponentsArgumentsSchema, 
        (args) => apiClientInstance.v1.getTeamComponents(args.teamId, args)),

    defineTool("figma_get_file_components", "Get components in a file", schema.FileKeySchema, 
        (args) => apiClientInstance.v1.getFileComponents(args.fileKey)),

    defineTool("figma_get_component", "Get a component by key", schema.GetComponentArgumentsSchema, 
        (args) => apiClientInstance.v1.getComponent(args.key)),

    defineTool("figma_get_team_component_sets", "Get component sets in a team", schema.GetTeamComponentSetsArgumentsSchema, 
        (args) => apiClientInstance.v1.getTeamComponentSets(args.teamId, args)),

    defineTool("figma_get_file_component_sets", "Get component sets in a file", schema.FileKeySchema, 
        (args) => apiClientInstance.v1.getFileComponentSets(args.fileKey)),

    defineTool("figma_get_component_set", "Get a component set by key", schema.GetComponentSetArgumentsSchema, 
        (args) => apiClientInstance.v1.getComponentSet(args.key)),

    defineTool("figma_get_team_styles", "Get styles in a team", schema.GetTeamStylesArgumentsSchema, 
        (args) => apiClientInstance.v1.getTeamStyles(args.teamId, args)),

    defineTool("figma_get_file_styles", "Get styles in a file", schema.FileKeySchema, 
        (args) => apiClientInstance.v1.getFileStyles(args.fileKey)),

    defineTool("figma_get_style", "Get a style by key", schema.GetStyleArgumentsSchema, 
        (args) => apiClientInstance.v1.getStyle(args.key)),
        
    defineTool("figma_post_webhook", "Create a webhook", schema.PostWebhookArgumentsSchema, 
        (args) => apiClientInstance.v2.postWebhook(args)),

    defineTool("figma_get_webhook", "Get a webhook by ID", schema.GetWebhookArgumentsSchema, 
        (args) => apiClientInstance.v2.getWebhook(args.webhook_id)),

    defineTool("figma_update_webhook", "Update a webhook", schema.UpdateWebhookArgumentsSchema, 
        (args) => apiClientInstance.v2.putWebhook(args.webhook_id, args)),

    defineTool("figma_delete_webhook", "Delete a webhook", schema.DeleteWebhookArgumentsSchema, 
        (args) => apiClientInstance.v2.deleteWebhook(args.webhook_id)),

    defineTool("figma_get_team_webhooks", "Get webhooks for a team", schema.GetTeamWebhooksArgumentsSchema, 
        (args) => apiClientInstance.v2.getTeamWebhooks(args.team_id)),
        
    defineTool("figma_get_library_analytics_component_usages", "Get library component usage data", schema.GetLibraryAnalyticsComponentUsagesArgumentsSchema,
        (args) => apiClientInstance.v1.getLibraryAnalyticsComponentUsages(args.fileKey, args)),

    defineTool("figma_get_library_analytics_style_usages", "Get library style usage data", schema.GetLibraryAnalyticsStyleUsagesArgumentsSchema,
        (args) => apiClientInstance.v1.getLibraryAnalyticsStyleUsages(args.fileKey, args)),

    defineTool("figma_get_library_analytics_variable_usages", "Get library variable usage data", schema.GetLibraryAnalyticsVariableUsagesArgumentsSchema,
        (args) => apiClientInstance.v1.getLibraryAnalyticsVariableUsages(args.fileKey, args)),
];