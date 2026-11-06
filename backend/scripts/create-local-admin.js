'use strict';

const readline = require('readline/promises');
const { StringDecoder } = require('string_decoder');
const { stdin, stdout } = require('process');
const { sequelize, Empleado, UsuarioAdmin, RolAdmin, UsuarioAdminRol } = require('../models');
const { hashPassword } = require('../utils/password-hash');

function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(new Error('Se requiere una terminal interactiva.'));
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const decoder = new StringDecoder('utf8');
    stdout.write(prompt);

    const finish = (error) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of decoder.write(chunk)) {
        if (character === '\u0003') return finish(new Error('Operación cancelada.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u0008' || character === '\u007f') {
          value = Array.from(value).slice(0, -1).join('');
        } else if (character >= ' ') {
          value += character;
        }
      }
    };

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

async function run() {
  if (!stdin.isTTY) throw new Error('Se requiere una terminal interactiva.');

  const questions = readline.createInterface({ input: stdin, output: stdout });
  const nombre = (await questions.question('Nombre: ')).trim();
  const apellidos = (await questions.question('Apellidos: ')).trim();
  const correo = (await questions.question('Correo del empleado: ')).trim().toLowerCase();
  questions.close();

  if (!nombre || !apellidos || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 150) {
    throw new Error('Los datos del empleado no son válidos.');
  }

  const password = await readHidden('Contraseña local (mínimo 12 caracteres, no se mostrará): ');
  const confirmation = await readHidden('Confirma la contraseña: ');
  if (password.length < 12 || password.length > 128 || password !== confirmation) {
    throw new Error('La contraseña no cumple los requisitos o las confirmaciones no coinciden.');
  }

  await sequelize.authenticate();
  const existingAdminRole = await RolAdmin.findOne({ where: { codigo: 'admin' } });
  if (existingAdminRole) {
    const existingAdmins = await UsuarioAdmin.count({
      include: [{ model: RolAdmin, as: 'roles', where: { codigo: 'admin' }, required: true },]
    });
    if (existingAdmins > 0) throw new Error('Ya existe una cuenta con el rol admin; no se creó otra.');
  }

  const passwordHash = await hashPassword(password);
  const transaction = await sequelize.transaction();
  try {
    let employee = await Empleado.findOne({ where: { correo }, transaction });
    if (employee?.activo === false) throw new Error('El empleado indicado está inactivo.');
    if (employee) {
      const linkedUser = await UsuarioAdmin.findOne({ where: { empleado_id: employee.id }, transaction });
      if (linkedUser) throw new Error('El empleado ya tiene una cuenta administrativa asociada.');
    } else {
      employee = await Empleado.create({ nombre, apellidos, correo, puesto: 'Administrador local', activo: true }, { transaction });
    }

    const [role] = await RolAdmin.findOrCreate({
      where: { codigo: 'admin' },
      defaults: { nombre: 'Administrador', descripcion: 'Acceso a la gestión interna.' },
      transaction
    });
    const adminUser = await UsuarioAdmin.create({
      empleado_id: employee.id,
      proveedor_auth: 'local',
      subject_auth: correo,
      password_hash: passwordHash,
      activo: true
    }, { transaction });
    await UsuarioAdminRol.create({ usuario_admin_id: adminUser.id, rol_admin_id: role.id }, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  stdout.write('Administrador local creado. La contraseña solo se guardó como hash.\n');
}

run()
  .catch((error) => {
    stdout.write(`No se creó el administrador local: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
