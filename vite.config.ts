import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'vercel-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/explain')) {
              try {
                // Load typescript api handler using Vite SSR runner
                const { default: handler } = await server.ssrLoadModule('./api/explain.ts');

                // Read and buffer POST payload
                let body: any = {};
                if (req.method === 'POST') {
                  const buffers: Buffer[] = [];
                  for await (const chunk of req) {
                    buffers.push(Buffer.from(chunk));
                  }
                  const data = Buffer.concat(buffers).toString();
                  if (data) {
                    try {
                      body = JSON.parse(data);
                    } catch (e) {
                      body = {};
                    }
                  }
                }

                // Inject vercel-like helpers and values
                const vercelReq = Object.assign(req, { body });
                res.setHeader('Content-Type', 'application/json');
                const vercelRes = Object.assign(res, {
                  status(statusCode: number) {
                    res.statusCode = statusCode;
                    return this;
                  },
                  json(jsonData: any) {
                    res.end(JSON.stringify(jsonData));
                    return this;
                  },
                  send(text: string) {
                    res.end(text);
                    return this;
                  }
                });

                await handler(vercelReq, vercelRes);
                return;
              } catch (err: any) {
                console.error('Vercel API dev simulator error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
