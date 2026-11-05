'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('cupon', {
      id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      promocion_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'promocion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      codigo: {
        type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
      },
      contacto_asignado_id: {
        type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      estado: {
        type: DataTypes.ENUM('disponible', 'asignado', 'canjeado', 'vencido', 'anulado'),
      allowNull: false,
      defaultValue: 'disponible'
      },
      creado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      vence_en: {
        type: DataTypes.DATE,
      allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cupon');
  }
};
