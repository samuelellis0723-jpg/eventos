'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EncuestaRespuestaOpcion extends Model {
    static associate(models) {

      EncuestaRespuestaOpcion.belongsTo(models.EncuestaRespuesta, { foreignKey: 'respuesta_id', as: 'respuesta' });
      EncuestaRespuestaOpcion.belongsTo(models.EncuestaOpcion, { foreignKey: 'opcion_id', as: 'opcion' });
        }
  }

  EncuestaRespuestaOpcion.init(
    {
    respuesta_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'encuesta_respuesta',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    opcion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'encuesta_opcion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
    },
    {
      sequelize,
      modelName: 'EncuestaRespuestaOpcion',
      tableName: 'encuesta_respuesta_opcion',
      freezeTableName: true,
      timestamps: false
    }
  );

  return EncuestaRespuestaOpcion;
};
