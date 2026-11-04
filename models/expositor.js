'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expositor extends Model {
    static associate(models) {

      Expositor.belongsTo(models.ActivoCreativo, { foreignKey: 'foto_id', as: 'foto' });
      Expositor.belongsToMany(models.EventoSesion, {
        through: models.EventoSesionExpositor,
        foreignKey: 'expositor_id',
        otherKey: 'sesion_id',
        as: 'sesiones'
      });
      Expositor.hasMany(models.EventoSesionExpositor, { foreignKey: 'expositor_id', as: 'evento_sesion_expositores' });
        }
  }

  Expositor.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    organizacion: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    foto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
    },
    {
      sequelize,
      modelName: 'Expositor',
      tableName: 'expositor',
      freezeTableName: true,
      timestamps: false
    }
  );

  return Expositor;
};
