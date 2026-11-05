'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('canje_beneficio', {
      id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      contacto_programa_id: {
        type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'contacto_programa',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      beneficio_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'beneficio_lealtad',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      estado: {
        type: DataTypes.ENUM('solicitado', 'aprobado', 'entregado', 'rechazado', 'cancelado'),
      allowNull: false,
      defaultValue: 'solicitado'
      },
      puntos_utilizados: {
        type: DataTypes.INTEGER,
      allowNull: false
      },
      solicitado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      procesado_en: {
        type: DataTypes.DATE,
      allowNull: true
      },
      procesado_por: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      notas: {
        type: DataTypes.STRING(500),
      allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('canje_beneficio');
  }
};
