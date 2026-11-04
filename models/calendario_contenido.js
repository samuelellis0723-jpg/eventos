'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CalendarioContenido extends Model {
    static associate(models) {

      CalendarioContenido.belongsTo(models.ContenidoPublico, { foreignKey: 'contenido_id', as: 'contenido' });
      CalendarioContenido.belongsTo(models.Empleado, { foreignKey: 'responsable_id', as: 'responsable' });
        }
  }

  CalendarioContenido.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    contenido_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'contenido_publico',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    canal: {
      type: DataTypes.ENUM('web', 'email', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'tiktok'),
      allowNull: false
    },
    fecha_programada: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'programado'
    },
    url_publicacion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    responsable_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    publicado_en: {
      type: DataTypes.DATE,
      allowNull: true
    }
    },
    {
      sequelize,
      modelName: 'CalendarioContenido',
      tableName: 'calendario_contenido',
      freezeTableName: true,
      timestamps: false
    }
  );

  return CalendarioContenido;
};
