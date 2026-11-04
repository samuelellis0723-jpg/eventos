'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('programa_lealtad', {
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
        type: DataTypes.STRING(120),
      allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      condiciones: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      estado: {
        type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
      allowNull: true
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
      allowNull: true
      },
      creado_por: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('programa_lealtad');
  }
};
