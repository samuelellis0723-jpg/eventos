'use strict';
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const app = require('../index');
const { sequelize } = require('../models');

test('Carga directa de rutas React y proxy /api con base de pruebas', async () => {
  let api;
  let vite;
  const evidence = [];
  const previousTarget = process.env.API_PROXY_TARGET;
  try {
    api = app.listen(0, '127.0.0.1');
    await new Promise(resolve => api.once('listening', resolve));
    process.env.API_PROXY_TARGET = 'http://127.0.0.1:' + api.address().port;
    const frontend = path.resolve(__dirname, '../../frontend');
    const { createServer } = await import(pathToFileURL(path.join(frontend, 'node_modules/vite/dist/node/index.js')).href);
    vite = await createServer({ root: frontend, configFile: path.join(frontend, 'vite.config.js'), logLevel: 'error', server: { host: '127.0.0.1', port: 0, open: false } });
    await vite.listen();
    const base = 'http://127.0.0.1:' + vite.httpServer.address().port;
    for (const route of ['/', '/lealtad', '/encuestas', '/admin/login', '/admin', '/admin/eventos', '/admin/promociones', '/admin/lealtad', '/admin/encuestas']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      assert((await response.text()).includes('<div id="root">'));
      evidence.push({ ruta: route, resultado: 'PASS', http: response.status, comprobacion: 'Carga directa del HTML de la SPA' });
    }
    for (const [route, expected] of [['/api/public/eventos',200],['/api/public/promociones',200],['/api/public/programas-lealtad',200],['/api/public/encuestas',200],['/api/auth/session',401],['/api/admin/eventos',401]]) {
      const response = await fetch(base + route);
      assert.equal(response.status, expected);
      evidence.push({ ruta: route, resultado: 'PASS', http: response.status, comprobacion: 'Proxy Vite a API de pruebas' });
    }
    fs.writeFileSync(path.join(__dirname, '../docs/frontend-route-results.json'), JSON.stringify({ generadoEn: new Date().toISOString(), navegador: { disponible: false, evidencia: 'cua.getState(): {"apps":[],"browsers":[]}' }, casos: evidence }, null, 2) + '\n');
  } finally {
    if (vite) await vite.close();
    if (api) await new Promise(resolve => api.close(resolve));
    await sequelize.close();
    if (previousTarget === undefined) delete process.env.API_PROXY_TARGET;
    else process.env.API_PROXY_TARGET = previousTarget;
  }
});
