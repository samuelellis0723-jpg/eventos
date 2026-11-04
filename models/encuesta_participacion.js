'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EncuestaParticipacion extends Model {
    static associate(models) {

      EncuestaParticipacion.belongsTo(models.Encuesta, { foreignKey: 'encuesta_id', as: 'encuesta' });
      EncuestaParticipacion.belongsTo(models.Contacto, { foreignKey: 'contacto_id', as: 'contacto' });
      EncuestaParticipacion.hasMany(models.EncuestaRespuesta, { foreignKey: 'participacion_id', as: 'respuestas' });
        }
  }

  EncuestaParticipacion.init(
    {
    id: {
      type: DataTypes.BIGINT,
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
    contacto_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    iniciada_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    enviada_en: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fuente: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'EncuestaParticipacion',
      tableName: 'encuesta_participacion',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'encuesta_participacion_encuesta_env_idx', fields: ["encuesta_id","enviada_en"] },
      { name: 'encuesta_participacion_contacto_idx', fields: ["contacto_id"] }
    ]
    }
  );

  return EncuestaParticipacion;
};
