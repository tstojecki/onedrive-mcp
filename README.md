# OneDrive MCP Server

OneDrive MCP server that connects with personal Microsoft OneDrive through Graph API. 
Secure app folder access only (for now).

## Tools

- **authenticate** - OAuth 2.0 authentication with Microsoft Graph API
- **is-authenticated** - Check authentication status
- **onedrive_list_files** - List files and folders in app folder
- **onedrive_read_file** - Read file content
- **onedrive_create_file** - Create new files
- **onedrive_update_file** - Update existing files
- **onedrive_delete_file** - Delete files or folders
- **onedrive_create_folder** - Create new folders
- **onedrive_search_files** - Search files by name or content

## Azure App Registration

1. Open [Azure Portal](https://portal.azure.com/) → App registrations → New registration
2. Name: "OneDrive MCP Server"
3. Account type: "Accounts in any organizational directory and personal Microsoft accounts"
4. Redirect URI: Web → `http://localhost:3000/auth/callback`
5. Click Register and copy the **Application (client) ID**

**Add API Permissions:**
- API permissions → Add permission → Microsoft Graph → Delegated permissions
- Select: `Files.ReadWrite.AppFolder`
- Click Add permissions

**Create Client Secret:**
- Certificates & secrets → Client secrets → New client secret
- Description: "Client Secret", longest expiration
- Copy the secret **value**

## Setup
```
ONEDRIVE_CLIENT_ID=your_application_client_id
ONEDRIVE_CLIENT_SECRET=your_client_secret_value
```
## Build 

```bash
npm install
npm run build
```

## Use with Claude Desktop
See `claude_desktop_config.json`

## License
MIT License

## Acknowledgements
https://mseep.ai/app/ryaker-outlook-mcp

