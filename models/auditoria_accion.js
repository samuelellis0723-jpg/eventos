'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditoriaAccion extends Model {
    static associate(models) {

      AuditoriaAccion.belongsTo(models.UsuarioAdmin, { foreignKey: 'usuario_admin_id', as: 'usuario_admin' });
        }
  }

  AuditoriaAccion.init(
    {
    id: {
      type: DataTypes.BIGINT,
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
      onDelete: 'RESTRICT'
    },
    accion: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    entidad: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    registro_id: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    datos_anteriores: {
      type: DataTypes.JSON,
      allowNull: true
    },
    datos_nuevos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip_origen: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    ocurrido_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'AuditoriaAccion',
      tableName: 'auditoria_accion',
      freezeTableName: true,
      timestamps: false
    }
  );

  return AuditoriaAccion;
};
