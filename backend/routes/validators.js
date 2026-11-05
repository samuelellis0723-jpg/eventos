'use strict';

/**
 * Validaciones de parámetros de ruta.
 * Solo verifican el formato de los parámetros que los controladores leen de req.params;
 * la validación de req.body y las reglas de negocio permanecen en los controladores.
 */

// Parámetros que referencian columnas id (INT / BIGINT autoincrementales).
const PARAMETROS_NUMERICOS = [
  'id',
  'contacto_id',
  'usuario_admin_id',
  'rol_admin_id',
  'contenido_id',
  'categoria_id',
  'sesion_id',
  'expositor_id',
  'evento_id',
  'respuesta_id',
  'promocion_id',
  'producto_id'
];

// Longitudes máximas tomadas del DBML: slug varchar(180), cupon.codigo varchar(50).
const LONGITUD_MAXIMA_TEXTO = {
  slug: 180,
  codigo: 50
};

const ENTERO_POSITIVO = /^[1-9]\d*$/;

const validarEnteroPositivo = (req, res, next, valor, nombre) => {
  if (!ENTERO_POSITIVO.test(String(valor))) {
    return res.status(400).json({
      success: false,
      message: `El parámetro '${nombre}' debe ser un entero positivo`
    });
  }
  return next();
};

const validarTexto = (req, res, next, valor, nombre) => {
  const texto = String(valor).trim();
  const maximo = LONGITUD_MAXIMA_TEXTO[nombre];
  if (!texto || texto.length > maximo) {
    return res.status(400).json({
      success: false,
      message: `El parámetro '${nombre}' es obligatorio y debe tener como máximo ${maximo} caracteres`
    });
  }
  return next();
};

/**
 * Registra las validaciones de parámetros en un router de Express.
 */
const registrarValidaciones = (router) => {
  PARAMETROS_NUMERICOS.forEach(nombre => router.param(nombre, validarEnteroPositivo));
  Object.keys(LONGITUD_MAXIMA_TEXTO).forEach(nombre => router.param(nombre, validarTexto));
  return router;
};

module.exports = { registrarValidaciones };

