'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventoMercadeo extends Model {
    static associate(models) {

      EventoMercadeo.belongsTo(models.ActivoCreativo, { foreignKey: 'imagen_portada_id', as: 'imagen_portada' });
      EventoMercadeo.belongsTo(models.Empleado, { foreignKey: 'responsable_id', as: 'responsable' });
      EventoMercadeo.hasMany(models.EventoSesion, { foreignKey: 'evento_id', as: 'sesiones' });
      EventoMercadeo.hasMany(models.EventoInscripcion, { foreignKey: 'evento_id', as: 'inscripciones' });
      EventoMercadeo.belongsToMany(models.Contacto, {
        through: models.EventoInscripcion,
        foreignKey: 'evento_id',
        otherKey: 'contacto_id',
        as: 'contactos'
      });
        }
  }

  EventoMercadeo.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    resumen: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('feria', 'webinar', 'charla', 'patrocinio', 'otro'),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('planificado', 'en_curso', 'realizado', 'cancelado'),
      allowNull: false,
      defaultValue: 'planificado'
    },
    estado_publicacion: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    modalidad: {
      type: DataTypes.ENUM('presencial', 'virtual', 'hibrido'),
      allowNull: false
    },
    lugar: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    url_virtual: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    inscripciones_desde: {
      type: DataTypes.DATE,
      allowNull: true
    },
    inscripciones_hasta: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cupo_maximo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    destacado_en_inicio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    imagen_portada_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    responsable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'EventoMercadeo',
      tableName: 'evento_mercadeo',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'evento_mercadeo_pub_inicio_idx', fields: ["estado_publicacion","fecha_inicio"] },
      { name: 'evento_mercadeo_destacado_idx', fields: ["destacado_en_inicio"] }
    ]
    }
  );

  return EventoMercadeo;
};
