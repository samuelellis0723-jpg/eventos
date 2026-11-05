'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('encuesta_respuesta', {
      id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      participacion_id: {
        type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'encuesta_participacion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      pregunta_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'encuesta_pregunta',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      valor_texto: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      valor_numerico: {
        type: DataTypes.DECIMAL(10, 2),
      allowNull: true
      }
    });
    await queryInterface.addIndex('encuesta_respuesta', ["participacion_id","pregunta_id"], { unique: true, name: 'encuesta_resp_part_preg_unique' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuesta_respuesta');
  }
};
