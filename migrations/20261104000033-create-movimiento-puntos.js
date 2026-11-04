'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('movimiento_puntos', {
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
      tipo: {
        type: DataTypes.ENUM('acumulacion', 'canje', 'ajuste', 'vencimiento'),
      allowNull: false
      },
      puntos_delta: {
        type: DataTypes.INTEGER,
      allowNull: false
      },
      descripcion: {
        type: DataTypes.STRING(255),
      allowNull: true
      },
      referencia: {
        type: DataTypes.STRING(100),
      allowNull: true
      },
      registrado_por: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      registrado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('movimiento_puntos', ["contacto_programa_id","registrado_en"], { name: 'mov_puntos_prog_reg_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movimiento_puntos');
  }
};
