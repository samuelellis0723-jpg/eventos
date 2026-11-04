'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('calendario_contenido', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      contenido_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'contenido_publico',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      canal: {
        type: DataTypes.ENUM('web', 'email', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'tiktok'),
      allowNull: false
      },
      fecha_programada: {
        type: DataTypes.DATE,
      allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'programado'
      },
      url_publicacion: {
        type: DataTypes.STRING(500),
      allowNull: true
      },
      responsable_id: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      publicado_en: {
        type: DataTypes.DATE,
      allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calendario_contenido');
  }
};
