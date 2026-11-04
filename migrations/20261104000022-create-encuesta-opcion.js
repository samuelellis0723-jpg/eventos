'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('encuesta_opcion', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
      etiqueta: {
        type: DataTypes.STRING(200),
      allowNull: false
      },
      valor: {
        type: DataTypes.STRING(100),
      allowNull: false
      },
      orden: {
        type: DataTypes.SMALLINT,
      allowNull: false
      }
    });
    await queryInterface.addIndex('encuesta_opcion', ["pregunta_id","valor"], { unique: true, name: 'encuesta_opcion_pregunta_valor_unique' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuesta_opcion');
  }
};
