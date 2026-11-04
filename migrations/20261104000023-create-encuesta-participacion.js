'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('encuesta_participacion', {
      id: {
        type: DataTypes.BIGINT,
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
      contacto_id: {
        type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      iniciada_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      enviada_en: {
        type: DataTypes.DATE,
      allowNull: true
      },
      fuente: {
        type: DataTypes.STRING(80),
      allowNull: true
      }
    });
    await queryInterface.addIndex('encuesta_participacion', ["encuesta_id","enviada_en"], { name: 'encuesta_participacion_encuesta_env_idx' });
    await queryInterface.addIndex('encuesta_participacion', ["contacto_id"], { name: 'encuesta_participacion_contacto_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuesta_participacion');
  }
};
