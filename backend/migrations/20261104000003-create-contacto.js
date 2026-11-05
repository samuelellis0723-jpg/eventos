'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('contacto', {
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
    });
    await queryInterface.addIndex('contacto', ["correo"], { name: 'contacto_correo_idx' });
    await queryInterface.addIndex('contacto', ["provincia","canton"], { name: 'contacto_provincia_canton_idx' });
    await queryInterface.addIndex('contacto', ["tipo"], { name: 'contacto_tipo_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contacto');
  }
};
