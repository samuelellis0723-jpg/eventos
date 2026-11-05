'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoriaContenido extends Model {
    static associate(models) {

      CategoriaContenido.belongsToMany(models.ContenidoPublico, {
        through: models.ContenidoCategoria,
        foreignKey: 'categoria_id',
        otherKey: 'contenido_id',
        as: 'contenidos'
      });
      CategoriaContenido.hasMany(models.ContenidoCategoria, { foreignKey: 'categoria_id', as: 'contenido_categorias' });
        }
  }

  CategoriaContenido.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
    },
    {
      sequelize,
      modelName: 'CategoriaContenido',
      tableName: 'categoria_contenido',
      freezeTableName: true,
      timestamps: false
    }
  );

  return CategoriaContenido;
};
