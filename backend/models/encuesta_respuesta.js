'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EncuestaRespuesta extends Model {
    static associate(models) {

      EncuestaRespuesta.belongsTo(models.EncuestaParticipacion, { foreignKey: 'participacion_id', as: 'participacion' });
      EncuestaRespuesta.belongsTo(models.EncuestaPregunta, { foreignKey: 'pregunta_id', as: 'pregunta' });
      EncuestaRespuesta.belongsToMany(models.EncuestaOpcion, {
        through: models.EncuestaRespuestaOpcion,
        foreignKey: 'respuesta_id',
        otherKey: 'opcion_id',
        as: 'opciones'
      });
      EncuestaRespuesta.hasMany(models.EncuestaRespuestaOpcion, { foreignKey: 'respuesta_id', as: 'encuesta_respuesta_opciones' });
        }
  }

  EncuestaRespuesta.init(
    {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    participacion_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'encuesta_participacion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    pregunta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'encuesta_pregunta',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    valor_texto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valor_numerico: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'EncuestaRespuesta',
      tableName: 'encuesta_respuesta',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { unique: true, name: 'encuesta_resp_part_preg_unique', fields: ["participacion_id","pregunta_id"] }
    ]
    }
  );

  return EncuestaRespuesta;
};
