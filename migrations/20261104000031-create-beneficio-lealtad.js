'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('beneficio_lealtad', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      programa_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programa_lealtad',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      nombre: {
        type: DataTypes.STRING(150),
      allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      puntos_requeridos: {
        type: DataTypes.INTEGER,
      allowNull: false
      },
      existencias: {
        type: DataTypes.INTEGER,
      allowNull: true
      },
      imagen_id: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      activo: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('beneficio_lealtad');
  }
};
