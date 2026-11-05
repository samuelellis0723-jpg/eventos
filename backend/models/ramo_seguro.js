'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RamoSeguro extends Model {
    static associate(models) {

      RamoSeguro.hasMany(models.ProductoSeguro, { foreignKey: 'ramo_id', as: 'productos' });
        }
  }

  RamoSeguro.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'RamoSeguro',
      tableName: 'ramo_seguro',
      freezeTableName: true,
      timestamps: false
    }
  );

  return RamoSeguro;
};
