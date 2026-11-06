'use strict';
require('dotenv').config({ quiet: true });

const express = require('express');
const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

// Middlewares para parseo de peticiones
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Endpoint de bienvenida y estado del servicio
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de Gestión de Eventos y Mercadeo',
    version: '1.0.0',
    endpoints: '/api'
  });
});

// Montaje de las rutas principales
app.use('/api', routes);

// Manejador 404 para rutas inexistentes en formato JSON
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador global de errores (e.g. JSON malformado)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON malformado en el cuerpo de la petición',
      error: err.message
    });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.status && err.status < 500 ? err.message : 'Error interno del servidor'
  });
});

// Inicio del servidor y verificación de conexión a la base de datos
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📡 Rutas API disponibles en http://localhost:${PORT}/api`);
    console.log(`==================================================`);

    try {
      await sequelize.authenticate();
      console.log('✅ Conexión con la base de datos MySQL establecida correctamente.\n');
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos MySQL:', error.message, '\n');
    }
  });
}

module.exports = app;
