'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('promocion_producto', {
      promocion_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'promocion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      producto_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'producto_seguro',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promocion_producto');
  }
};
