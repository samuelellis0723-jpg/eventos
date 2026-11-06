# Eventos: gestión de contenido y encuestas anónimas

## Base de trabajo y alcance

Rama `samu`. Se partió de un árbol limpio en `e375c2b` (acceso administrativo), posterior a `403ee83`. Se reutilizaron sesiones locales con scrypt, cookies, CSRF, `PrivateRoutes`, el servicio API, el encabezado/pie administrativos y los componentes públicos. No se reescribió el historial ni se hicieron commit, push o despliegue.

El panel permite crear y editar eventos, promociones, programas/beneficios y encuestas; guardar borradores y publicar. No se añadieron interfaces de membresías, contabilidad de puntos, cupones o canjes. Los beneficios nuevos usan cero en el campo obligatorio existente `puntos_requeridos`; al editar beneficios existentes se conserva ese valor.

## Configuración y arranque

Las credenciales que estaban en `backend/config/config.json` se trasladaron al archivo local ignorado `backend/.env`, sin imprimir sus valores. El JSON se sustituye por `config/config.js`; servidor y Sequelize CLI leen las mismas variables. El historial de Git permanece intacto.

En una instalación nueva, desde `backend/`:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm ci
```

Completa en privado `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_TEST_NAME`. El nombre de pruebas debe ser distinto de `DB_NAME` y terminar en `_test`. Después:

```powershell
npm run db:migrate
node scripts/create-local-admin.js
npm run dev
```

El script del primer administrador requiere una terminal interactiva, solicita nombre, apellidos, correo y contraseña dos veces sin mostrarla. Usa una contraseña propia de 12 a 128 caracteres. No hay contraseña predeterminada ni registro HTTP público. Si ya existe un administrador, el script no crea otro administrador inicial. Usa la cuenta existente.

En otra terminal, desde `frontend/`:

```powershell
npm ci
npm run dev
```

Abre `http://localhost:5173/admin/login`. Las páginas públicas siguen en `/`, `/lealtad` y `/encuestas`. Los módulos están en `/admin/eventos`, `/admin/promociones`, `/admin/lealtad` y `/admin/encuestas`.

`VITE_API_URL=/api` conserva el mismo origen para cookies y CSRF. Vite reenvía `/api` a `http://127.0.0.1:3000`. Si cambias el puerto del backend, inicia Vite con `API_PROXY_TARGET` configurado en la terminal. En producción, sirve frontend y `/api` bajo el mismo origen mediante el servidor web, usa HTTPS, `NODE_ENV=production` y configura `ADMIN_ALLOWED_ORIGINS` con el origen exacto. Las cookies de sesión son HttpOnly, SameSite=Strict y Secure en producción. No se guardan credenciales ni tokens en localStorage/sessionStorage.

## Migraciones

Se conserva `20261105000001-create-admin-session-and-password.js`, que ya estaba aplicada en la base local antes de este trabajo. La migración nueva es:

- `20261106000001-create-admin-login-limit.js`: tabla `admin_login_limite`, con contador persistente por claves hash y vencimiento.

No se cambiaron migraciones anteriores. No fueron necesarios cambios de esquema para guardar contenido ni respuestas: se utilizan las relaciones existentes.

```powershell
# Base configurada en DB_NAME
npm run db:migrate

# Solo base separada: crea el esquema si falta y aplica todas las migraciones
npm run test:prepare
```

Las 37 migraciones se comprobaron en `eventos_audit_20261106_test`. La migración nueva no se aplicó a la base existente durante la auditoría; aplícala con `npm run db:migrate` antes de usar el servidor actualizado sobre esa base.

## Endpoints y permisos

| Métodos y ruta | Acceso | Comportamiento |
| --- | --- | --- |
| `GET /api/auth/csrf` | Público | Emite cookie y token CSRF previo al acceso o renueva el de una sesión. |
| `POST /api/auth/login` | Público con origen permitido y CSRF | Correo/contraseña; límites de 10 intentos IP/correo y 50 por IP cada 15 minutos; exceso 429. |
| `GET /api/auth/session` | Sesión activa | Identidad, roles, vencimiento y CSRF; una cuenta sin rol puede consultar su sesión para mostrar acceso denegado. |
| `POST /api/auth/logout` | Sesión activa, origen y CSRF | Elimina la sesión en el servidor y revoca cookies. |
| `GET /api/admin/{eventos,promociones,lealtad,encuestas}` | Activo con rol `admin` | Listado paginado (`page`, `limit`). |
| `GET /api/admin/{módulo}/:id` | Activo con rol `admin` | Datos del editor; incluye beneficios o preguntas/opciones e indicador de participaciones. |
| `POST /api/admin/{módulo}` | Rol `admin`, origen y CSRF | Crea borrador o contenido publicado válido. El empleado autor se obtiene de la sesión. |
| `PUT /api/admin/{módulo}/:id` | Rol `admin`, origen y CSRF | Guarda y publica según `estado` o `estado_publicacion`; operación transaccional. |
| `GET /api/public/eventos` | Público | Solo `estado_publicacion=publicado`; `estado` operativo no filtra publicación. |
| `GET /api/public/promociones` | Público | Publicadas y vigentes, filtro antes de paginar. |
| `GET /api/public/programas-lealtad` | Público | Programas publicados y vigentes con beneficios activos. |
| `GET /api/public/encuestas` | Público | Encuestas publicadas, públicas y vigentes. Incluye disponibilidad de anonimato. |
| `GET /api/public/encuestas/:slug` | Público | Mismos filtros; preguntas y opciones ordenadas, sin respuestas ni datos personales. |
| `POST /api/public/encuestas/:slug/respuestas` | Público anónimo | Además exige `permite_anonimas=true`; guarda participación/respuestas/opciones en una transacción; devuelve 201 tras confirmar el guardado. |

Todas las rutas internas anteriores, incluidas lecturas de contactos, usuarios, participaciones y respuestas, conservan protección de sesión activa y rol por petición. Sin sesión: 401; sin permiso: 403. Las escrituras autenticadas exigen origen y CSRF. Los errores de validación del nuevo editor/envío usan 422; conflictos de integridad o cambios incompatibles usan 409. Encuesta privada, vencida o no publicada: 404 público. Encuesta sin anonimato: 403 para el envío.

Las escrituras anteriores de eventos, promociones, programas y encuestas se redirigen a la misma validación del nuevo editor. Las mutaciones individuales de `/preguntas-encuesta` y `/opciones-encuesta` responden 409: el cuestionario se guarda como un conjunto desde `/api/admin/encuestas`. Las lecturas anteriores permanecen. El borrado anterior de encuestas responde 409; para retirarlas se usa `estado=archivado`.

## Edición y publicación

- Evento: `estado` describe su situación operativa; `estado_publicacion` controla su publicación. Ambos tienen controles separados.
- Promoción: el servidor exige fechas reales y fin igual o posterior al inicio, tanto en borrador como al publicar. El porcentaje opcional de descuento se valida entre 0 y 100, con hasta dos decimales.
- Lealtad: el editor permite gestionar texto de programa y beneficios, activar y desactivar beneficios. Si un beneficio existente se omite en un grafo, se desactiva; no se elimina su histórico.
- Encuesta: metadatos de visibilidad, vigencia y anonimato; preguntas y opciones ordenadas por su posición en el editor. Se verifican los seis tipos: texto, numérica, escala, opción única, opción múltiple y sí/no. Para publicar se exige al menos una pregunta, opciones suficientes en las selecciones y exactamente dos en sí/no. Las escalas necesitan límites enteros no nulos, mínimo menor que máximo y un máximo de 101 valores. Los límites numéricos opcionales no pueden estar invertidos.
- Si ya existe alguna participación, se conservan IDs, textos, tipos, obligatoriedad, límites, valores y etiquetas de las opciones. El servidor rechaza cambios de significado con 409. Permite actualizar metadatos y orden sin alterar el significado; la interfaz bloquea el cuestionario y permite editar los metadatos. Para cambiar las preguntas se crea otra encuesta.

El guardado del editor y el envío público bloquean la misma fila de encuesta durante su transacción para evitar que cambie el cuestionario mientras se responde.

## Envío público

El formulario no solicita identidad. Una encuesta que no admite anonimato permite consultar sus preguntas, pero deshabilita el envío. En una encuesta habilitada, el botón se bloquea mientras se envía y tras el éxito. Un error mantiene las respuestas en el formulario y ofrece reintentar; la confirmación solo se muestra después del 201 del servidor.

Cuerpo de ejemplo ficticio (los IDs deben proceder del detalle real de la encuesta):

```json
{
  "respuestas": [
    { "pregunta_id": 1, "valor": "Comentario de ejemplo" },
    { "pregunta_id": 2, "valor": 4.5 },
    { "pregunta_id": 3, "valor": 10 },
    { "pregunta_id": 4, "valor": [11, 12] }
  ]
}
```

Texto: cadena de hasta 5000 caracteres. Numérica: número finito representable con dos decimales, respetando límites. Escala: entero dentro del rango. Opción única/sí-no: ID de una opción. Opción múltiple: lista de IDs sin repetidos. Cada pregunta debe pertenecer a la encuesta y cada opción a su pregunta. Las opcionales vacías se omiten. Se rechazan preguntas duplicadas, valores ajenos y campos de identidad. La participación se guarda con `contacto_id=null` y no se almacenan IP, correo ni nombre en el envío público.

## Diseños revisados en Stitch

Proyecto `Eventos — Inicio pública`, ID `8060110008851593348`, reutilizando el sistema Swiss existente y la skill `frontend-design` ya revisada.

- Desktop: `Panel de Gestión de Contenido — Eventos+ (Swiss Design)`, pantalla `e862f926caa24e2c86ed9856de757b4e`.
- Móvil: `Gestión de Encuestas Móvil — Eventos+ (Swiss Design)`, pantalla `9e7be95c7efc447f95212b3e0f761138`.

Se revisaron sus capturas antes de implementar. Se conservaron retícula, blanco/negro/azul, navegación, listado/editor y adaptación móvil. Se omitieron métricas ficticias, auto-guardado y pestañas o campos que no correspondían al modelo real. El login y el panel base ya tenían sus diseños desktop/móvil del trabajo anterior.

## Auditoría reproducible

Desde `backend/`, con MySQL disponible y `DB_TEST_NAME` distinto de `DB_NAME`:

```powershell
npm run test:prepare
npm test
```

Desde `frontend/` y después desde la raíz:

```powershell
npm test
npm run build
cd ..
git diff --check
```

La auditoría crea cuentas y registros ficticios con prefijos únicos solo en la base de pruebas. El contenido se crea/edita/publica mediante HTTP, sin inserciones manuales para completar los flujos del panel. El contador de intentos se reinicia solo dentro del esquema de pruebas para que las ejecuciones sean repetibles. Los fixtures permanecen en ese esquema para inspección. La base existente se consulta en modo lectura antes y después y se comparan los conteos de todas sus tablas.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Visitante, cuenta sin rol, administrador y sesión cerrada; peticiones directas | PASS: 401, 403, 200, 401 | `audit-results.json`: casos de acceso/sesión y rutas internas. |
| Cuenta desactivada y sesión vencida | PASS: 401 | Casos `Sesión vencida rechazada` y `Cuenta desactivada invalida sesión`. |
| Cookies HttpOnly/SameSite y Secure en producción; CSRF y límite de intentos | PASS: cookies comprobadas; 403 y 429 | Casos de acceso y `Límite de intentos de acceso`. |
| Evento borrador pasa a publicado y aparece en Inicio, independiente de estado operativo | PASS | Casos de evento y aserción del listado público. |
| Promoción vencida y vigencia invertida | PASS: excluida y 422 | Casos de promociones, incluida ruta anterior. |
| Beneficio desactivado | PASS: desaparece del público | Caso de beneficios y aserción del listado público. |
| Encuesta privada o vencida | PASS: excluida del listado y detalle 404 | Casos de publicación/privacidad. |
| Seis tipos de pregunta y escala nula/invertida | PASS | Casos de publicación y `frontend/test/survey-validation.test.js`. |
| Envío anónimo válido | PASS: 201; 1 participación, 6 respuestas y 4 opciones | Caso de persistencia; contacto nulo. |
| Incompleto, opción/pregunta ajena, número mal tipado y escala fuera de rango | PASS: 422 y conteos sin cambios | Casos de validación del envío. |
| Encuesta sin anonimato | PASS: 403 y ninguna participación | Caso `Encuesta sin anonimato rechazada`. |
| Fallo inducido tras insertar participación/respuestas | PASS: 500 y rollback total | Caso de rollback, comparación de tres tablas. |
| Edición de pregunta/opción con respuestas | PASS: 409, metadatos editables | Casos de preservación y rutas anteriores. |
| Datos de respuestas fuera de lecturas públicas | PASS | Inspección del detalle y ruta pública de respuestas 404. |
| Carga directa de nueve rutas públicas/privadas y proxy | PASS HTTP; no prueba de renderizado en navegador | `frontend-route-results.json`: 15 comprobaciones. |
| Base existente | PASS: conteos de todas las tablas iguales | Último caso de `audit-results.json`. |
| Frontend: validación/serialización, conservación del cuestionario, compilación y whitespace | PASS: 4 pruebas; build; diff sin errores | Comandos indicados arriba. |
| Revisión visual móvil/desktop, clics y teclado | No ejecutada: navegador no conectado | `cua.getState()` devolvió exactamente `{"apps":[],"browsers":[]}`. |

Evidencia completa por petición: [audit-results.json](audit-results.json). Cargas HTTP y proxy: [frontend-route-results.json](frontend-route-results.json). Estas cargas HTTP verifican que Vite sirve la SPA en las rutas; no sustituyen una comprobación de ejecución e interacción en navegador.

## Archivos cambiados

La lista completa de archivos nuevos, modificados y eliminados de esta entrega se mantiene en [changed-files.txt](changed-files.txt). `backend/.env` es configuración local ignorada y no forma parte del código a versionar. No se añadieron dependencias.
