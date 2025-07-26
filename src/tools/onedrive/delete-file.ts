import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';

export async function handleDeleteFile(args: any) {
  const accessToken = await ensureAuthenticated();
  
  const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
  
  const metadataPath = `/me/drive/special/approot:/${cleanPath}`;
  
  let itemMetadata: any;
  try {
    itemMetadata = await invokeGraphApi(accessToken, 'GET', metadataPath);
  } catch (error) {
    if ((error as Error).message.includes('404') || (error as Error).message.includes('not found')) {
      throw new Error('File or folder not found');
    }
    throw error;
  }
  
  const deletePath = `/me/drive/special/approot:/${cleanPath}`;
  await invokeGraphApi(accessToken, 'DELETE', deletePath);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        deletedItem: {
          name: itemMetadata.name,
          path: args.path,
          type: itemMetadata.folder ? 'folder' : 'file'
        },
      }, null, 2)
    }]
  };
}