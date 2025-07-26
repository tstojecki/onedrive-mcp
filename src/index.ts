import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { config } from './config.js';

import { handleAbout } from './tools/about.js';
import { handleAuthenticate } from './tools/auth/authenticate.js';
import { handleIsAuthenticated } from './tools/auth/is-authenticated.js';
import { handleListFiles } from './tools/onedrive/list-files.js';
import { handleReadFile } from './tools/onedrive/read-file.js';
import { handleCreateFile } from './tools/onedrive/create-file.js';
import { handleUpdateFile } from './tools/onedrive/update-file.js';
import { handleDeleteFile } from './tools/onedrive/delete-file.js';
import { handleCreateFolder } from './tools/onedrive/create-folder.js';
import { handleSearchFiles } from './tools/onedrive/search-files.js';
import { startAuthServer } from './auth/auth-server.js';

const server = new McpServer({
  name: "OneDrive MCP Server",
  description: "A Model Context Protocol server for managing OneDrive files and folders",
  version: "1.0.0"
});

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args?: any) => Promise<any>;
}

const tools: ToolDefinition[] = [
  {
    name: 'about',
    description: 'Returns information about this OneDrive MCP server',
    inputSchema: {},
    handler: async (args: any) => await handleAbout(args)
  },
  {
    name: 'authenticate',
    description: 'Authenticate with Microsoft Graph API to access OneDrive data',
    inputSchema: {
      force: z.boolean().optional().describe('Force re-authentication even if already authenticated')
    },
    handler: async (args: any) => await handleAuthenticate(args)
  },
  {
    name: 'is-authenticated',
    description: 'Check if currently authenticated with Microsoft Graph API',
    inputSchema: {},
    handler: async (args: any) => await handleIsAuthenticated(args)
  },
  {
    name: 'onedrive_list_files',
    description: 'List files and folders in the OneDrive app folder',
    inputSchema: {
      path: z.string().optional().describe('Optional subfolder path within the app folder (e.g., "documents" or "documents/reports")')
    },
    handler: async (args: any) => await handleListFiles(args)
  },
  {
    name: 'onedrive_read_file',
    description: 'Read the content of a file from the OneDrive app folder',
    inputSchema: {
      path: z.string().describe('Path to the file within the app folder (e.g., "document.txt" or "documents/report.pdf")')
    },
    handler: async (args: any) => await handleReadFile(args)
  },
  {
    name: 'onedrive_create_file',
    description: 'Create a new file in the OneDrive app folder',
    inputSchema: {
      path: z.string().describe('Path where to create the file within the app folder (e.g., "document.txt" or "documents/report.txt")'),
      content: z.string().describe('Content of the file to create'),
      contentType: z.string().optional().describe('MIME type of the file content (optional, defaults to text/plain)')
    },
    handler: async (args: any) => await handleCreateFile(args)
  },
  {
    name: 'onedrive_update_file',
    description: 'Update the content of an existing file in the OneDrive app folder',
    inputSchema: {
      path: z.string().describe('Path to the file to update within the app folder'),
      content: z.string().describe('New content for the file'),
      contentType: z.string().optional().describe('MIME type of the file content (optional)')
    },
    handler: async (args: any) => await handleUpdateFile(args)
  },
  {
    name: 'onedrive_delete_file',
    description: 'Delete a file or folder from the OneDrive app folder',
    inputSchema: {
      path: z.string().describe('Path to the file or folder to delete within the app folder')
    },
    handler: async (args: any) => await handleDeleteFile(args)
  },
  {
    name: 'onedrive_create_folder',
    description: 'Create a new folder in the OneDrive app folder',
    inputSchema: {
      path: z.string().describe('Path where to create the folder within the app folder (e.g., "documents" or "documents/reports")')
    },
    handler: async (args: any) => await handleCreateFolder(args)
  },
  {
    name: 'onedrive_search_files',
    description: 'Search for files within the OneDrive app folder',
    inputSchema: {
      query: z.string().describe('Search query to find files by name or content'),
      path: z.string().optional().describe('Optional subfolder path to search within (searches entire app folder if not specified)')
    },
    handler: async (args: any) => await handleSearchFiles(args)
  }
];

tools.forEach((tool) => {
  server.registerTool(tool.name, {
    description: tool.description,
    inputSchema: tool.inputSchema
  }, tool.handler);
});

await startAuthServer(config.oauth.redirectUriPort);

const transport = new StdioServerTransport();
await server.connect(transport);