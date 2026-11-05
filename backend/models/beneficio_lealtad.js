'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BeneficioLealtad extends Model {
    static associate(models) {

      BeneficioLealtad.belongsTo(models.ProgramaLealtad, { foreignKey: 'programa_id', as: 'programa' });
      BeneficioLealtad.belongsTo(models.ActivoCreativo, { foreignKey: 'imagen_id', as: 'imagen' });
      BeneficioLealtad.hasMany(models.CanjeBeneficio, { foreignKey: 'beneficio_id', as: 'canjes' });
        }
  }

  BeneficioLealtad.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    programa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programa_lealtad',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    puntos_requeridos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    existencias: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    imagen_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
    },
    {
      sequelize,
      modelName: 'BeneficioLealtad',
      tableName: 'beneficio_lealtad',
      freezeTableName: true,
      timestamps: false
    }
  );

  return BeneficioLealtad;
};
