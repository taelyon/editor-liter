import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import apiApp from './api/index.js'; // Use .js extension for TS node resolution if required, or let tsx handle it

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mount API Routes from separate app
  app.use(apiApp);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
