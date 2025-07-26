import { isAuthenticated } from '../../auth/auth-utils.js';
import { AuthenticationRequiredError } from '../../auth/auth-errors.js';

export async function handleIsAuthenticated(args: any) {
  try {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      const error = new AuthenticationRequiredError("Not authenticated. Use the 'authenticate' tool to sign in.");
      return error.toMCPResponse();
    }
    
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          authenticated: true,
          message: "Authenticated with Microsoft Graph API."
        }, null, 2)
      }]
    };
  } catch (error: any) {
    const authError = new AuthenticationRequiredError(error.message || "Error checking authentication status.");
    return authError.toMCPResponse();
  }
}