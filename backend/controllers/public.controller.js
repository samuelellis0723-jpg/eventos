'use strict';

const { Op } = require('sequelize');
const {
  sequelize,
  EventoMercadeo,
  Promocion,
  ProgramaLealtad,
  BeneficioLealtad,
  Encuesta,
  EncuestaPregunta,
  EncuestaOpcion
} = require('../models');

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const CURRENT_DATE = sequelize.literal('CURRENT_DATE');
const { publicWindow, publicSurveyWhere } = require('../services/public-survey-policy');

function parsePagination(req, res) {
  const pageValue = req.query.page;
  const limitValue = req.query.limit;
  const page = pageValue === undefined ? 1 : Number(pageValue);
  const limit = limitValue === undefined ? DEFAULT_PAGE_SIZE : Number(limitValue);

  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    res.status(400).json({
      success: false,
      message: `La paginación requiere page >= 1 y limit entre 1 y ${MAX_PAGE_SIZE}.`
    });
    return null;
  }

  return { page, limit, offset: (page - 1) * limit };
}

function paginatedResponse(res, rows, total, page, limit) {
  return res.status(200).json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: rows
  });
}

function projectRecord(record, fields) {
  const source = typeof record?.get === 'function' ? record.get({ plain: true }) : record;
  return fields.reduce((result, field) => {
    if (source[field] !== undefined) result[field] = source[field];
    return result;
  }, {});
}

function handlePublicError(res, error, operation) {
  console.error(`Error al consultar ${operation} públicos:`, error);
  return res.status(500).json({
    success: false,
    message: 'No fue posible cargar la información pública.'
  });
}

async function listPublicRecords({ req, res, Model, where, attributes, include, order, operation }) {
  const pagination = parsePagination(req, res);
  if (!pagination) return null;

  try {
    // Count y selección comparten el filtro público; el LIMIT se aplica después del WHERE.
    const [total, rows] = await Promise.all([
      Model.count({ where }),
      Model.findAll({
        where,
        attributes,
        include,
        order,
        limit: pagination.limit,
        offset: pagination.offset
      })
    ]);
    return paginatedResponse(
      res,
      rows.map((row) => projectRecord(row, attributes)),
      total,
      pagination.page,
      pagination.limit
    );
  } catch (error) {
    return handlePublicError(res, error, operation);
  }
}

module.exports = {
  getEvents(req, res) {
    return listPublicRecords({
      req,
      res,
      Model: EventoMercadeo,
      where: { estado_publicacion: 'publicado' },
      attributes: [
        'id', 'nombre', 'resumen', 'descripcion', 'estado', 'modalidad', 'lugar',
        'fecha_inicio', 'fecha_fin'
      ],
      order: [['destacado_en_inicio', 'DESC'], ['fecha_inicio', 'ASC'], ['id', 'ASC']],
      operation: 'eventos'
    });
  },

  getPromotions(req, res) {
    return listPublicRecords({
      req,
      res,
      Model: Promocion,
      where: {
        estado: 'publicado',
        fecha_inicio: { [Op.lte]: CURRENT_DATE },
        fecha_fin: { [Op.gte]: CURRENT_DATE }
      },
      attributes: ['id', 'nombre', 'resumen', 'descripcion', 'condiciones', 'fecha_inicio', 'fecha_fin'],
      order: [['destacado_en_inicio', 'DESC'], ['fecha_inicio', 'ASC'], ['id', 'ASC']],
      operation: 'promociones'
    });
  },

  async getLoyaltyPrograms(req, res) {
    const pagination = parsePagination(req, res);
    if (!pagination) return null;

    const where = {
      estado: 'publicado',
      ...publicWindow('fecha_inicio', 'fecha_fin')
    };

    try {
      const [total, programs] = await Promise.all([
        ProgramaLealtad.count({ where }),
        ProgramaLealtad.findAll({
          where,
          attributes: ['id', 'nombre', 'descripcion'],
          order: [['id', 'ASC']],
          limit: pagination.limit,
          offset: pagination.offset
        })
      ]);

      const programIds = programs.map((program) => program.id);
      const benefits = programIds.length === 0
        ? []
        : await BeneficioLealtad.findAll({
          where: { programa_id: { [Op.in]: programIds }, activo: true },
          attributes: ['id', 'programa_id', 'nombre', 'descripcion', 'puntos_requeridos'],
          order: [['puntos_requeridos', 'ASC'], ['id', 'ASC']]
        });
      const benefitsByProgram = new Map(programIds.map((id) => [id, []]));
      benefits.forEach((benefit) => benefitsByProgram.get(benefit.programa_id)?.push(benefit));

      const rows = programs.map((program) => ({
        id: program.id,
        nombre: program.nombre,
        descripcion: program.descripcion,
        beneficios: benefitsByProgram.get(program.id) || []
      }));
      return paginatedResponse(res, rows, total, pagination.page, pagination.limit);
    } catch (error) {
      return handlePublicError(res, error, 'programas de lealtad');
    }
  },

  getSurveys(req, res) {
    return listPublicRecords({
      req,
      res,
      Model: Encuesta,
      where: publicSurveyWhere(),
      attributes: ['slug', 'titulo', 'introduccion', 'tipo', 'permite_anonimas'],
      order: [['titulo', 'ASC'], ['id', 'ASC']],
      operation: 'encuestas'
    });
  },

  async getSurveyBySlug(req, res) {
    try {
      const survey = await Encuesta.findOne({
        where: publicSurveyWhere(req.params.slug),
        attributes: ['slug', 'titulo', 'introduccion', 'tipo', 'permite_anonimas'],
        include: [{
          model: EncuestaPregunta,
          as: 'preguntas',
          attributes: ['id', 'texto', 'tipo_respuesta', 'obligatoria', 'orden', 'valor_minimo', 'valor_maximo'],
          include: [{
            model: EncuestaOpcion,
            as: 'opciones',
            attributes: ['id', 'pregunta_id', 'etiqueta', 'valor', 'orden']
          }]
        }],
        order: [
          [{ model: EncuestaPregunta, as: 'preguntas' }, 'orden', 'ASC'],
          [{ model: EncuestaPregunta, as: 'preguntas' }, { model: EncuestaOpcion, as: 'opciones' }, 'orden', 'ASC']
        ]
      });

      if (!survey) {
        return res.status(404).json({ success: false, message: 'Encuesta pública no encontrada.' });
      }

      const data = projectRecord(survey, ['slug', 'titulo', 'introduccion', 'tipo', 'permite_anonimas']);
      const raw = survey.get({ plain: true });
      data.preguntas = (raw.preguntas || []).map((question) => ({
        ...projectRecord(question, ['id', 'texto', 'tipo_respuesta', 'obligatoria', 'orden', 'valor_minimo', 'valor_maximo']),
        opciones: (question.opciones || []).map((option) => projectRecord(option, ['id', 'etiqueta', 'valor']))
      }));

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handlePublicError(res, error, 'detalle de encuesta');
    }
  }
};
