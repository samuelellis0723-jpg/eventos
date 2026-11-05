'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolAdmin extends Model {
    static associate(models) {

      RolAdmin.belongsToMany(models.UsuarioAdmin, {
        through: models.UsuarioAdminRol,
        foreignKey: 'rol_admin_id',
        otherKey: 'usuario_admin_id',
        as: 'usuarios'
      });
      RolAdmin.hasMany(models.UsuarioAdminRol, { foreignKey: 'rol_admin_id', as: 'usuario_admin_roles' });
        }
  }

  RolAdmin.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'RolAdmin',
      tableName: 'rol_admin',
      freezeTableName: true,
      timestamps: false
    }
  );

  return RolAdmin;
};
