'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('promocion', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      slug: {
        type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
      },
      nombre: {
        type: DataTypes.STRING(150),
      allowNull: false
      },
      resumen: {
        type: DataTypes.STRING(500),
      allowNull: true
      },
      descripcion: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      condiciones: {
        type: DataTypes.TEXT,
      allowNull: true
      },
      tipo: {
        type: DataTypes.ENUM('descuento_prima', 'beneficio_adicional', 'puntos_extra', 'otro'),
      allowNull: false
      },
      descuento_pct: {
        type: DataTypes.DECIMAL(5, 2),
      allowNull: true
      },
      estado: {
        type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
      allowNull: false
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
      allowNull: false
      },
      destacado_en_inicio: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      requiere_cupon: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      limite_canjeos: {
        type: DataTypes.INTEGER,
      allowNull: true
      },
      imagen_id: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
      },
      aprobado_por: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      }
    });
    await queryInterface.addIndex('promocion', ["estado","fecha_inicio","fecha_fin"], { name: 'promocion_estado_fechas_idx' });
    await queryInterface.addIndex('promocion', ["destacado_en_inicio"], { name: 'promocion_destacado_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promocion');
  }
};
