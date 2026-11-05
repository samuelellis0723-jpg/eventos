'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EncuestaPregunta extends Model {
    static associate(models) {

      EncuestaPregunta.belongsTo(models.Encuesta, { foreignKey: 'encuesta_id', as: 'encuesta' });
      EncuestaPregunta.hasMany(models.EncuestaOpcion, { foreignKey: 'pregunta_id', as: 'opciones' });
      EncuestaPregunta.hasMany(models.EncuestaRespuesta, { foreignKey: 'pregunta_id', as: 'respuestas' });
        }
  }

  EncuestaPregunta.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    encuesta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'encuesta',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    texto: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    tipo_respuesta: {
      type: DataTypes.ENUM('texto', 'numerica', 'escala', 'opcion_unica', 'opcion_multiple', 'si_no'),
      allowNull: false
    },
    obligatoria: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    orden: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    valor_minimo: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    valor_maximo: {
      type: DataTypes.SMALLINT,
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'EncuestaPregunta',
      tableName: 'encuesta_pregunta',
      freezeTableName: true,
      timestamps: false
    }
  );

  return EncuestaPregunta;
};
