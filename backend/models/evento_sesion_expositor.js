'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventoSesionExpositor extends Model {
    static associate(models) {

      EventoSesionExpositor.belongsTo(models.EventoSesion, { foreignKey: 'sesion_id', as: 'sesion' });
      EventoSesionExpositor.belongsTo(models.Expositor, { foreignKey: 'expositor_id', as: 'expositor' });
        }
  }

  EventoSesionExpositor.init(
    {
    sesion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'evento_sesion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    expositor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'expositor',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
    },
    {
      sequelize,
      modelName: 'EventoSesionExpositor',
      tableName: 'evento_sesion_expositor',
      freezeTableName: true,
      timestamps: false
    }
  );

  return EventoSesionExpositor;
};
