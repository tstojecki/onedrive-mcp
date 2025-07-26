import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';
import { config } from '../../config.js';

export async function handleUpdateFile(args: any) {
  const accessToken = await ensureAuthenticated();
  
  const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
  
  const contentBuffer = Buffer.from(args.content, 'utf8');
  if (contentBuffer.length > config.onedrive.maxFileSize) {
    throw new Error(`File size (${contentBuffer.length} bytes) exceeds maximum allowed size (${config.onedrive.maxFileSize} bytes)`);
  }
  
  const metadataPath = `/me/drive/special/approot:/${cleanPath}`;
  
  try {
    const existingFile = await invokeGraphApi(accessToken, 'GET', metadataPath);
    
    if (existingFile.folder) {
      throw new Error('Cannot update a folder');
    }
  } catch (error) {
    if ((error as Error).message.includes('404') || (error as Error).message.includes('not found')) {
      throw new Error('File not found');
    }
    throw error;
  }
  
  const apiPath = `/me/drive/special/approot:/${cleanPath}:/content`;
  const contentType = args.contentType || 'text/plain';
  
  const response = await invokeGraphApi(
    accessToken,
    'PUT',
    apiPath,
    args.content,
    {},
    { 'Content-Type': contentType }
  );
  
  if (!response) {
    throw new Error('Failed to update file');
  }
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        file: {
          id: response.id,
          name: response.name,
          path: args.path,
          size: response.size,
          contentType: response.file?.mimeType || contentType,
          lastModifiedDateTime: response.lastModifiedDateTime,
          downloadUrl: response['@microsoft.graph.downloadUrl']
        },
      }, null, 2)
    }]
  };
}