const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();

  const server = createServer((req, res) => {
    handle(req, res);
  });

  server.listen(3000, () => {
    console.log('> Ready on http://0.0.0.0:3000');
  });
})();