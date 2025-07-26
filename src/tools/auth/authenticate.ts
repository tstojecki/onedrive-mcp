import { msalAuthManager } from '../../auth/msal-auth-manager.js';
import { isAuthenticated } from '../../auth/auth-utils.js';

export async function handleAuthenticate(args: any) {
  try {
    if (args?.force) {
      await msalAuthManager.clearTokens();
    }

    const authenticated = await isAuthenticated();
    
    if (authenticated && !args?.force) {
      return {
        content: [{
          type: "text" as const,
          text: `Already authenticated with Microsoft Graph API. Use 'force: true' to re-authenticate.`
        }]
      };
    }

    const authUrl = await msalAuthManager.getAuthorizationUrl();
    
    return {
      content: [{
        type: "text" as const,
        text: `Please authenticate with Microsoft:

1. Visit this URL in your browser:
${authUrl}

2. Sign in with your Microsoft account
3. Grant permissions for OneDrive app folder access
4. You'll be redirected to a success page - authentication is complete!

After successful authentication, you can use all OneDrive tools.`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: "text" as const,
        text: `Authentication error: ${error.message}`
      }]
    };
  }
}