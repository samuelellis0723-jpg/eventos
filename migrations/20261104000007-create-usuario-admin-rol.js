'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('usuario_admin_rol', {
      usuario_admin_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'usuario_admin',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      rol_admin_id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'rol_admin',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_admin_rol');
  }
};
