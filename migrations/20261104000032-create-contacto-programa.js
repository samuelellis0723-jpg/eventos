'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('contacto_programa', {
      id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      contacto_id: {
        type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      programa_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programa_lealtad',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
      },
      puntos_saldo: {
        type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
      },
      nivel: {
        type: DataTypes.STRING(30),
      allowNull: true
      },
      fecha_union: {
        type: DataTypes.DATEONLY,
      allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
      }
    });
    await queryInterface.addIndex('contacto_programa', ["contacto_id","programa_id"], { unique: true, name: 'contacto_prog_cont_prog_unique' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contacto_programa');
  }
};
