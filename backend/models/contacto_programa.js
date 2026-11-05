'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContactoPrograma extends Model {
    static associate(models) {

      ContactoPrograma.belongsTo(models.Contacto, { foreignKey: 'contacto_id', as: 'contacto' });
      ContactoPrograma.belongsTo(models.ProgramaLealtad, { foreignKey: 'programa_id', as: 'programa' });
      ContactoPrograma.hasMany(models.MovimientoPuntos, { foreignKey: 'contacto_programa_id', as: 'movimientos_puntos' });
      ContactoPrograma.hasMany(models.CanjeBeneficio, { foreignKey: 'contacto_programa_id', as: 'canjes_beneficio' });
        }
  }

  ContactoPrograma.init(
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
    },
    {
      sequelize,
      modelName: 'ContactoPrograma',
      tableName: 'contacto_programa',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { unique: true, name: 'contacto_prog_cont_prog_unique', fields: ["contacto_id","programa_id"] }
    ]
    }
  );

  return ContactoPrograma;
};
