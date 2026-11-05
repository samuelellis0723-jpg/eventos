# Frontend

Aplicación React + Vite del proyecto Eventos.

## Iniciar en desarrollo

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
```

La URL de la API se configura con `VITE_API_URL` en un archivo local `.env.local`. Usa `.env.example` como referencia. No pongas credenciales del backend en el frontend.

La landing pública está en `/`. Los eventos y promociones visibles son datos de ejemplo de `src/mocks/home-content.js`; la landing todavía no consulta la API. Lealtad y Encuestas aparecen en el menú sin enlace hasta que existan sus páginas.
