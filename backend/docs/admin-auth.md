# Acceso administrativo local

## Autenticación disponible

El proyecto no tiene un flujo OAuth/OIDC ni otro proveedor de identidad conectado. Los campos `proveedor_auth` y `subject_auth` identificaban una cuenta externa, pero no verificaban credenciales. El acceso local usa el correo de `empleado`, `proveedor_auth = local` y un hash `scrypt` en `usuario_admin.password_hash`. No se almacena ni se devuelve la contraseña o su hash.

## Crear el primer administrador

Desde una terminal interactiva, en el directorio `backend/`:

```powershell
npx sequelize-cli db:migrate
node scripts/create-local-admin.js
```

El script solicita el nombre, apellidos y correo del empleado y pide la contraseña dos veces sin mostrarla en pantalla. La contraseña debe tener entre 12 y 128 caracteres. El script crea la cuenta local y el rol `admin` en una transacción, y se niega a crear otra cuenta inicial cuando ya hay una con ese rol. No existe una ruta pública para registrar administradores.

Si el servidor está en producción, configura `ADMIN_ALLOWED_ORIGINS` con el origen HTTPS exacto de la aplicación antes de iniciar el backend, por ejemplo `https://admin.ejemplo.invalid`. En desarrollo se permiten los orígenes locales de Vite. Las cookies reciben el atributo `Secure` cuando `NODE_ENV=production`; producción debe servirse por HTTPS.

## Endpoints de sesión

- `GET /api/auth/csrf`: obtiene un token CSRF y establece la cookie CSRF.
- `POST /api/auth/login`: recibe `{ "correo": "…", "contrasena": "…" }`; requiere la cookie CSRF, el encabezado `X-CSRF-Token` y un `Origin` permitido.
- `GET /api/auth/session`: devuelve la cuenta activa, sus roles y el token CSRF vigente; devuelve `401` si la sesión no existe, venció o la cuenta está inactiva.
- `POST /api/auth/logout`: requiere sesión, origen permitido y token CSRF; elimina la sesión en la base y revoca la cookie.

La cookie `eventos_admin_session` es `HttpOnly`, `SameSite=Strict`, tiene una duración fija de ocho horas y contiene un token aleatorio cuyo hash se guarda en `sesion_admin`. La cookie `eventos_admin_csrf` es legible por el cliente para que pueda enviarla en `X-CSRF-Token`; su hash queda asociado a la sesión.

## Permisos

Todas las rutas internas existentes —incluidas las lecturas de contactos, participaciones y respuestas— requieren una cuenta y un empleado activos con el rol `admin`. La autenticación y el rol se vuelven a consultar en cada petición. Sin sesión responde `401`; con sesión y sin el rol requerido, `403`. Las rutas `GET /api/public/*` permanecen accesibles sin sesión.

Las solicitudes internas `POST`, `PUT`, `PATCH` y `DELETE`, además del cierre de sesión, validan el origen permitido y el token CSRF asociado a la sesión. El inicio de sesión también valida el origen y el token CSRF previo a la autenticación.
