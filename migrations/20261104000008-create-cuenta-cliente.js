'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('cuenta_cliente', {
      id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      contacto_id: {
        type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      references: {
        model: 'contacto',
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
      activa: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      },
      creada_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('cuenta_cliente', ["proveedor_auth","subject_auth"], { unique: true, name: 'cuenta_cliente_proveedor_subject_unique' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cuenta_cliente');
  }
};
