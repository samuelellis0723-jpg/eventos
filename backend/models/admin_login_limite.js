'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('AdminLoginLimite', {
  clave: { type: DataTypes.STRING(64), primaryKey: true, allowNull: false },
  intentos: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  vence_en: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'admin_login_limite', freezeTableName: true, timestamps: false });
