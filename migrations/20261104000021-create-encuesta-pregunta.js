'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('encuesta_pregunta', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      encuesta_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'encuesta',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      texto: {
        type: DataTypes.STRING(500),
      allowNull: false
      },
      tipo_respuesta: {
        type: DataTypes.ENUM('texto', 'numerica', 'escala', 'opcion_unica', 'opcion_multiple', 'si_no'),
      allowNull: false
      },
      obligatoria: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      },
      orden: {
        type: DataTypes.SMALLINT,
      allowNull: false
      },
      valor_minimo: {
        type: DataTypes.SMALLINT,
      allowNull: true
      },
      valor_maximo: {
        type: DataTypes.SMALLINT,
      allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuesta_pregunta');
  }
};
