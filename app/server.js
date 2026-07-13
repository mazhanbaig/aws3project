const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname: '0.0.0.0', port });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();

  const server = createServer((req, res) => {
    handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
})();