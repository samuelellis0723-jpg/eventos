'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventoInscripcion extends Model {
    static associate(models) {

      EventoInscripcion.belongsTo(models.EventoMercadeo, { foreignKey: 'evento_id', as: 'evento' });
      EventoInscripcion.belongsTo(models.Contacto, { foreignKey: 'contacto_id', as: 'contacto' });
        }
  }

  EventoInscripcion.init(
    {
    evento_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'evento_mercadeo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    contacto_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    estado: {
      type: DataTypes.ENUM('inscrito', 'confirmado', 'lista_espera', 'cancelado', 'asistio', 'ausente'),
      allowNull: false,
      defaultValue: 'inscrito'
    },
    registrado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    confirmado_en: {
      type: DataTypes.DATE,
      allowNull: true
    },
    check_in_en: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notas: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'EventoInscripcion',
      tableName: 'evento_inscripcion',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'evento_inscripcion_evento_estado_idx', fields: ["evento_id","estado"] }
    ]
    }
  );

  return EventoInscripcion;
};
