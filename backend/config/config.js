'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });

function databaseConfig(environment) {
  const database = environment === 'test' ? process.env.DB_TEST_NAME : process.env.DB_NAME;
  if (!database || !process.env.DB_USER) throw new Error('Configura DB_NAME (o DB_TEST_NAME para pruebas) y DB_USER en backend/.env.');
  if (environment === 'test' && (database === process.env.DB_NAME || !database.endsWith('_test'))) {
    throw new Error('DB_TEST_NAME debe ser diferente de DB_NAME y terminar en _test.');
  }
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    timezone: '+00:00'
  };
}

// Getters: Sequelize CLI y el servidor resuelven solo el entorno seleccionado.
for (const environment of ['development', 'test', 'production']) {
  Object.defineProperty(module.exports, environment, { enumerable: true, get: () => databaseConfig(environment) });
}
