'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('ramo_seguro', {
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
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ramo_seguro');
  }
};
