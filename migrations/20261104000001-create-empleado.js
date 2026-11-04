'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('empleado', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(100),
      allowNull: false
      },
      apellidos: {
        type: DataTypes.STRING(120),
      allowNull: false
      },
      correo: {
        type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
      },
      puesto: {
        type: DataTypes.STRING(100),
      allowNull: true
      },
      activo: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      },
      creado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empleado');
  }
};
