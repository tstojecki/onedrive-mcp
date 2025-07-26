import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';
import { config } from '../../config.js';

export async function handleListFiles(args: any) {
  const accessToken = await ensureAuthenticated();
  
  let apiPath = '/me/drive/special/approot/children';
  if (args?.path) {
    const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
    apiPath = `/me/drive/special/approot:/${cleanPath}:/children`;
  }
  
  const queryParams = {
    '$select': config.onedrive.fileSelectFields,
    '$top': config.onedrive.defaultPageSize
  };
  
  const response = await invokeGraphApi(accessToken, 'GET', apiPath, null, queryParams);
  
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  const files = response.value || [];
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        path: args?.path || '/',
        totalItems: files.length,
        files: files.map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.folder ? 'folder' : 'file',
          size: file.size || 0,
          createdDateTime: file.createdDateTime,
          lastModifiedDateTime: file.lastModifiedDateTime,
          downloadUrl: file['@microsoft.graph.downloadUrl'] || undefined
        }))
      }, null, 2)
    }]
  };
}