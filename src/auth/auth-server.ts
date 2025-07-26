import http from 'http';
import url from 'url';
import { msalAuthManager } from './msal-auth-manager.js';

export function startAuthServer(port: number): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url || '', true);
      const pathname = parsedUrl.pathname;
      
      if (pathname === '/auth/callback') {
        const query = parsedUrl.query;
        
        if (query.error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<!DOCTYPE html><html><head><title>Auth Error</title></head><body><h2>Authentication Failed</h2><p>${query.error_description || query.error}</p><p>Close this window and try again.</p></body></html>`);
          return;
        }
        
        if (query.code) {
          try {
            await msalAuthManager.acquireTokenByCode(query.code as string);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<!DOCTYPE html><html><head><title>Success</title><style>body{font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:50px;}</style></head><body><h2>Authentication Complete</h2><p>You can now close this window.</p></body></html>`);
          } catch (error: any) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<!DOCTYPE html><html><head><title>Auth Error</title></head><body><h2>Token Error</h2><p>${error.message}</p></body></html>`);
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<!DOCTYPE html><html><head><title>Auth Error</title></head><body><h2>Missing Code</h2><p>Authorization code not found.</p></body></html>`);
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
    
    server.listen(port, () => {
      console.log(`Auth server running at http://localhost:${port}`);
      resolve(server);
    });
    
    server.on('error', reject);
  });
}