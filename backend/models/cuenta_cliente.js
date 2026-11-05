'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CuentaCliente extends Model {
    static associate(models) {

      CuentaCliente.belongsTo(models.Contacto, { foreignKey: 'contacto_id', as: 'contacto' });
        }
  }

  CuentaCliente.init(
    {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    contacto_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    proveedor_auth: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    subject_auth: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    creada_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'CuentaCliente',
      tableName: 'cuenta_cliente',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { unique: true, name: 'cuenta_cliente_proveedor_subject_unique', fields: ["proveedor_auth","subject_auth"] }
    ]
    }
  );

  return CuentaCliente;
};
