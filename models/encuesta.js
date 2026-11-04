'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Encuesta extends Model {
    static associate(models) {

      Encuesta.belongsTo(models.Empleado, { foreignKey: 'creada_por', as: 'creador' });
      Encuesta.hasMany(models.EncuestaPregunta, { foreignKey: 'encuesta_id', as: 'preguntas' });
      Encuesta.hasMany(models.EncuestaParticipacion, { foreignKey: 'encuesta_id', as: 'participaciones' });
        }
  }

  Encuesta.init(
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
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    introduccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('nps', 'satisfaccion', 'conocimiento_marca', 'estudio_mercado', 'post_venta'),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    publica: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    permite_anonimas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    creada_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    creada_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'Encuesta',
      tableName: 'encuesta',
      freezeTableName: true,
      timestamps: false
    }
  );

  return Encuesta;
};
