'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('evento_mercadeo', {
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
      tipo: {
        type: DataTypes.ENUM('feria', 'webinar', 'charla', 'patrocinio', 'otro'),
      allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('planificado', 'en_curso', 'realizado', 'cancelado'),
      allowNull: false,
      defaultValue: 'planificado'
      },
      estado_publicacion: {
        type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
      },
      modalidad: {
        type: DataTypes.ENUM('presencial', 'virtual', 'hibrido'),
      allowNull: false
      },
      lugar: {
        type: DataTypes.STRING(200),
      allowNull: true
      },
      url_virtual: {
        type: DataTypes.STRING(500),
      allowNull: true
      },
      fecha_inicio: {
        type: DataTypes.DATE,
      allowNull: false
      },
      fecha_fin: {
        type: DataTypes.DATE,
      allowNull: true
      },
      inscripciones_desde: {
        type: DataTypes.DATE,
      allowNull: true
      },
      inscripciones_hasta: {
        type: DataTypes.DATE,
      allowNull: true
      },
      cupo_maximo: {
        type: DataTypes.INTEGER,
      allowNull: true
      },
      destacado_en_inicio: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      imagen_portada_id: {
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activo_creativo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
      },
      responsable_id: {
        type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleado',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
      },
      creado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('evento_mercadeo', ["estado_publicacion","fecha_inicio"], { name: 'evento_mercadeo_pub_inicio_idx' });
    await queryInterface.addIndex('evento_mercadeo', ["destacado_en_inicio"], { name: 'evento_mercadeo_destacado_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evento_mercadeo');
  }
};
