'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Empleado extends Model {
    static associate(models) {

      Empleado.hasOne(models.UsuarioAdmin, { foreignKey: 'empleado_id', as: 'usuario_admin' });
      Empleado.hasMany(models.ActivoCreativo, { foreignKey: 'creado_por', as: 'activos_creados' });
      Empleado.hasMany(models.ContenidoPublico, { foreignKey: 'creado_por', as: 'contenidos_creados' });
      Empleado.hasMany(models.ContenidoPublico, { foreignKey: 'aprobado_por', as: 'contenidos_aprobados' });
      Empleado.hasMany(models.CalendarioContenido, { foreignKey: 'responsable_id', as: 'calendarios_responsable' });
      Empleado.hasMany(models.EventoMercadeo, { foreignKey: 'responsable_id', as: 'eventos_responsable' });
      Empleado.hasMany(models.Encuesta, { foreignKey: 'creada_por', as: 'encuestas_creadas' });
      Empleado.hasMany(models.Promocion, { foreignKey: 'creado_por', as: 'promociones_creadas' });
      Empleado.hasMany(models.Promocion, { foreignKey: 'aprobado_por', as: 'promociones_aprobadas' });
      Empleado.hasMany(models.PromocionCanje, { foreignKey: 'registrado_por', as: 'canjes_registrados' });
      Empleado.hasMany(models.ProgramaLealtad, { foreignKey: 'creado_por', as: 'programas_creados' });
      Empleado.hasMany(models.MovimientoPuntos, { foreignKey: 'registrado_por', as: 'movimientos_puntos_registrados' });
      Empleado.hasMany(models.CanjeBeneficio, { foreignKey: 'procesado_por', as: 'canjes_beneficio_procesados' });
        }
  }

  Empleado.init(
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    puesto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    },
    {
      sequelize,
      modelName: 'Empleado',
      tableName: 'empleado',
      freezeTableName: true,
      timestamps: false
    }
  );

  return Empleado;
};
