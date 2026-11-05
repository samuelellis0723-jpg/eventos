'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PromocionCanje extends Model {
    static associate(models) {

      PromocionCanje.belongsTo(models.Promocion, { foreignKey: 'promocion_id', as: 'promocion' });
      PromocionCanje.belongsTo(models.Contacto, { foreignKey: 'contacto_id', as: 'contacto' });
      PromocionCanje.belongsTo(models.Cupon, { foreignKey: 'cupon_id', as: 'cupon' });
      PromocionCanje.belongsTo(models.Empleado, { foreignKey: 'registrado_por', as: 'registrador' });
        }
  }

  PromocionCanje.init(
    {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    promocion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'promocion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    contacto_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    cupon_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
      references: {
        model: 'cupon',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    canjeado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    referencia_poliza: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    registrado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
    },
    {
      sequelize,
      modelName: 'PromocionCanje',
      tableName: 'promocion_canje',
      freezeTableName: true,
      timestamps: false
    }
  );

  return PromocionCanje;
};
