import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';

export async function handleCreateFolder(args: any) {
  const accessToken = await ensureAuthenticated();
  
  const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
  const pathParts = cleanPath.split('/');
  const folderName = pathParts.pop()!;
  const parentPath = pathParts.length > 0 ? pathParts.join('/') : '';
  
  const checkPath = `/me/drive/special/approot:/${cleanPath}`;
  
  try {
    const existingItem = await invokeGraphApi(accessToken, 'GET', checkPath);
    if (existingItem) {
      if (existingItem.folder) {
        throw new Error('Folder already exists');
      } else {
        throw new Error('A file with this name already exists');
      }
    }
  } catch (error) {
    if (!(error as Error).message.includes('404') && !(error as Error).message.includes('not found')) {
      throw error;
    }
  }
  
  const apiPath = parentPath 
    ? `/me/drive/special/approot:/${parentPath}:/children`
    : `/me/drive/special/approot/children`;
  
  const folderData = {
    name: folderName,
    folder: {},
    '@microsoft.graph.conflictBehavior': 'fail'
  };
  
  const response = await invokeGraphApi(accessToken, 'POST', apiPath, folderData);
  
  if (!response) {
    throw new Error('Failed to create folder');
  }
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        folder: {
          id: response.id,
          name: response.name,
          path: args.path,
          createdDateTime: response.createdDateTime,
          lastModifiedDateTime: response.lastModifiedDateTime
        },
      }, null, 2)
    }]
  };
}