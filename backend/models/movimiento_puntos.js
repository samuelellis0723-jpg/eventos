'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MovimientoPuntos extends Model {
    static associate(models) {

      MovimientoPuntos.belongsTo(models.ContactoPrograma, { foreignKey: 'contacto_programa_id', as: 'contacto_programa' });
      MovimientoPuntos.belongsTo(models.Empleado, { foreignKey: 'registrado_por', as: 'registrador' });
        }
  }

  MovimientoPuntos.init(
    {
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
    },
    {
      sequelize,
      modelName: 'MovimientoPuntos',
      tableName: 'movimiento_puntos',
      freezeTableName: true,
      timestamps: false,
    indexes: [
      { name: 'mov_puntos_prog_reg_idx', fields: ["contacto_programa_id","registrado_en"] }
    ]
    }
  );

  return MovimientoPuntos;
};
