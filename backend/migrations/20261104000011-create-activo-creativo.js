'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('activo_creativo', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(150),
      allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM('imagen', 'video', 'banner', 'folleto', 'audio', 'presentacion'),
      allowNull: false
      },
      url_archivo: {
        type: DataTypes.STRING(500),
      allowNull: false
      },
      texto_alternativo: {
        type: DataTypes.STRING(255),
      allowNull: true
      },
      creado_por: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      creado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activo_creativo');
  }
};
