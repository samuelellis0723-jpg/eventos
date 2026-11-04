'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('usuario_admin', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      empleado_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      proveedor_auth: {
        type: DataTypes.STRING(60),
      allowNull: false
      },
      subject_auth: {
        type: DataTypes.STRING(180),
      allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
      allowNull: true
      }
    });
    await queryInterface.addIndex('usuario_admin', ["proveedor_auth","subject_auth"], { unique: true, name: 'usuario_admin_proveedor_subject_unique' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_admin');
  }
};
