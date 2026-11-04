'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsuarioAdminRol extends Model {
    static associate(models) {

      UsuarioAdminRol.belongsTo(models.UsuarioAdmin, { foreignKey: 'usuario_admin_id', as: 'usuario_admin' });
      UsuarioAdminRol.belongsTo(models.RolAdmin, { foreignKey: 'rol_admin_id', as: 'rol_admin' });
        }
  }

  UsuarioAdminRol.init(
    {
    usuario_admin_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'usuario_admin',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    rol_admin_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'rol_admin',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
    },
    {
      sequelize,
      modelName: 'UsuarioAdminRol',
      tableName: 'usuario_admin_rol',
      freezeTableName: true,
      timestamps: false
    }
  );

  return UsuarioAdminRol;
};
