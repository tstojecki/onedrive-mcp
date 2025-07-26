import https from 'https';
import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';

export async function handleReadFile(args: any) {
  const accessToken = await ensureAuthenticated();
  
  const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
  
  const metadataPath = `/me/drive/special/approot:/${cleanPath}`;
  const fileMetadata = await invokeGraphApi(accessToken, 'GET', metadataPath);
  
  if (!fileMetadata) {
    throw new Error('File not found');
  }
  
  if (fileMetadata.folder) {
    throw new Error('Cannot read content of a folder');
  }
  
  const downloadUrl = fileMetadata['@microsoft.graph.downloadUrl'];
  if (!downloadUrl) {
    throw new Error('File download URL not available');
  }
  
  const content = await downloadFileContent(downloadUrl);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        file: {
          path: args.path,
          name: fileMetadata.name,
          size: fileMetadata.size,
          contentType: fileMetadata.file?.mimeType || 'text/plain',
          lastModifiedDateTime: fileMetadata.lastModifiedDateTime,
          content: content
        }
      }, null, 2)
    }]
  };
}

function downloadFileContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
      
      response.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}