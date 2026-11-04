'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('consentimiento', {
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
      tipo: {
        type: DataTypes.ENUM('email', 'sms', 'whatsapp', 'llamada', 'datos_personales'),
      allowNull: false
      },
      otorgado: {
        type: DataTypes.BOOLEAN,
      allowNull: false
      },
      registrado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      medio_captura: {
        type: DataTypes.STRING(60),
      allowNull: true
      },
      version_texto: {
        type: DataTypes.STRING(30),
      allowNull: true
      },
      ip_origen: {
        type: DataTypes.STRING(45),
      allowNull: true
      }
    });
    await queryInterface.addIndex('consentimiento', ["contacto_id","tipo","registrado_en"], { name: 'consentimiento_contacto_tipo_reg_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('consentimiento');
  }
};
