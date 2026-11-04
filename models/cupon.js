'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cupon extends Model {
    static associate(models) {

      Cupon.belongsTo(models.Promocion, { foreignKey: 'promocion_id', as: 'promocion' });
      Cupon.belongsTo(models.Contacto, { foreignKey: 'contacto_asignado_id', as: 'contacto_asignado' });
      Cupon.hasOne(models.PromocionCanje, { foreignKey: 'cupon_id', as: 'canje' });
        }
  }

  Cupon.init(
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
      onDelete: 'CASCADE'
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    contacto_asignado_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    estado: {
      type: DataTypes.ENUM('disponible', 'asignado', 'canjeado', 'vencido', 'anulado'),
      allowNull: false,
      defaultValue: 'disponible'
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    vence_en: {
      type: DataTypes.DATE,
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'Cupon',
      tableName: 'cupon',
      freezeTableName: true,
      timestamps: false
    }
  );

  return Cupon;
};
