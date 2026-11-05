'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('rol_admin', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      codigo: {
        type: DataTypes.STRING(40),
      allowNull: false,
      unique: true
      },
      nombre: {
        type: DataTypes.STRING(80),
      allowNull: false
      },
      descripcion: {
        type: DataTypes.STRING(255),
      allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rol_admin');
  }
};
