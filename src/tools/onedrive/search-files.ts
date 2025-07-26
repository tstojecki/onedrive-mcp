import { ensureAuthenticated } from '../../auth/auth-utils.js';
import { invokeGraphApi } from '../../onedrive/graph-api.js';
import { config } from '../../config.js';

export async function handleSearchFiles(args: any) {
  const accessToken = await ensureAuthenticated();
  
  let apiPath = '/me/drive/special/approot/search(q=\'' + encodeURIComponent(args.query) + '\')';
  
  if (args.path) {
    const cleanPath = args.path.replace(/^\/+|\/+$/g, '');
    apiPath = `/me/drive/special/approot:/${cleanPath}:/search(q='${encodeURIComponent(args.query)}')`;
  }
  
  const queryParams = {
    '$select': config.onedrive.fileSelectFields,
    '$top': config.onedrive.maxResultCount
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
        query: args.query,
        searchPath: args.path || '/',
        totalResults: files.length,
        files: files.map((file: any) => {
          const parentPath = file.parentReference?.path || '';
          const appFolderPrefix = '/drive/special/approot';
          let relativePath = file.name;
          
          if (parentPath.includes(appFolderPrefix)) {
            const pathAfterAppRoot = parentPath.substring(parentPath.indexOf(appFolderPrefix) + appFolderPrefix.length);
            if (pathAfterAppRoot && pathAfterAppRoot !== '/') {
              relativePath = pathAfterAppRoot.replace(/^\/+/, '') + '/' + file.name;
            }
          }
          
          return {
            id: file.id,
            name: file.name,
            path: relativePath,
            type: file.folder ? 'folder' : 'file',
            size: file.size || 0,
            createdDateTime: file.createdDateTime,
            lastModifiedDateTime: file.lastModifiedDateTime,
            downloadUrl: file['@microsoft.graph.downloadUrl'] || undefined
          };
        })
      }, null, 2)
    }]
  };
}