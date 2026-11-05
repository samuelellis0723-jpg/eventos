'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventoSesion extends Model {
    static associate(models) {

      EventoSesion.belongsTo(models.EventoMercadeo, { foreignKey: 'evento_id', as: 'evento' });
      EventoSesion.belongsToMany(models.Expositor, {
        through: models.EventoSesionExpositor,
        foreignKey: 'sesion_id',
        otherKey: 'expositor_id',
        as: 'expositores'
      });
      EventoSesion.hasMany(models.EventoSesionExpositor, { foreignKey: 'sesion_id', as: 'evento_sesion_expositores' });
        }
  }

  EventoSesion.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento_mercadeo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
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
    orden: {
      type: DataTypes.SMALLINT,
      allowNull: false
    }
    },
    {
      sequelize,
      modelName: 'EventoSesion',
      tableName: 'evento_sesion',
      freezeTableName: true,
      timestamps: false
    }
  );

  return EventoSesion;
};
