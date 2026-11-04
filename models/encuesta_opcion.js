'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EncuestaOpcion extends Model {
    static associate(models) {

      EncuestaOpcion.belongsTo(models.EncuestaPregunta, { foreignKey: 'pregunta_id', as: 'pregunta' });
      EncuestaOpcion.belongsToMany(models.EncuestaRespuesta, {
        through: models.EncuestaRespuestaOpcion,
        foreignKey: 'opcion_id',
        otherKey: 'respuesta_id',
        as: 'respuestas'
      });
      EncuestaOpcion.hasMany(models.EncuestaRespuestaOpcion, { foreignKey: 'opcion_id', as: 'encuesta_respuesta_opciones' });
        }
  }

  EncuestaOpcion.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
    etiqueta: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    valor: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    orden: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
    },
    {
      sequelize,
      modelName: 'EncuestaOpcion',
      tableName: 'encuesta_opcion',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { unique: true, name: 'encuesta_opcion_pregunta_valor_unique', fields: ["pregunta_id","valor"] }
    ]
    }
  );

  return EncuestaOpcion;
};
