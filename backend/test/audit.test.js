'use strict';
process.env.NODE_ENV = 'test';
process.env.ADMIN_ALLOWED_ORIGINS = 'http://localhost:5173';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const mysql = require('mysql2/promise');
const models = require('../models');
const app = require('../index');
const { hashPassword } = require('../utils/password-hash');
const { sequelize, Empleado, UsuarioAdmin, RolAdmin, UsuarioAdminRol, EncuestaParticipacion, EncuestaRespuesta, EncuestaRespuestaOpcion } = models;
const evidence = [];
const prefix = 'auditoria-' + randomBytes(6).toString('hex');

async function developmentSnapshot() {
  const config = require('../config/config').development;
  const connection = await mysql.createConnection({ host: config.host, port: config.port, user: config.username, password: config.password, database: config.database });
  try {
    const [tables] = await connection.query('SHOW TABLES');
    const result = {};
    for (const row of tables) {
      const name = Object.values(row)[0];
      const [[count]] = await connection.query('SELECT COUNT(*) AS n FROM ' + mysql.escapeId(name));
      result[name] = Number(count.n);
    }
    return result;
  } finally { await connection.end(); }
}
function questionFixtures() {
  return [
    { texto: 'Comentario de prueba', tipo_respuesta: 'texto' },
    { texto: 'Número de prueba', tipo_respuesta: 'numerica', valor_minimo: 1, valor_maximo: 10 },
    { texto: 'Escala de prueba', tipo_respuesta: 'escala', valor_minimo: 0, valor_maximo: 10 },
    { texto: 'Una opción', tipo_respuesta: 'opcion_unica', opciones: [{ etiqueta: 'A', valor: 'a' }, { etiqueta: 'B', valor: 'b' }] },
    { texto: 'Varias opciones', tipo_respuesta: 'opcion_multiple', opciones: [{ etiqueta: 'C', valor: 'c' }, { etiqueta: 'D', valor: 'd' }] },
    { texto: 'Sí o no', tipo_respuesta: 'si_no', opciones: [{ etiqueta: 'Sí', valor: 'si' }, { etiqueta: 'No', valor: 'no' }] }
  ].map((q, index) => ({ ...q, obligatoria: true, orden: index + 1 }));
}

test('Auditoría HTTP en MySQL separado', async t => {
  let server;
  let beforeSnapshot;
  let base;
  const accountPassword = randomBytes(24).toString('base64url');
  const jar = {};
  let csrf;
  async function request(method, endpoint, body, options = {}) {
    const cookies = options.jar || jar;
    const headers = { Origin: 'http://localhost:5173', ...(body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
    if (!options.guest) {
      headers.Cookie = Object.entries(cookies).map(([key,value]) => key + '=' + value).join('; ');
      if (csrf && !options.noCsrf) headers['X-CSRF-Token'] = csrf;
    }
    const response = await fetch(base + endpoint, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!options.guest) for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';', 1)[0]; const at = pair.indexOf('='); cookies[pair.slice(0,at)] = pair.slice(at+1);
    }
    const payload = await response.json();
    return { status: response.status, payload, cookies: response.headers.getSetCookie() };
  }
  function status(result, expected, name) {
    evidence.push({ caso: name, esperado: expected, obtenido: result.status, resultado: result.status === expected ? 'PASS' : 'FAIL' });
    assert.equal(result.status, expected, name + ': ' + (result.payload.message || ''));
    return result.payload.data;
  }
  async function publicRows(endpoint) {
    const rows = [];
    for (let page = 1; ; page++) {
      const result = await request('GET', endpoint + '?limit=50&page=' + page, null, { guest: true });
      assert.equal(result.status, 200);
      rows.push(...result.payload.data);
      if (page >= result.payload.totalPages) return rows;
    }
  }
  async function fixtureUser(name, withRole) {
    const employee = await Empleado.create({ nombre: 'Prueba', apellidos: 'Ficticia', correo: name + '@example.invalid', activo: true });
    const user = await UsuarioAdmin.create({ empleado_id: employee.id, proveedor_auth: 'local', subject_auth: employee.correo, password_hash: await hashPassword(accountPassword), activo: true });
    if (withRole) {
      const [role] = await RolAdmin.findOrCreate({ where: { codigo: 'admin' }, defaults: { nombre: 'Administrador' } });
      await UsuarioAdminRol.create({ usuario_admin_id: user.id, rol_admin_id: role.id });
    }
    return employee.correo;
  }
  let event, promotion, program, survey;
  try {
    beforeSnapshot = await developmentSnapshot();
    await sequelize.authenticate();
    // Solo el esquema de pruebas: reinicia las ventanas para repetir la auditoría.
    await models.AdminLoginLimite.destroy({ where: {} });
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = 'http://127.0.0.1:' + server.address().port + '/api';
    const email = await fixtureUser(prefix, true);
    const rolelessEmail = await fixtureUser(prefix + '-sin-rol', false);

    await t.test('Acceso, cookies y CSRF', async () => {
      for (const endpoint of ['/contactos', '/usuarios-admin', '/participaciones-encuesta', '/respuestas-encuesta', '/admin/eventos']) status(await request('GET', endpoint, null, { guest: true }), 401, 'Visitante: ' + endpoint);
      for (const endpoint of ['/public/eventos', '/public/promociones', '/public/programas-lealtad', '/public/encuestas']) status(await request('GET', endpoint, null, { guest: true }), 200, 'Lectura pública: ' + endpoint);
      const csrfResult = await request('GET', '/auth/csrf');
      csrf = status(csrfResult, 200, 'Emisión CSRF').csrfToken;
      status(await request('POST', '/auth/login', { correo: email, contrasena: accountPassword }, { noCsrf: true }), 403, 'Login sin CSRF');
      const login = await request('POST', '/auth/login', { correo: email, contrasena: accountPassword });
      csrf = status(login, 200, 'Login administrador').csrfToken;
      assert(login.cookies.some(cookie => cookie.startsWith('eventos_admin_session=') && /HttpOnly/.test(cookie) && /SameSite=Strict/.test(cookie)));
      status(await request('GET', '/auth/session'), 200, 'Sesión después de recarga');
      status(await request('GET', '/contactos'), 200, 'Administrador autorizado');
      status(await request('POST', '/admin/eventos', {}, { noCsrf: true }), 403, 'Escritura autenticada sin CSRF');
      const otherJar = {};
      const otherCsrf = status(await request('GET', '/auth/csrf', null, { jar: otherJar }), 200, 'CSRF de cuenta sin rol').csrfToken;
      const otherLogin = await request('POST', '/auth/login', { correo: rolelessEmail, contrasena: accountPassword }, { jar: otherJar, headers: { 'X-CSRF-Token': otherCsrf }, noCsrf: true });
      status(otherLogin, 200, 'Login sin rol');
      status(await request('GET', '/contactos', null, { jar: otherJar }), 403, 'Usuario sin permiso');
      status(await request('GET', '/auth/session', null, { jar: otherJar }), 200, 'Sesión sin rol consultable para vista 403');
      const otherUser = await UsuarioAdmin.findOne({ where: { subject_auth: rolelessEmail } });
      await models.SesionAdmin.update({ expira_en: new Date(Date.now() - 60000) }, { where: { usuario_admin_id: otherUser.id } });
      status(await request('GET', '/auth/session', null, { jar: otherJar }), 401, 'Sesión vencida rechazada');
      const renewedCsrf = status(await request('GET', '/auth/csrf', null, { jar: otherJar }), 200, 'CSRF después de expirar').csrfToken;
      status(await request('POST', '/auth/login', { correo: rolelessEmail, contrasena: accountPassword }, { jar: otherJar, headers: { 'X-CSRF-Token': renewedCsrf }, noCsrf: true }), 200, 'Nueva sesión para comprobar cuenta activa');
      await otherUser.update({ activo: false });
      status(await request('GET', '/auth/session', null, { jar: otherJar }), 401, 'Cuenta desactivada invalida sesión');
      const environment = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        const cookie = require('../middleware/admin-auth').cookieOptions(1000);
        assert.equal(cookie.secure, true); assert.equal(cookie.httpOnly, true);
        evidence.push({ caso: 'Cookie de sesión Secure y HttpOnly en producción', resultado: 'PASS' });
      } finally { process.env.NODE_ENV = environment; }
    });

    await t.test('Eventos y promociones desde API administrativa', async () => {
      event = status(await request('POST', '/admin/eventos', { nombre: 'Evento ficticio de auditoría', slug: prefix + '-evento', tipo: 'otro', modalidad: 'virtual', estado: 'cancelado', fecha_inicio: '2099-01-01T12:00:00.000Z' }), 201, 'Crear borrador de evento');
      assert(!(await publicRows('/public/eventos')).some(row => row.id === event.id));
      event = status(await request('PUT', '/admin/eventos/' + event.id, { estado_publicacion: 'publicado' }), 200, 'Publicar evento independientemente de estado');
      assert((await publicRows('/public/eventos')).some(row => row.id === event.id && row.estado === 'cancelado'));
      evidence.push({ caso: 'Evento publicado aparece en Inicio; estado cancelado no filtra publicación', resultado: 'PASS' });
      status(await request('POST', '/admin/promociones', { slug: prefix + '-invalida', nombre: 'Fechas inválidas', tipo: 'otro', fecha_inicio: '2099-02-01', fecha_fin: '2000-01-01' }), 422, 'Promoción con vigencia invertida');
      status(await request('POST', '/admin/promociones', { slug: prefix + '-descuento-invalido', nombre: 'Descuento inválido', tipo: 'descuento_prima', descuento_pct: 101, fecha_inicio: '2000-01-01', fecha_fin: '2099-01-01' }), 422, 'Porcentaje de descuento fuera de rango');
      promotion = status(await request('POST', '/admin/promociones', { slug: prefix + '-promo', nombre: 'Promoción ficticia', tipo: 'otro', fecha_inicio: '2000-01-01', fecha_fin: '2099-01-01', estado: 'publicado' }), 201, 'Publicar promoción vigente');
      assert((await publicRows('/public/promociones')).some(row => row.id === promotion.id));
      status(await request('PUT', '/admin/promociones/' + promotion.id, { fecha_fin: '2000-12-31' }), 200, 'Editar promoción vencida');
      assert(!(await publicRows('/public/promociones')).some(row => row.id === promotion.id));
      evidence.push({ caso: 'Promoción vencida excluida del sitio público', resultado: 'PASS' });
      status(await request('PUT', '/promociones/' + promotion.id, { fecha_fin: '1999-01-01' }), 422, 'Ruta anterior también valida vigencia');
    });

    await t.test('Programas y beneficios activos', async () => {
      program = status(await request('POST', '/admin/lealtad', { codigo: prefix, nombre: 'Programa ficticio', estado: 'publicado', beneficios: [{ nombre: 'Beneficio ficticio', descripcion: 'Contenido de auditoría', activo: true }] }), 201, 'Crear programa y beneficio publicado');
      let result = (await publicRows('/public/programas-lealtad')).find(row => row.id === program.id);
      assert.equal(result.beneficios.length, 1);
      program.beneficios[0].activo = false;
      status(await request('PUT', '/admin/lealtad/' + program.id, { beneficios: program.beneficios }), 200, 'Desactivar beneficio');
      result = (await publicRows('/public/programas-lealtad')).find(row => row.id === program.id);
      assert.equal(result.beneficios.length, 0);
      evidence.push({ caso: 'Beneficio desactivado excluido del sitio público', resultado: 'PASS' });
    });

    await t.test('Publicación de los seis tipos y privacidad', async () => {
      const values = { slug: prefix + '-encuesta', titulo: 'Encuesta ficticia de seis tipos', tipo: 'satisfaccion', estado: 'publicado', publica: true, permite_anonimas: true, preguntas: questionFixtures() };
      const invalid = structuredClone(values); invalid.preguntas[2].valor_minimo = null;
      status(await request('POST', '/admin/encuestas', invalid), 422, 'Publicar escala con límite nulo');
      invalid.preguntas[2].valor_minimo = 11;
      status(await request('POST', '/admin/encuestas', invalid), 422, 'Publicar escala con límites invertidos');
      const emptyOptions = structuredClone(values); emptyOptions.preguntas[3].opciones = [];
      status(await request('POST', '/admin/encuestas', emptyOptions), 422, 'Publicar opción única sin opciones');
      survey = status(await request('POST', '/admin/encuestas', values), 201, 'Publicar encuesta de seis tipos');
      const privateSurvey = status(await request('POST', '/admin/encuestas', { ...values, slug: prefix + '-privada', publica: false }), 201, 'Crear encuesta privada');
      const list = status(await request('GET', '/public/encuestas?limit=50', null, { guest: true }), 200, 'Listado de encuestas públicas');
      assert(!list.some(row => row.slug === privateSurvey.slug));
      const allPublicSurveys = await publicRows('/public/encuestas');
      assert(allPublicSurveys.some(row => row.slug === survey.slug));
      assert(!allPublicSurveys.some(row => row.slug === privateSurvey.slug));
      status(await request('GET', '/public/encuestas/' + privateSurvey.slug, null, { guest: true }), 404, 'Detalle privado excluido');
      status(await request('POST', '/public/encuestas/' + privateSurvey.slug + '/respuestas', { respuestas: [] }, { guest: true }), 404, 'Envío privado rechazado');
      const nonAnonymous = status(await request('POST', '/admin/encuestas', { ...values, slug: prefix + '-no-anonima', permite_anonimas: false }), 201, 'Crear encuesta sin anonimato');
      status(await request('POST', '/public/encuestas/' + nonAnonymous.slug + '/respuestas', { respuestas: [] }, { guest: true }), 403, 'Encuesta sin anonimato rechazada');
      assert.equal(await EncuestaParticipacion.count({ where: { encuesta_id: nonAnonymous.id } }), 0);
      const expired = status(await request('POST', '/admin/encuestas', { ...values, slug: prefix + '-vencida', fecha_inicio: '2000-01-01', fecha_fin: '2000-12-31' }), 201, 'Crear encuesta vencida');
      status(await request('GET', '/public/encuestas/' + expired.slug, null, { guest: true }), 404, 'Detalle vencido excluido');
      const legacy = status(await request('POST', '/admin/encuestas', { ...values, slug: prefix + '-escala-antigua', estado: 'borrador', preguntas: [{ texto: 'Escala ficticia antigua', tipo_respuesta: 'escala', obligatoria: true, valor_minimo: null, valor_maximo: null }] }), 201, 'Borrador con escala aún sin configurar');
      // Fixture de datos antiguos: simula una publicación anterior a esta validación.
      await models.Encuesta.update({ estado: 'publicado' }, { where: { id: legacy.id } });
      status(await request('POST', '/public/encuestas/' + legacy.slug + '/respuestas', { respuestas: [{ pregunta_id: legacy.preguntas[0].id, valor: 0 }] }, { guest: true }), 422, 'Escala antigua nula no se interpreta como 0..0');
      assert.equal(await EncuestaParticipacion.count({ where: { encuesta_id: legacy.id } }), 0);
      status(await request('PUT', '/admin/encuestas/' + legacy.id, { estado: 'archivado' }), 200, 'Archivar configuración antigua inválida sin reescribir preguntas');
    });

    await t.test('Validación, guardado anónimo y rollback', async () => {
      const q = survey.preguntas;
      const values = ['Comentario ficticio', 3.5, 5, q[3].opciones[0].id, q[4].opciones.map(o => o.id), q[5].opciones[0].id];
      const valid = { respuestas: q.map((question,index) => ({ pregunta_id: question.id, valor: values[index] })) };
      const counts = async () => [await EncuestaParticipacion.count(), await EncuestaRespuesta.count(), await EncuestaRespuestaOpcion.count()];
      const before = await counts();
      status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', { respuestas: [] }, { guest: true }), 422, 'Envío incompleto');
      const foreignOption = structuredClone(valid); foreignOption.respuestas[3].valor = q[4].opciones[0].id;
      status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', foreignOption, { guest: true }), 422, 'Opción de otra pregunta');
      const foreignQuestion = structuredClone(valid); foreignQuestion.respuestas.push({ pregunta_id: 2147483647, valor: 'ajena' });
      status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', foreignQuestion, { guest: true }), 422, 'Pregunta ajena');
      const invalidScale = structuredClone(valid); invalidScale.respuestas[2].valor = 99;
      status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', invalidScale, { guest: true }), 422, 'Escala fuera de rango');
      const invalidType = structuredClone(valid); invalidType.respuestas[1].valor = '3';
      status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', invalidType, { guest: true }), 422, 'Tipo numérico incorrecto');
      assert.deepEqual(await counts(), before);
      status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', valid, { guest: true }), 201, 'Envío anónimo válido guardado');
      const after = await counts();
      assert.deepEqual(after, before.map((count,index) => count + [1,6,4][index]));
      const participation = await EncuestaParticipacion.findOne({ where: { encuesta_id: survey.id } });
      assert.equal(participation.contacto_id, null);
      evidence.push({ caso: 'Persistencia: 1 participación, 6 respuestas y 4 opciones; contacto nulo', resultado: 'PASS' });
      const create = EncuestaRespuestaOpcion.create;
      try {
        EncuestaRespuestaOpcion.create = async () => { throw new Error('Fallo inducido para probar rollback'); };
        status(await request('POST', '/public/encuestas/' + survey.slug + '/respuestas', valid, { guest: true }), 500, 'Falla inducida durante escritura');
      } finally { EncuestaRespuestaOpcion.create = create; }
      assert.deepEqual(await counts(), after);
      evidence.push({ caso: 'Rollback completo tras falla posterior a insertar participación/respuestas', resultado: 'PASS' });
      const changed = structuredClone(survey.preguntas); changed[0].texto = 'Cambio de significado';
      status(await request('PUT', '/admin/encuestas/' + survey.id, { preguntas: changed }), 409, 'Preservar preguntas con respuestas');
      const changedOption = structuredClone(survey.preguntas); changedOption[3].opciones[0].etiqueta = 'Otro significado';
      status(await request('PUT', '/admin/encuestas/' + survey.id, { preguntas: changedOption }), 409, 'Preservar opciones con respuestas');
      status(await request('PUT', '/preguntas-encuesta/' + q[0].id, { texto: 'Cambio por ruta anterior' }), 409, 'Ruta anterior no altera preguntas respondidas');
      status(await request('DELETE', '/encuestas/' + survey.id), 409, 'No eliminar encuesta con histórico');
      status(await request('PUT', '/admin/encuestas/' + survey.id, { introduccion: 'Introducción actualizada' }), 200, 'Editar metadatos conservando respuestas');
      const publicDetail = status(await request('GET', '/public/encuestas/' + survey.slug, null, { guest: true }), 200, 'Detalle público después de responder');
      assert(!/contacto_id|correo|password|participaciones|valor_texto|valor_numerico/.test(JSON.stringify(publicDetail)));
      status(await request('GET', '/public/respuestas-encuesta', null, { guest: true }), 404, 'Respuestas no accesibles públicamente');
    });

    await t.test('Listados privados, logout y límite de acceso', async () => {
      for (const [kind,item] of [['eventos',event],['promociones',promotion],['lealtad',program],['encuestas',survey]]) {
        status(await request('GET', '/admin/' + kind), 200, 'Listado administrativo ' + kind);
        status(await request('GET', '/admin/' + kind + '/' + item.id), 200, 'Editor administrativo ' + kind);
      }
      status(await request('POST', '/auth/logout'), 200, 'Cerrar sesión');
      status(await request('GET', '/auth/session'), 401, 'Sesión cerrada rechazada');
      status(await request('GET', '/admin/encuestas'), 401, 'Ruta interna tras logout');
      csrf = status(await request('GET', '/auth/csrf'), 200, 'CSRF para probar límite').csrfToken;
      const invalidEmail = prefix + '-inexistente@example.invalid';
      for (let i=0;i<10;i++) assert.equal((await request('POST', '/auth/login', { correo: invalidEmail, contrasena: accountPassword })).status, 401);
      status(await request('POST', '/auth/login', { correo: invalidEmail, contrasena: accountPassword }), 429, 'Límite de intentos de acceso');
    });
  } finally {
    if (beforeSnapshot) {
      const afterSnapshot = await developmentSnapshot();
      assert.deepEqual(afterSnapshot, beforeSnapshot, 'La base existente conserva sus conteos');
      evidence.push({ caso: 'Base existente conservada: conteos de todas las tablas sin cambios', resultado: 'PASS', tablas: Object.keys(beforeSnapshot).length });
    }
    fs.mkdirSync(path.join(__dirname, '../docs'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../docs/audit-results.json'), JSON.stringify({ generadoEn: new Date().toISOString(), basePruebas: sequelize.getDatabaseName(), casos: evidence }, null, 2) + '\n');
    if (server) await new Promise(resolve => server.close(resolve));
    await sequelize.close();
  }
});
