'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contacto extends Model {
    static associate(models) {

      Contacto.hasOne(models.CuentaCliente, { foreignKey: 'contacto_id', as: 'cuenta_cliente' });
      Contacto.hasMany(models.Consentimiento, { foreignKey: 'contacto_id', as: 'consentimientos' });
      Contacto.hasMany(models.EventoInscripcion, { foreignKey: 'contacto_id', as: 'inscripciones' });
      Contacto.belongsToMany(models.EventoMercadeo, {
        through: models.EventoInscripcion,
        foreignKey: 'contacto_id',
        otherKey: 'evento_id',
        as: 'eventos'
      });
      Contacto.hasMany(models.EncuestaParticipacion, { foreignKey: 'contacto_id', as: 'participaciones_encuesta' });
      Contacto.hasMany(models.Cupon, { foreignKey: 'contacto_asignado_id', as: 'cupones_asignados' });
      Contacto.hasMany(models.PromocionCanje, { foreignKey: 'contacto_id', as: 'canjes_promocion' });
      Contacto.hasMany(models.ContactoPrograma, { foreignKey: 'contacto_id', as: 'programas_lealtad' });
      Contacto.belongsToMany(models.ProgramaLealtad, {
        through: models.ContactoPrograma,
        foreignKey: 'contacto_id',
        otherKey: 'programa_id',
        as: 'programas'
      });
        }
  }

  Contacto.init(
    {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('prospecto', 'cliente', 'ex_cliente', 'referido'),
      allowNull: false,
      defaultValue: 'prospecto'
    },
    tipo_persona: {
      type: DataTypes.ENUM('fisica', 'juridica'),
      allowNull: false,
      defaultValue: 'fisica'
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    razon_social: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    provincia: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    canton: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    registrado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
    },
    {
      sequelize,
      modelName: 'Contacto',
      tableName: 'contacto',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'contacto_correo_idx', fields: ["correo"] },
      { name: 'contacto_provincia_canton_idx', fields: ["provincia","canton"] },
      { name: 'contacto_tipo_idx', fields: ["tipo"] }
    ]
    }
  );

  return Contacto;
};
