// Modelo enfocado en un portal público y un panel administrativo de mercadeo.
// El portal publica contenido, eventos, encuestas, promociones y beneficios.
// Las contraseñas y sesiones se administran con un proveedor de autenticación.

Project mercadeo_seguros_web {
  database_type: 'PostgreSQL'
  Note: 'Portal público para clientes y panel interno para administrar contenido, eventos, encuestas, promociones y lealtad.'
}

// ---------------------------------------------------------------------
// ENUMS
// ---------------------------------------------------------------------
Enum tipo_contacto {
  prospecto
  cliente
  ex_cliente
  referido
}

Enum tipo_persona {
  fisica
  juridica
}

Enum tipo_consentimiento {
  email
  sms
  whatsapp
  llamada
  datos_personales
}

Enum tipo_canal_publicacion {
  web
  email
  whatsapp
  instagram
  facebook
  linkedin
  tiktok
}

Enum tipo_activo {
  imagen
  video
  banner
  folleto
  audio
  presentacion
}

Enum estado_publicacion {
  borrador
  en_revision
  programado
  publicado
  pausado
  archivado
}

Enum tipo_contenido {
  articulo
  noticia
  consejo
  pagina_informativa
}

Enum tipo_evento {
  feria
  webinar
  charla
  patrocinio
  otro
}

Enum modalidad_evento {
  presencial
  virtual
  hibrido
}

Enum estado_evento {
  planificado
  en_curso
  realizado
  cancelado
}

Enum estado_inscripcion_evento {
  inscrito
  confirmado
  lista_espera
  cancelado
  asistio
  ausente
}

Enum tipo_encuesta {
  nps
  satisfaccion
  conocimiento_marca
  estudio_mercado
  post_venta
}

Enum tipo_pregunta_encuesta {
  texto
  numerica
  escala
  opcion_unica
  opcion_multiple
  si_no
}

Enum tipo_promocion {
  descuento_prima
  beneficio_adicional
  puntos_extra
  otro
}

Enum estado_cupon {
  disponible
  asignado
  canjeado
  vencido
  anulado
}

Enum tipo_movimiento_puntos {
  acumulacion
  canje
  ajuste
  vencimiento
}

Enum estado_canje_beneficio {
  solicitado
  aprobado
  entregado
  rechazado
  cancelado
}

// ---------------------------------------------------------------------
// PERSONAL Y ACCESO ADMINISTRATIVO
// ---------------------------------------------------------------------
Table empleado {
  id int [pk, increment]
  nombre varchar(100) [not null]
  apellidos varchar(120) [not null]
  correo varchar(150) [not null, unique]
  puesto varchar(100)
  activo boolean [not null, default: true]
  creado_en timestamp [not null, default: `now()`]
}

Table usuario_admin {
  id int [pk, increment]
  empleado_id int [not null, unique]
  proveedor_auth varchar(60) [not null, note: 'Proveedor de identidad; no guardar contraseñas aquí']
  subject_auth varchar(180) [not null]
  activo boolean [not null, default: true]
  ultimo_acceso timestamp

  indexes {
    (proveedor_auth, subject_auth) [unique]
  }
}

Table rol_admin {
  id int [pk, increment]
  codigo varchar(40) [not null, unique]
  nombre varchar(80) [not null]
  descripcion varchar(255)
}

Table usuario_admin_rol {
  usuario_admin_id int [not null]
  rol_admin_id int [not null]

  indexes {
    (usuario_admin_id, rol_admin_id) [pk]
  }
}

// ---------------------------------------------------------------------
// CONTACTOS, CUENTAS DE CLIENTE Y CONSENTIMIENTOS
// ---------------------------------------------------------------------
Table contacto {
  id bigint [pk, increment]
  tipo tipo_contacto [not null, default: 'prospecto']
  tipo_persona tipo_persona [not null, default: 'fisica']
  nombre varchar(120) [not null]
  apellidos varchar(120)
  razon_social varchar(150)
  correo varchar(150)
  telefono varchar(30)
  provincia varchar(60)
  canton varchar(60)
  registrado_en timestamp [not null, default: `now()`]
  activo boolean [not null, default: true]

  indexes {
    correo
    (provincia, canton)
    tipo
  }
}

Table cuenta_cliente {
  id bigint [pk, increment]
  contacto_id bigint [not null, unique]
  proveedor_auth varchar(60) [not null]
  subject_auth varchar(180) [not null]
  activa boolean [not null, default: true]
  creada_en timestamp [not null, default: `now()`]

  indexes {
    (proveedor_auth, subject_auth) [unique]
  }
}

Table consentimiento {
  id bigint [pk, increment]
  contacto_id bigint [not null]
  tipo tipo_consentimiento [not null]
  otorgado boolean [not null]
  registrado_en timestamp [not null, default: `now()`]
  medio_captura varchar(60) [note: 'Formulario web, evento, llamada, etc.']
  version_texto varchar(30)
  ip_origen varchar(45)

  indexes {
    (contacto_id, tipo, registrado_en)
  }
}

// ---------------------------------------------------------------------
// PRODUCTOS DE SEGUROS Y ARCHIVOS DE CONTENIDO
// ---------------------------------------------------------------------
Table ramo_seguro {
  id int [pk, increment]
  nombre varchar(80) [not null, unique]
  descripcion varchar(255)
}

Table producto_seguro {
  id int [pk, increment]
  ramo_id int [not null]
  codigo varchar(30) [not null, unique]
  nombre varchar(120) [not null]
  descripcion text
  activo boolean [not null, default: true]
}

Table activo_creativo {
  id int [pk, increment]
  nombre varchar(150) [not null]
  tipo tipo_activo [not null]
  url_archivo varchar(500) [not null, note: 'Ruta del archivo en almacenamiento; no se guarda el archivo binario en la base']
  texto_alternativo varchar(255) [note: 'Descripción accesible de imágenes']
  creado_por int
  creado_en timestamp [not null, default: `now()`]
}

// ---------------------------------------------------------------------
// CONTENIDO PÚBLICO Y CALENDARIO EDITORIAL
// ---------------------------------------------------------------------
Table categoria_contenido {
  id int [pk, increment]
  nombre varchar(80) [not null, unique]
  descripcion varchar(255)
  activa boolean [not null, default: true]
}

Table contenido_publico {
  id int [pk, increment]
  tipo tipo_contenido [not null]
  slug varchar(180) [not null, unique]
  titulo varchar(180) [not null]
  resumen varchar(500)
  cuerpo text [not null]
  imagen_portada_id int
  estado estado_publicacion [not null, default: 'borrador']
  visible_en_inicio boolean [not null, default: false]
  orden_inicio smallint
  programado_para timestamp
  publicado_en timestamp
  publicado_hasta timestamp
  creado_por int [not null]
  aprobado_por int
  creado_en timestamp [not null, default: `now()`]
  actualizado_en timestamp [not null, default: `now()`]

  indexes {
    (estado, publicado_en)
    (visible_en_inicio, orden_inicio)
  }
}

Table contenido_categoria {
  contenido_id int [not null]
  categoria_id int [not null]

  indexes {
    (contenido_id, categoria_id) [pk]
  }
}

Table calendario_contenido {
  id int [pk, increment]
  contenido_id int [not null]
  canal tipo_canal_publicacion [not null]
  fecha_programada timestamp [not null]
  estado estado_publicacion [not null, default: 'programado']
  url_publicacion varchar(500)
  responsable_id int
  publicado_en timestamp
}

// ---------------------------------------------------------------------
// EVENTOS Y REGISTRO DE ASISTENTES
// ---------------------------------------------------------------------
Table evento_mercadeo {
  id int [pk, increment]
  slug varchar(180) [not null, unique]
  nombre varchar(150) [not null]
  resumen varchar(500)
  descripcion text
  tipo tipo_evento [not null]
  estado estado_evento [not null, default: 'planificado']
  estado_publicacion estado_publicacion [not null, default: 'borrador']
  modalidad modalidad_evento [not null]
  lugar varchar(200)
  url_virtual varchar(500)
  fecha_inicio timestamp [not null]
  fecha_fin timestamp
  inscripciones_desde timestamp
  inscripciones_hasta timestamp
  cupo_maximo int
  destacado_en_inicio boolean [not null, default: false]
  imagen_portada_id int
  responsable_id int [not null]
  creado_en timestamp [not null, default: `now()`]

  indexes {
    (estado_publicacion, fecha_inicio)
    destacado_en_inicio
  }
}

Table evento_sesion {
  id int [pk, increment]
  evento_id int [not null]
  titulo varchar(150) [not null]
  descripcion text
  fecha_inicio timestamp [not null]
  fecha_fin timestamp
  orden smallint [not null]
}

Table expositor {
  id int [pk, increment]
  nombre varchar(120) [not null]
  organizacion varchar(150)
  biografia text
  foto_id int
}

Table evento_sesion_expositor {
  sesion_id int [not null]
  expositor_id int [not null]

  indexes {
    (sesion_id, expositor_id) [pk]
  }
}

Table evento_inscripcion {
  evento_id int [not null]
  contacto_id bigint [not null]
  estado estado_inscripcion_evento [not null, default: 'inscrito']
  registrado_en timestamp [not null, default: `now()`]
  confirmado_en timestamp
  check_in_en timestamp
  notas varchar(500)

  indexes {
    (evento_id, contacto_id) [pk]
    (evento_id, estado)
  }
}

// ---------------------------------------------------------------------
// ENCUESTAS Y RESPUESTAS
// ---------------------------------------------------------------------
Table encuesta {
  id int [pk, increment]
  slug varchar(180) [not null, unique]
  titulo varchar(150) [not null]
  introduccion text
  tipo tipo_encuesta [not null]
  estado estado_publicacion [not null, default: 'borrador']
  publica boolean [not null, default: false]
  permite_anonimas boolean [not null, default: false]
  fecha_inicio date
  fecha_fin date
  creada_por int [not null]
  creada_en timestamp [not null, default: `now()`]
}

Table encuesta_pregunta {
  id int [pk, increment]
  encuesta_id int [not null]
  texto varchar(500) [not null]
  tipo_respuesta tipo_pregunta_encuesta [not null]
  obligatoria boolean [not null, default: true]
  orden smallint [not null]
  valor_minimo smallint
  valor_maximo smallint
}

Table encuesta_opcion {
  id int [pk, increment]
  pregunta_id int [not null]
  etiqueta varchar(200) [not null]
  valor varchar(100) [not null]
  orden smallint [not null]

  indexes {
    (pregunta_id, valor) [unique]
  }
}

Table encuesta_participacion {
  id bigint [pk, increment]
  encuesta_id int [not null]
  contacto_id bigint [note: 'Vacío para respuestas anónimas']
  iniciada_en timestamp [not null, default: `now()`]
  enviada_en timestamp
  fuente varchar(80)

  indexes {
    (encuesta_id, enviada_en)
    contacto_id
  }
}

Table encuesta_respuesta {
  id bigint [pk, increment]
  participacion_id bigint [not null]
  pregunta_id int [not null]
  valor_texto text
  valor_numerico decimal(10,2)

  indexes {
    (participacion_id, pregunta_id) [unique]
  }
}

Table encuesta_respuesta_opcion {
  respuesta_id bigint [not null]
  opcion_id int [not null]

  indexes {
    (respuesta_id, opcion_id) [pk]
  }
}

// ---------------------------------------------------------------------
// PROMOCIONES, PRODUCTOS Y CANJES
// ---------------------------------------------------------------------
Table promocion {
  id int [pk, increment]
  slug varchar(180) [not null, unique]
  nombre varchar(150) [not null]
  resumen varchar(500)
  descripcion text
  condiciones text
  tipo tipo_promocion [not null]
  descuento_pct decimal(5,2)
  estado estado_publicacion [not null, default: 'borrador']
  fecha_inicio date [not null]
  fecha_fin date [not null]
  destacado_en_inicio boolean [not null, default: false]
  requiere_cupon boolean [not null, default: false]
  limite_canjeos int
  imagen_id int
  creado_por int [not null]
  aprobado_por int

  indexes {
    (estado, fecha_inicio, fecha_fin)
    destacado_en_inicio
  }
}

Table promocion_producto {
  promocion_id int [not null]
  producto_id int [not null]

  indexes {
    (promocion_id, producto_id) [pk]
  }
}

Table cupon {
  id bigint [pk, increment]
  promocion_id int [not null]
  codigo varchar(50) [not null, unique]
  contacto_asignado_id bigint
  estado estado_cupon [not null, default: 'disponible']
  creado_en timestamp [not null, default: `now()`]
  vence_en timestamp
}

Table promocion_canje {
  id bigint [pk, increment]
  promocion_id int [not null]
  contacto_id bigint [not null]
  cupon_id bigint [unique]
  canjeado_en timestamp [not null, default: `now()`]
  referencia_poliza varchar(40)
  registrado_por int
}

// ---------------------------------------------------------------------
// LEALTAD, PUNTOS Y BENEFICIOS
// ---------------------------------------------------------------------
Table programa_lealtad {
  id int [pk, increment]
  codigo varchar(40) [not null, unique]
  nombre varchar(120) [not null]
  descripcion text
  condiciones text
  estado estado_publicacion [not null, default: 'borrador']
  fecha_inicio date
  fecha_fin date
  creado_por int [not null]
}

Table beneficio_lealtad {
  id int [pk, increment]
  programa_id int [not null]
  nombre varchar(150) [not null]
  descripcion text
  puntos_requeridos int [not null]
  existencias int
  imagen_id int
  activo boolean [not null, default: true]
}

Table contacto_programa {
  id bigint [pk, increment]
  contacto_id bigint [not null]
  programa_id int [not null]
  puntos_saldo int [not null, default: 0, note: 'Saldo de consulta; el historial oficial está en movimiento_puntos']
  nivel varchar(30)
  fecha_union date [not null]
  activo boolean [not null, default: true]

  indexes {
    (contacto_id, programa_id) [unique]
  }
}

Table movimiento_puntos {
  id bigint [pk, increment]
  contacto_programa_id bigint [not null]
  tipo tipo_movimiento_puntos [not null]
  puntos_delta int [not null, note: 'Positivo suma puntos; negativo resta puntos']
  descripcion varchar(255)
  referencia varchar(100)
  registrado_por int
  registrado_en timestamp [not null, default: `now()`]

  indexes {
    (contacto_programa_id, registrado_en)
  }
}

Table canje_beneficio {
  id bigint [pk, increment]
  contacto_programa_id bigint [not null]
  beneficio_id int [not null]
  estado estado_canje_beneficio [not null, default: 'solicitado']
  puntos_utilizados int [not null]
  solicitado_en timestamp [not null, default: `now()`]
  procesado_en timestamp
  procesado_por int
  notas varchar(500)
}

// ---------------------------------------------------------------------
// AUDITORÍA DEL PANEL
// ---------------------------------------------------------------------
Table auditoria_accion {
  id bigint [pk, increment]
  usuario_admin_id int [not null]
  accion varchar(30) [not null, note: 'Crear, editar, publicar, aprobar, canjear, etc.']
  entidad varchar(80) [not null]
  registro_id varchar(80) [not null]
  datos_anteriores jsonb
  datos_nuevos jsonb
  ip_origen varchar(45)
  ocurrido_en timestamp [not null, default: `now()`]
}

// ---------------------------------------------------------------------
// RELACIONES
// ---------------------------------------------------------------------
Ref: usuario_admin.empleado_id - empleado.id
Ref: usuario_admin_rol.usuario_admin_id > usuario_admin.id
Ref: usuario_admin_rol.rol_admin_id > rol_admin.id

Ref: cuenta_cliente.contacto_id - contacto.id
Ref: consentimiento.contacto_id > contacto.id

Ref: producto_seguro.ramo_id > ramo_seguro.id
Ref: activo_creativo.creado_por > empleado.id

Ref: contenido_publico.imagen_portada_id > activo_creativo.id
Ref: contenido_publico.creado_por > empleado.id
Ref: contenido_publico.aprobado_por > empleado.id
Ref: contenido_categoria.contenido_id > contenido_publico.id
Ref: contenido_categoria.categoria_id > categoria_contenido.id
Ref: calendario_contenido.contenido_id > contenido_publico.id
Ref: calendario_contenido.responsable_id > empleado.id

Ref: evento_mercadeo.imagen_portada_id > activo_creativo.id
Ref: evento_mercadeo.responsable_id > empleado.id
Ref: evento_sesion.evento_id > evento_mercadeo.id
Ref: expositor.foto_id > activo_creativo.id
Ref: evento_sesion_expositor.sesion_id > evento_sesion.id
Ref: evento_sesion_expositor.expositor_id > expositor.id
Ref: evento_inscripcion.evento_id > evento_mercadeo.id
Ref: evento_inscripcion.contacto_id > contacto.id

Ref: encuesta.creada_por > empleado.id
Ref: encuesta_pregunta.encuesta_id > encuesta.id
Ref: encuesta_opcion.pregunta_id > encuesta_pregunta.id
Ref: encuesta_participacion.encuesta_id > encuesta.id
Ref: encuesta_participacion.contacto_id > contacto.id
Ref: encuesta_respuesta.participacion_id > encuesta_participacion.id
Ref: encuesta_respuesta.pregunta_id > encuesta_pregunta.id
Ref: encuesta_respuesta_opcion.respuesta_id > encuesta_respuesta.id
Ref: encuesta_respuesta_opcion.opcion_id > encuesta_opcion.id

Ref: promocion.imagen_id > activo_creativo.id
Ref: promocion.creado_por > empleado.id
Ref: promocion.aprobado_por > empleado.id
Ref: promocion_producto.promocion_id > promocion.id
Ref: promocion_producto.producto_id > producto_seguro.id
Ref: cupon.promocion_id > promocion.id
Ref: cupon.contacto_asignado_id > contacto.id
Ref: promocion_canje.promocion_id > promocion.id
Ref: promocion_canje.contacto_id > contacto.id
Ref: promocion_canje.cupon_id > cupon.id
Ref: promocion_canje.registrado_por > empleado.id

Ref: programa_lealtad.creado_por > empleado.id
Ref: beneficio_lealtad.programa_id > programa_lealtad.id
Ref: beneficio_lealtad.imagen_id > activo_creativo.id
Ref: contacto_programa.contacto_id > contacto.id
Ref: contacto_programa.programa_id > programa_lealtad.id
Ref: movimiento_puntos.contacto_programa_id > contacto_programa.id
Ref: movimiento_puntos.registrado_por > empleado.id
Ref: canje_beneficio.contacto_programa_id > contacto_programa.id
Ref: canje_beneficio.beneficio_id > beneficio_lealtad.id
Ref: canje_beneficio.procesado_por > empleado.id

Ref: auditoria_accion.usuario_admin_id > usuario_admin.id

// ---------------------------------------------------------------------
// GRUPOS PARA LEER EL DIAGRAMA
// ---------------------------------------------------------------------
TableGroup acceso_admin {
  empleado
  usuario_admin
  rol_admin
  usuario_admin_rol
  auditoria_accion
}

TableGroup contactos {
  contacto
  cuenta_cliente
  consentimiento
}

TableGroup catalogo_y_archivos {
  ramo_seguro
  producto_seguro
  activo_creativo
}

TableGroup contenido {
  categoria_contenido
  contenido_publico
  contenido_categoria
  calendario_contenido
}

TableGroup eventos {
  evento_mercadeo
  evento_sesion
  expositor
  evento_sesion_expositor
  evento_inscripcion
}

TableGroup encuestas {
  encuesta
  encuesta_pregunta
  encuesta_opcion
  encuesta_participacion
  encuesta_respuesta
  encuesta_respuesta_opcion
}

TableGroup promociones {
  promocion
  promocion_producto
  cupon
  promocion_canje
}

TableGroup lealtad {
  programa_lealtad
  beneficio_lealtad
  contacto_programa
  movimiento_puntos
  canje_beneficio
}
