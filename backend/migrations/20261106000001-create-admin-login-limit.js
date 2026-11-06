'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_login_limite', {
      clave: { type: Sequelize.STRING(64), primaryKey: true, allowNull: false },
      intentos: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      vence_en: { type: Sequelize.DATE, allowNull: false }
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('admin_login_limite'); }
};
