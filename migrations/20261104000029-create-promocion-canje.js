'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('promocion_canje', {
      id: {
        type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      promocion_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'promocion',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      contacto_id: {
        type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'contacto',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      cupon_id: {
        type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
      references: {
        model: 'cupon',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      canjeado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      referencia_poliza: {
        type: DataTypes.STRING(40),
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
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promocion_canje');
  }
};
