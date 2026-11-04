'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('producto_seguro', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      ramo_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ramo_seguro',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      codigo: {
        type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
      },
      nombre: {
        type: DataTypes.STRING(120),
      allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      activo: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('producto_seguro');
  }
};
