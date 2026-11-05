'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('encuesta_respuesta_opcion', {
      respuesta_id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'encuesta_respuesta',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      opcion_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'encuesta_opcion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuesta_respuesta_opcion');
  }
};
