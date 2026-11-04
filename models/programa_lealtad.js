'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProgramaLealtad extends Model {
    static associate(models) {

      ProgramaLealtad.belongsTo(models.Empleado, { foreignKey: 'creado_por', as: 'creador' });
      ProgramaLealtad.hasMany(models.BeneficioLealtad, { foreignKey: 'programa_id', as: 'beneficios' });
      ProgramaLealtad.hasMany(models.ContactoPrograma, { foreignKey: 'programa_id', as: 'contacto_programas' });
      ProgramaLealtad.belongsToMany(models.Contacto, {
        through: models.ContactoPrograma,
        foreignKey: 'programa_id',
        otherKey: 'contacto_id',
        as: 'contactos'
      });
        }
  }

  ProgramaLealtad.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    condiciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    }
    },
    {
      sequelize,
      modelName: 'ProgramaLealtad',
      tableName: 'programa_lealtad',
      freezeTableName: true,
      timestamps: false
    }
  );

  return ProgramaLealtad;
};
