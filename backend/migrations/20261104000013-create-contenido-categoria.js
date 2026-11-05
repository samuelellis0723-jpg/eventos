'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('contenido_categoria', {
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contenido_categoria');
  }
};
