'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('encuesta', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      slug: {
        type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
      },
      titulo: {
        type: DataTypes.STRING(150),
      allowNull: false
      },
      introduccion: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      tipo: {
        type: DataTypes.ENUM('nps', 'satisfaccion', 'conocimiento_marca', 'estudio_mercado', 'post_venta'),
      allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
      },
      publica: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      permite_anonimas: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
      allowNull: true
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
      allowNull: true
      },
      creada_por: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      creada_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuesta');
  }
};
