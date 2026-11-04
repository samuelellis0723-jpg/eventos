'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('contenido_publico', {
      id: {
        type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM('articulo', 'noticia', 'consejo', 'pagina_informativa'),
      allowNull: false
      },
      slug: {
        type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
      },
      titulo: {
        type: DataTypes.STRING(180),
      allowNull: false
      },
      resumen: {
        type: DataTypes.STRING(500),
      allowNull: true
      },
      cuerpo: {
        type: DataTypes.TEXT,
      allowNull: false
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
      estado: {
        type: DataTypes.ENUM('borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador'
      },
      visible_en_inicio: {
        type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      },
      orden_inicio: {
        type: DataTypes.SMALLINT,
      allowNull: true
      },
      programado_para: {
        type: DataTypes.DATE,
      allowNull: true
      },
      publicado_en: {
        type: DataTypes.DATE,
      allowNull: true
      },
      publicado_hasta: {
        type: DataTypes.DATE,
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
      },
      creado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      actualizado_en: {
        type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('contenido_publico', ["estado","publicado_en"], { name: 'contenido_publico_estado_pub_idx' });
    await queryInterface.addIndex('contenido_publico', ["visible_en_inicio","orden_inicio"], { name: 'contenido_publico_vis_orden_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contenido_publico');
  }
};
