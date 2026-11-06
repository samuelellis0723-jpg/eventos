'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.addColumn('usuario_admin', 'password_hash', {
      type: DataTypes.STRING(255),
      allowNull: true
    });

    await queryInterface.createTable('sesion_admin', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuario_admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuario_admin', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
        unique: true
      },
      csrf_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false
      },
      creada_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expira_en: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('sesion_admin', ['usuario_admin_id'], {
      name: 'sesion_admin_usuario_idx'
    });
    await queryInterface.addIndex('sesion_admin', ['expira_en'], {
      name: 'sesion_admin_expira_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sesion_admin');
    await queryInterface.removeColumn('usuario_admin', 'password_hash');
  }
};
