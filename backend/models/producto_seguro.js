'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductoSeguro extends Model {
    static associate(models) {

      ProductoSeguro.belongsTo(models.RamoSeguro, { foreignKey: 'ramo_id', as: 'ramo' });
      ProductoSeguro.belongsToMany(models.Promocion, {
        through: models.PromocionProducto,
        foreignKey: 'producto_id',
        otherKey: 'promocion_id',
        as: 'promociones'
      });
      ProductoSeguro.hasMany(models.PromocionProducto, { foreignKey: 'producto_id', as: 'promocion_productos' });
        }
  }

  ProductoSeguro.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    ramo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ramo_seguro',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    codigo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
    },
    {
      sequelize,
      modelName: 'ProductoSeguro',
      tableName: 'producto_seguro',
      freezeTableName: true,
      timestamps: false
    }
  );

  return ProductoSeguro;
};
