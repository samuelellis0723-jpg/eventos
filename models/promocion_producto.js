'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PromocionProducto extends Model {
    static associate(models) {

      PromocionProducto.belongsTo(models.Promocion, { foreignKey: 'promocion_id', as: 'promocion' });
      PromocionProducto.belongsTo(models.ProductoSeguro, { foreignKey: 'producto_id', as: 'producto' });
        }
  }

  PromocionProducto.init(
    {
    promocion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'promocion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    producto_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'producto_seguro',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
    },
    {
      sequelize,
      modelName: 'PromocionProducto',
      tableName: 'promocion_producto',
      freezeTableName: true,
      timestamps: false
    }
  );

  return PromocionProducto;
};
