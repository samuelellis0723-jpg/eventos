'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('evento_inscripcion', {
      evento_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'evento_mercadeo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      contacto_id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      estado: {
        type: DataTypes.ENUM('inscrito', 'confirmado', 'lista_espera', 'cancelado', 'asistio', 'ausente'),
      allowNull: false,
      defaultValue: 'inscrito'
      },
      registrado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      confirmado_en: {
        type: DataTypes.DATE,
      allowNull: true
      },
      check_in_en: {
        type: DataTypes.DATE,
      allowNull: true
      },
      notas: {
        type: DataTypes.STRING(500),
      allowNull: true
      }
    });
    await queryInterface.addIndex('evento_inscripcion', ["evento_id","estado"], { name: 'evento_inscripcion_evento_estado_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evento_inscripcion');
  }
};
