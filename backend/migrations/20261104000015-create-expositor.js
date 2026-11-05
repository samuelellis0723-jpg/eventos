'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('expositor', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(120),
      allowNull: false
      },
      organizacion: {
        type: DataTypes.STRING(150),
      allowNull: true
      },
      biografia: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      foto_id: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expositor');
  }
};
