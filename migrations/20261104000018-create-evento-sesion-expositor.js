'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('evento_sesion_expositor', {
      sesion_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'evento_sesion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      expositor_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'expositor',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evento_sesion_expositor');
  }
};
