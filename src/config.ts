import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const homeDir = process.env.HOME || process.env.USERPROFILE || os.homedir() || '/tmp';
const redirectUriPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUriPort: number;
  redirectUri: string;
  scopes: string[];
  tokenCachePath: string;
}

export interface OneDriveConfig {
  graphApiEndpoint: string;
  appFolderEndpoint: string;
  fileSelectFields: string;
  fileDetailFields: string;
  defaultPageSize: number;
  maxResultCount: number;
  maxFileSize: number;
  largeFileThreshold: number;
}

export interface Config {
  oauth: OAuthConfig;
  onedrive: OneDriveConfig;
}

export const config: Config = {
  oauth: {
    clientId: process.env.ONEDRIVE_CLIENT_ID || '',
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || '',
    redirectUriPort: redirectUriPort,
    redirectUri: `http://localhost:${redirectUriPort}/auth/callback`,
    scopes: ['Files.ReadWrite.AppFolder'],
    tokenCachePath: path.join(homeDir, '.onedrive-mcp-tokens.json')
  },
  
  onedrive: {
    graphApiEndpoint: 'https://graph.microsoft.com/v1.0/',
    appFolderEndpoint: 'https://graph.microsoft.com/v1.0/me/drive/special/approot',
    fileSelectFields: 'id,name,size,createdDateTime,lastModifiedDateTime,@microsoft.graph.downloadUrl',
    fileDetailFields: 'id,name,size,createdDateTime,lastModifiedDateTime,@microsoft.graph.downloadUrl,file,folder,parentReference',
    defaultPageSize: 25,
    maxResultCount: 50,
    maxFileSize: 4 * 1024 * 1024,
    largeFileThreshold: 4 * 1024 * 1024
  }
};

export default config;