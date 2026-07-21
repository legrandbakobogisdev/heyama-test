// Reverse proxy local : un seul port (donc un seul tunnel ngrok) qui
// redistribue vers l'API (défaut), le web (/app) et MinIO (/uploads).
// Nécessaire car le plan gratuit ngrok n'accorde qu'un seul hostname public.
const http = require('http');
const httpProxy = require('http-proxy');

const PORT = 8000;
const TARGETS = {
  uploads: 'http://localhost:9000',
  app: 'http://localhost:3001',
  api: 'http://localhost:3000',
};

const proxy = httpProxy.createProxyServer({ ws: true });
proxy.on('error', (err, _req, res) => {
  console.error('Erreur proxy:', err.message);
  if (res.writeHead) {
    res.writeHead(502);
    res.end('Bad gateway');
  }
});

function resolveTarget(pathname) {
  if (pathname.startsWith('/uploads/')) {
    return { target: TARGETS.uploads, strip: '/uploads' };
  }
  if (pathname.startsWith('/app')) {
    // pas de strip : next.js gère lui-même le prefixe via basePath
    return { target: TARGETS.app, strip: '' };
  }
  return { target: TARGETS.api, strip: '' };
}

function rewriteUrl(req, strip) {
  if (!strip) return;
  const pathname = req.url.split('?')[0];
  if (pathname.startsWith(strip)) {
    req.url = req.url.slice(strip.length) || '/';
  }
}

const server = http.createServer((req, res) => {
  const { target, strip } = resolveTarget(req.url.split('?')[0]);
  rewriteUrl(req, strip);
  proxy.web(req, res, { target });
});

server.on('upgrade', (req, socket, head) => {
  const { target, strip } = resolveTarget(req.url.split('?')[0]);
  rewriteUrl(req, strip);
  proxy.ws(req, socket, head, { target });
});

server.listen(PORT, () => {
  console.log(`Reverse proxy en écoute sur http://localhost:${PORT}`);
  console.log('  /            -> api (localhost:3000)');
  console.log('  /app         -> web (localhost:3001)');
  console.log('  /uploads/*   -> minio (localhost:9000)');
});
