import { ConfidentialClientApplication, Configuration, AuthenticationResult } from '@azure/msal-node';
import { config } from '../config.js';
import fs from 'fs';

export interface TokenResult {
  accessToken: string;
  expiresOn: Date;
  account?: any;
}

export class MSALAuthManager {
  public readonly msalClient: ConfidentialClientApplication;
  private cacheFilePath: string;

  constructor() {
    this.cacheFilePath = config.oauth.tokenCachePath;
    
    const msalConfig: Configuration = {
      auth: {
        clientId: config.oauth.clientId,
        clientSecret: config.oauth.clientSecret,
        authority: 'https://login.microsoftonline.com/consumers'
      },
      cache: {
        cachePlugin: {
          beforeCacheAccess: async (cacheContext) => {
            const cache = await this.readTokenCache();
            cacheContext.tokenCache.deserialize(cache);
          },
          afterCacheAccess: async (cacheContext) => {
            if (cacheContext.cacheHasChanged) {
              await this.writeTokenCache(cacheContext.tokenCache.serialize());
            }
          }
        }
      }
    };

    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }

  private async readTokenCache(): Promise<string> {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        return fs.readFileSync(this.cacheFilePath, 'utf8');
      }
    } catch (error) {
      console.error('Error reading token cache:', error);
    }
    return '';
  }

  private async writeTokenCache(cache: string): Promise<void> {
    try {
      fs.writeFileSync(this.cacheFilePath, cache, 'utf8');
    } catch (error) {
      console.error('Error writing token cache:', error);
    }
  }

  async getAuthorizationUrl(): Promise<string> {
    const authCodeUrlRequest = {
      scopes: config.oauth.scopes,
      redirectUri: config.oauth.redirectUri
    };

    return await this.msalClient.getAuthCodeUrl(authCodeUrlRequest);
  }

  async acquireTokenByCode(authCode: string): Promise<TokenResult> {
    const tokenRequest = {
      code: authCode,
      scopes: config.oauth.scopes,
      redirectUri: config.oauth.redirectUri
    };

    const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    
    if (!response) {
      throw new Error('Failed to acquire token');
    }

    return this.mapAuthResult(response);
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const accounts = await this.msalClient.getTokenCache().getAllAccounts();
      
      if (accounts.length === 0) {
        return null;
      }

      const silentRequest = {
        account: accounts[0],
        scopes: config.oauth.scopes
      };

      const response = await this.msalClient.acquireTokenSilent(silentRequest);
      return response?.accessToken || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async refreshToken(): Promise<TokenResult | null> {
    try {
      const accounts = await this.msalClient.getTokenCache().getAllAccounts();
      
      if (accounts.length === 0) {
        return null;
      }

      const silentRequest = {
        account: accounts[0],
        scopes: config.oauth.scopes
      };

      const response = await this.msalClient.acquireTokenSilent(silentRequest);
      
      if (!response) {
        return null;
      }

      return this.mapAuthResult(response);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      const accounts = await this.msalClient.getTokenCache().getAllAccounts();
      
      for (const account of accounts) {
        await this.msalClient.getTokenCache().removeAccount(account);
      }
      
      if (fs.existsSync(this.cacheFilePath)) {
        fs.unlinkSync(this.cacheFilePath);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async hasValidToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  private mapAuthResult(response: AuthenticationResult): TokenResult {
    return {
      accessToken: response.accessToken,
      expiresOn: response.expiresOn || new Date(Date.now() + 3600000), // Default to 1 hour if not provided
      account: response.account
    };
  }
}

export const msalAuthManager = new MSALAuthManager();