'use strict';
const mysql = require('mysql2/promise');
const { spawnSync } = require('child_process');
const path = require('path');
const config = require('../config/config').test;

(async () => {
  if (!/^[a-zA-Z0-9_]+_test$/.test(config.database)) throw new Error('DB_TEST_NAME debe contener letras, números o guiones bajos y terminar en _test.');
  const connection = await mysql.createConnection({ host: config.host, port: config.port, user: config.username, password: config.password });
  try { await connection.query('CREATE DATABASE IF NOT EXISTS ' + mysql.escapeId(config.database) + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'); }
  finally { await connection.end(); }
  const result = spawnSync(process.execPath, [require.resolve('sequelize-cli/lib/sequelize'), 'db:migrate', '--env', 'test'], {
    cwd: path.resolve(__dirname, '..'), env: { ...process.env, NODE_ENV: 'test' }, stdio: 'inherit'
  });
  process.exitCode = result.status || (result.error ? 1 : 0);
})().catch(error => { console.error('No se pudo preparar la base de pruebas:', error.code || error.message); process.exitCode = 1; });
