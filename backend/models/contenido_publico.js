'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContenidoPublico extends Model {
    static associate(models) {

      ContenidoPublico.belongsTo(models.ActivoCreativo, { foreignKey: 'imagen_portada_id', as: 'imagen_portada' });
      ContenidoPublico.belongsTo(models.Empleado, { foreignKey: 'creado_por', as: 'creador' });
      ContenidoPublico.belongsTo(models.Empleado, { foreignKey: 'aprobado_por', as: 'aprobador' });
      ContenidoPublico.belongsToMany(models.CategoriaContenido, {
        through: models.ContenidoCategoria,
        foreignKey: 'contenido_id',
        otherKey: 'categoria_id',
        as: 'categorias'
      });
      ContenidoPublico.hasMany(models.ContenidoCategoria, { foreignKey: 'contenido_id', as: 'contenido_categorias' });
      ContenidoPublico.hasMany(models.CalendarioContenido, { foreignKey: 'contenido_id', as: 'calendarios' });
        }
  }

  ContenidoPublico.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('articulo', 'noticia', 'consejo', 'pagina_informativa'),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
    },
    titulo: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    resumen: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    cuerpo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imagen_portada_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    visible_en_inicio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    orden_inicio: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    programado_para: {
      type: DataTypes.DATE,
      allowNull: true
    },
    publicado_en: {
      type: DataTypes.DATE,
      allowNull: true
    },
    publicado_hasta: {
      type: DataTypes.DATE,
      allowNull: true
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
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    actualizado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'ContenidoPublico',
      tableName: 'contenido_publico',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'contenido_publico_estado_pub_idx', fields: ["estado","publicado_en"] },
      { name: 'contenido_publico_vis_orden_idx', fields: ["visible_en_inicio","orden_inicio"] }
    ]
    }
  );

  return ContenidoPublico;
};
