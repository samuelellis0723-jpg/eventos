'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContenidoCategoria extends Model {
    static associate(models) {

      ContenidoCategoria.belongsTo(models.ContenidoPublico, { foreignKey: 'contenido_id', as: 'contenido' });
      ContenidoCategoria.belongsTo(models.CategoriaContenido, { foreignKey: 'categoria_id', as: 'categoria' });
        }
  }

  ContenidoCategoria.init(
    {
    contenido_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'contenido_publico',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'categoria_contenido',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
    },
    {
      sequelize,
      modelName: 'ContenidoCategoria',
      tableName: 'contenido_categoria',
      freezeTableName: true,
      timestamps: false
    }
  );

  return ContenidoCategoria;
};
