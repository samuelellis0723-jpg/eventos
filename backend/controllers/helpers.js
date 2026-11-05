'use strict';

/**
 * Normaliza el manejo de errores de Sequelize y errores generales
 */
const handleSequelizeError = (err, res) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los campos provistos',
      errors: err.errors.map(e => ({ campo: e.path, mensaje: e.message }))
    });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Conflicto: ya existe un registro con uno de los valores únicos provistos',
      errors: err.errors.map(e => ({ campo: e.path, valor: e.value, mensaje: e.message }))
    });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Violación de clave foránea: el registro relacionado no existe o tiene dependencias que impiden la operación',
      detalle: err.parent ? err.parent.sqlMessage || err.parent.message : err.message
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
};

/**
 * Extrae y valida los parámetros de paginación de la petición
 */
const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Da formato estándar a una respuesta paginada
 */
const formatPaginatedResponse = (count, rows, page, limit) => {
  return {
    success: true,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: rows
  };
};

module.exports = {
  handleSequelizeError,
  getPagination,
  formatPaginatedResponse
};
