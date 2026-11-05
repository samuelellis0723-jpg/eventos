'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('evento_sesion', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      evento_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento_mercadeo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      titulo: {
        type: DataTypes.STRING(150),
      allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      fecha_inicio: {
        type: DataTypes.DATE,
      allowNull: false
      },
      fecha_fin: {
        type: DataTypes.DATE,
      allowNull: true
      },
      orden: {
        type: DataTypes.SMALLINT,
      allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evento_sesion');
  }
};
