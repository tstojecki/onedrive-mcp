import { msalAuthManager } from './msal-auth-manager.js';
import { AuthenticationRequiredError } from './auth-errors.js';

export async function ensureAuthenticated(forceNew = false): Promise<string> {
  if (forceNew) {
    await msalAuthManager.clearTokens();
    throw new AuthenticationRequiredError();
  }
  
  const accessToken = await msalAuthManager.getAccessToken();
  if (!accessToken) {
    throw new AuthenticationRequiredError();
  }

  return accessToken;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const accessToken = await msalAuthManager.getAccessToken();
    return !!accessToken;
  } catch (error) {
    return false;
  }
}

export async function getAuthStatus(): Promise<{
  authenticated: boolean;
  tokenInfo?: {
    hasAccessToken: boolean;
    tokenLength: number;
  };
}> {
  try {
    const accessToken = await msalAuthManager.getAccessToken();
    
    if (!accessToken) {
      return { authenticated: false };
    }
    
    return {
      authenticated: true,
      tokenInfo: {
        hasAccessToken: true,
        tokenLength: accessToken.length
      }
    };
  } catch (error) {
    return { authenticated: false };
  }
}