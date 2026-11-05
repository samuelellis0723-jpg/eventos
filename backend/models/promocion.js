'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Promocion extends Model {
    static associate(models) {

      Promocion.belongsTo(models.ActivoCreativo, { foreignKey: 'imagen_id', as: 'imagen' });
      Promocion.belongsTo(models.Empleado, { foreignKey: 'creado_por', as: 'creador' });
      Promocion.belongsTo(models.Empleado, { foreignKey: 'aprobado_por', as: 'aprobador' });
      Promocion.belongsToMany(models.ProductoSeguro, {
        through: models.PromocionProducto,
        foreignKey: 'promocion_id',
        otherKey: 'producto_id',
        as: 'productos'
      });
      Promocion.hasMany(models.PromocionProducto, { foreignKey: 'promocion_id', as: 'promocion_productos' });
      Promocion.hasMany(models.Cupon, { foreignKey: 'promocion_id', as: 'cupones' });
      Promocion.hasMany(models.PromocionCanje, { foreignKey: 'promocion_id', as: 'canjes' });
        }
  }

  Promocion.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    resumen: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    condiciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('descuento_prima', 'beneficio_adicional', 'puntos_extra', 'otro'),
      allowNull: false
    },
    descuento_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    destacado_en_inicio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    requiere_cupon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    limite_canjeos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    imagen_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    aprobado_por: {
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
      modelName: 'Promocion',
      tableName: 'promocion',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'promocion_estado_fechas_idx', fields: ["estado","fecha_inicio","fecha_fin"] },
      { name: 'promocion_destacado_idx', fields: ["destacado_en_inicio"] }
    ]
    }
  );

  return Promocion;
};
