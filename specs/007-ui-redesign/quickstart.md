# Quickstart: Tokens de diseño (DESIGN.md) en el frontend

Guía de validación de la funcionalidad. No incluye la implementación; referencia `plan.md`,
`research.md` y `Docs/DESIGN.md`.

## Prerequisitos

- Sprints 1–5 implementados y disponibles (app con roles, menú, pedidos, caja y cocina).
- Node.js LTS y npm. **Recordatorio Windows**: usar `npm.cmd`, no `npm`.
- `Docs/DESIGN.md` disponible como fuente de tokens.

## Puesta en marcha

```bash
# Frontend (el backend no se toca; levántalo solo si quieres ver datos reales)
cd frontend
npm.cmd install
npm.cmd run dev      # Vite en 5173 (proxya /api → :3000)
```

## Escenarios de validación

1. **Tokens definidos y disponibles** — Abrir `frontend/src/index.css` y comprobar el bloque
   `@theme` con los grupos de `DESIGN.md`. Compilar/utilizar una utilidad de token (p. ej.
   `bg-primary`, `font-heading`) y verificar que se genera. FR-001/FR-002.
2. **Tema global** — Cargar `/menu` sin sesión de datos: fondo crema y tipografía base de
   token. Expected: el fondo de la app deja de ser el gris/azul por defecto y pasa a la
   superficie de `DESIGN.md`. FR-002.
3. **Botones** — En el login, comprobar que el botón primario usa el verde institucional con
   texto blanco y que las variantes secundaria/ghost/danger siguen existiendo y funcionando.
   FR-003.
4. **Tarjetas, entradas y etiquetas** — En un formulario (p. ej. login o administración),
   comprobar superficies, bordes, foco verde y etiquetas con tokens. FR-003.
5. **Encabezado del layout** — Entrar con cada rol y verificar que el encabezado de
   `LayoutModulo` usa superficies/texto de token **y** que los enlaces y el botón "Salir"
   siguen navegando igual. FR-004.
6. **Colores de estado consistentes** — Con un pedido en "Listo", comparar la insignia en
   `/cocina` y en `/mis-pedidos`: mismo color en ambas. Repetir con "En preparación" y
   "Pendiente". FR-005/SC-003.
7. **Sin dependencia de red para tipografía** — Cargar con la red desconectada (o bloqueando
   la CDN de fuentes): la interfaz sigue legible gracias al respaldo del sistema. Edge case.
8. **Responsividad y táctil** — En móvil (ancho reducido), verificar que caja y cocina
   conservan áreas táctiles ≥ 44 px y alto contraste. FR-006.

## Verificación automatizada

```bash
cd frontend
npm.cmd run typecheck   # tsc --noEmit
npm.cmd test            # Vitest (jsdom)
npm.cmd run lint        # eslint
npm.cmd run build       # tsc --noEmit && vite build
```

Criterios en verde: `spec.md` → Success Criteria SC-001…SC-005.

## Comprobación de "no regresión"

- `git diff --stat` **no** debe mostrar cambios en `backend/`, `database/` ni en
  `frontend/src/lib/` ni `frontend/src/router.tsx`. SC-004.
- `frontend/package.json` **no** debe ganar dependencias. SC-005.

## Fuera de alcance (no validar aquí)

Navegación drawer/bottom bar, rediseño de pantallas, nuevas rutas, historial de ventas,
métodos de pago con tarjeta/transferencia, descuentos, imágenes de platillo, métricas de
admin y notificaciones push. Requieren una spec y aprobación (§27).
