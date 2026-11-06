'use strict';

const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SesionAdmin extends Model {
    static associate(models) {
      SesionAdmin.belongsTo(models.UsuarioAdmin, {
        foreignKey: 'usuario_admin_id',
        as: 'usuario_admin'
      });
    }
  }

  SesionAdmin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuario_admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario_admin',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
        unique: true
      },
      csrf_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false
      },
      creada_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expira_en: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'SesionAdmin',
      tableName: 'sesion_admin',
      freezeTableName: true,
      timestamps: false,
      indexes: [
        { name: 'sesion_admin_usuario_idx', fields: ['usuario_admin_id'] },
        { name: 'sesion_admin_expira_idx', fields: ['expira_en'] }
      ]
    }
  );

  return SesionAdmin;
};
