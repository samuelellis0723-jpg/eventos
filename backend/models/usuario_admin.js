'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsuarioAdmin extends Model {
    static associate(models) {

      UsuarioAdmin.belongsTo(models.Empleado, { foreignKey: 'empleado_id', as: 'empleado' });
      UsuarioAdmin.hasMany(models.SesionAdmin, { foreignKey: 'usuario_admin_id', as: 'sesiones' });
      UsuarioAdmin.belongsToMany(models.RolAdmin, {
        through: models.UsuarioAdminRol,
        foreignKey: 'usuario_admin_id',
        otherKey: 'rol_admin_id',
        as: 'roles'
      });
      UsuarioAdmin.hasMany(models.UsuarioAdminRol, { foreignKey: 'usuario_admin_id', as: 'usuario_admin_roles' });
      UsuarioAdmin.hasMany(models.AuditoriaAccion, { foreignKey: 'usuario_admin_id', as: 'auditorias' });
        }
  }

  UsuarioAdmin.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    empleado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'empleado',
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
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'UsuarioAdmin',
      tableName: 'usuario_admin',
      freezeTableName: true,
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ['password_hash'] }
      },
    indexes: [
      { unique: true, name: 'usuario_admin_proveedor_subject_unique', fields: ["proveedor_auth","subject_auth"] }
    ]
    }
  );

  return UsuarioAdmin;
};
