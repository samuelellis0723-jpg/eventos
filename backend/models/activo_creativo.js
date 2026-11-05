'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivoCreativo extends Model {
    static associate(models) {

      ActivoCreativo.belongsTo(models.Empleado, { foreignKey: 'creado_por', as: 'creador' });
      ActivoCreativo.hasMany(models.ContenidoPublico, { foreignKey: 'imagen_portada_id', as: 'contenidos_portada' });
      ActivoCreativo.hasMany(models.EventoMercadeo, { foreignKey: 'imagen_portada_id', as: 'eventos_portada' });
      ActivoCreativo.hasMany(models.Expositor, { foreignKey: 'foto_id', as: 'expositores_foto' });
      ActivoCreativo.hasMany(models.Promocion, { foreignKey: 'imagen_id', as: 'promociones_imagen' });
      ActivoCreativo.hasMany(models.BeneficioLealtad, { foreignKey: 'imagen_id', as: 'beneficios_imagen' });
        }
  }

  ActivoCreativo.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('imagen', 'video', 'banner', 'folleto', 'audio', 'presentacion'),
      allowNull: false
    },
    url_archivo: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    texto_alternativo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'ActivoCreativo',
      tableName: 'activo_creativo',
      freezeTableName: true,
      timestamps: false
    }
  );

  return ActivoCreativo;
};
