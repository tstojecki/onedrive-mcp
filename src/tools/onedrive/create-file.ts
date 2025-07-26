import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';
import { config } from '../../config.js';

export async function handleCreateFile(args: any) {
  const accessToken = await ensureAuthenticated();
  
  const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
  const pathParts = cleanPath.split('/');
  const fileName = pathParts.pop()!;
  const folderPath = pathParts.length > 0 ? pathParts.join('/') : '';
  
  const contentBuffer = Buffer.from(args.content, 'utf8');
  if (contentBuffer.length > config.onedrive.maxFileSize) {
    throw new Error(`File size (${contentBuffer.length} bytes) exceeds maximum allowed size (${config.onedrive.maxFileSize} bytes)`);
  }
  
  const apiPath = folderPath 
    ? `/me/drive/special/approot:/${folderPath}/${fileName}:/content`
    : `/me/drive/special/approot:/${fileName}:/content`;
  
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
    throw new Error('Failed to create file');
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
          createdDateTime: response.createdDateTime,
          lastModifiedDateTime: response.lastModifiedDateTime,
          downloadUrl: response['@microsoft.graph.downloadUrl']
        },
      }, null, 2)
    }]
  };
}