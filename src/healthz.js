// src/healthz.js
export function registerHealth(app) {
  app.get('/healthz', (_req, res) => {
    res.type('text/plain').send('ok');
  });

  // Opcionales (recomendados)
  app.get('/readyz', (_req, res) => {
    res.type('text/plain').send('ready');
  });

  app.get('/livez', (_req, res) => {
    res.type('text/plain').send('live');
  });

  // (Si hoy tienes /health y no quieres romper nada, puedes mantenerlo)
  app.get('/health', (_req, res) => {
    res.type('text/plain').send('ok');
  });
}