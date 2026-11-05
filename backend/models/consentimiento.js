'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Consentimiento extends Model {
    static associate(models) {

      Consentimiento.belongsTo(models.Contacto, { foreignKey: 'contacto_id', as: 'contacto' });
        }
  }

  Consentimiento.init(
    {
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
    },
    {
      sequelize,
      modelName: 'Consentimiento',
      tableName: 'consentimiento',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'consentimiento_contacto_tipo_reg_idx', fields: ["contacto_id","tipo","registrado_en"] }
    ]
    }
  );

  return Consentimiento;
};
