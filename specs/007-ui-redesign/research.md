# Research: Tokens de diseño (DESIGN.md) en el frontend

**Feature**: `007-ui-redesign` | **Date**: 2026-10-14

Decisiones tomadas para aplicar `Docs/DESIGN.md` como tokens sin dependencias nuevas ni
cambios de comportamiento.

## 1. Mecanismo de tokens: `@theme` de Tailwind v4

- **Decisión**: Declarar los tokens en un bloque `@theme { ... }` dentro de
  `frontend/src/index.css`.
- **Rationale**: Tailwind v4 (ya instalado, `@tailwindcss/vite`) genera utilidades a partir de
  custom properties declaradas en `@theme`; no requiere `tailwind.config.js` ni plugins. Es el
  mecanismo idiomático y **no añade dependencias** (§22).
- **Alternativas descartadas**: `tailwind.config.js` con `theme.extend` (patrón v3, no es el
  flujo v4 del proyecto) y CSS variables "a mano" sin tokens (no generarían utilidades como
  `bg-primary`).

## 2. Nomenclatura de tokens

- **Decisión**: Usar los nombres de `DESIGN.md` en kebab-case como `--color-<nombre>` y
  `--font-<rol>`:
  - Colores: `--color-surface`, `--color-surface-container`, `--color-on-surface`,
    `--color-on-surface-variant`, `--color-outline`, `--color-outline-variant`,
    `--color-primary`, `--color-on-primary`, `--color-primary-container`,
    `--color-secondary`, `--color-tertiary`, `--color-error`, y los `--color-status-*`
    (`pending`, `paid`, `preparing`, `ready`, `delivered`, `cancelled`).
  - Tipografía: `--font-heading` (Plus Jakarta Sans) y `--font-body` (Inter).
  - Radios y espaciado: los definidos en `DESIGN.md`.
- **Rationale**: Nombres semánticos (no "verde1") hacen que los componentes se lean por
  intención y sobrevivan a cambios de paleta.
- **Alternativas descartadas**: Reutilizar la escala numérica de Tailwind (p. ej. sobrescribir
  `primary-500`) — oculta el significado y acopla a un formato ajeno al documento de diseño.

## 3. Coexistencia con la paleta por defecto

- **Decisión**: **Añadir** tokens; no eliminar ni reemplazar la escala `slate`/`red` de
  Tailwind.
- **Rationale**: Las pantallas aún no migradas siguen usando clases por defecto; quitar ese
  namespace rompería su apariencia. El bloque `@theme` extiende, por lo que las utilidades
  existentes siguen generándose.
- **Riesgo**: Con el tiempo conviven dos sistemas visuales. **Mitigación**: esta spec migra
  solo los archivos listados; el resto se migra en futuras specs de rediseño.

## 4. Fuentes

- **Decisión**: Declarar `--font-heading` y `--font-body` con **pila de respaldo del sistema**
  (`'Plus Jakarta Sans', system-ui, ...` y `'Inter', system-ui, ...`). La fuente web es
  **opcional**: si se agrega, se hace con un enlace en `frontend/index.html` y respaldo local.
- **Rationale**: §28 exige considerar la dependencia de conectividad dentro del plantel; la
  app no debe depender de una CDN de fuentes para verse bien. El respaldo garantiza tipografía
  legible sin red.
- **Alternativas descartadas**: Auto-hospedar las fuentes (añade pesos al repo y complejidad)
  y depender solo de la CDN (falla sin red).

## 5. Radios de `DESIGN.md`

- **Decisión**: Definir los radios de `DESIGN.md`, asumiendo que esto también ajusta las
  utilidades de radio ya usadas (`rounded-lg`, `rounded-xl`) en los componentes base.
- **Rationale**: Los radios forman parte del sistema de diseño; limitarlos a un namespace
  nuevo obligaría a reescribir clases sin necesidad.
- **Riesgo**: Cambio de apariencia sutil en componentes no migrados que usen esos radios.
  **Mitigación**: el cambio es cosmético y no funcional; se valida visualmente en el
  quickstart.

## 6. Colores de estado de pedido

- **Decisión**: Mapear los estados a `--color-status-*` de `DESIGN.md` y usarlos en
  `pages/clientes/MisPedidos.tsx` y `components/cocina/PedidoCard.tsx`, con degradación a un
  neutro legible para estados desconocidos.
- **Rationale**: Unifica el color del mismo estado en cocina y cliente (FR-005/SC-003).
  `DESIGN.md` define insignias con texto blanco; se ajusta el contraste del texto conforme al
  par fondo/texto del token.
- **Alternativas descartadas**: Dejar los mapas locales con colores ad-hoc (inconsistencia
  entre pantallas).

## 7. Navegación por rol (extensión CFITSH-25…29)

- **Decisión**: `LayoutModulo` mantiene un panel fijo en `lg:` y usa `DrawerLateral` en móvil;
  `BarraInferior` sólo en caja y cliente. El estado del drawer es local y se cierra con
  `onCerrar` al pulsar un enlace (sin `useEffect` de ruta, que dispara
  `react-hooks/set-state-in-effect`).
- **Rationale**: reutiliza los `EnlaceNavegacion` existentes, conserva `ProtectedRoute` y
  reduce el cromo en móvil sin tocar rutas.
- **Detalle**: `layout/activo.ts` compara pathname + `query` para distinguir sub-pasos
  (`/caja?paso=captura` vs `/caja`). `query: {}` significa "sin query string".

## 8. Flujo de caja en pasos (CFITSH-26)

- **Decisión**: una sola ruta `/caja` con `useSearchParams` (`paso=inicio|captura|cobro|resultado`).
- **Rationale**: conserva el flujo `useCrearMostrador` + `useCobrarPedido` sin rutas nuevas y
  permite reintentar el cobro de un pedido `Pendiente` sin recapturar.
- **Riesgo**: perder el carrito al recargar en el paso de cobro. **Mitigación**: el pedido ya
  existe; el paso de resultado ofrece reintento/cancelación.

## 9. KDS de cocina (CFITSH-27)

- **Decisión**: agrupar por estado (`Pendiente`, `Pagado`, `En preparación`, `Listo`) sobre
  `usePedidos({ estados: ESTADOS_ACTIVOS, refetchInterval: 5000 })`, con `useCambiarEstado` y
  `BotonEstado` como CTA principal.
- **Rationale**: `desing/diseño-cocina.md` no existe; se toma `Docs/DESIGN.md` + la pantalla
  actual. Agrupar reduce el escaneo y conserva la regla de transiciones.
- **Alternativas descartadas**: ordenar sólo por llegada (pierde prioridad de `Listo`) y
  reescribir el polling con otra librería (dependencia nueva).

## 10. Carrito persistente del cliente (CFITSH-28)

- **Decisión**: `CarritoProvider` en `src/lib/carrito.tsx` con `localStorage`
  (`cafe-itsh-carrito`), clave por `platilloId`, validación contra el menú vigente y limpieza
  al cerrar sesión o completar el pedido.
- **Rationale**: el cliente navega entre menú y carrito sin perder selección; el backend
  sigue calculando totales y hora de recolección.
- **Riesgo**: datos obsoletos (platillo eliminado/no disponible). **Mitigación**: al cargar el
  menú se descartan los ítems no disponibles; el backend revalida al crear el pedido.

## 11. Hora de recolección (CFITSH-28)

- **Decisión**: mostrar `fechaRecoleccion` devuelta por el backend en confirmación, pago,
  mis pedidos y detalle; no capturarla en el cliente.
- **Rationale**: la regla de 10 minutos y la capacidad son del backend; duplicarla en el
  frontend crearía inconsistencias.

## 12. Administración (CFITSH-29)

- **Decisión**: `/admin` renderiza `AdminInicio` con conteos derivados de
  `useQuery(['usuarios'])`, `usePlatillos` y `useMenu`, más tarjetas de acceso.
- **Rationale**: reutiliza hooks y endpoints existentes; no añade métricas de negocio ni
  backend nuevo.

## 13. Qué NO se hace (fuera de alcance)

- Historial de ventas, configuración, métodos de pago con tarjeta/transferencia, descuentos,
  captura de hora de recolección, imágenes de platillo, métricas de negocio y push.
- Cambios en `backend/` o `database/`.
- Dependencias npm nuevas o herramientas de estilos adicionales.

## Impacto esperado

- **Archivos**: ~8 de tokens + ~35 de la extensión en `frontend/src`, más `eslint.config.js`
  y pruebas.
- **Comportamiento en runtime**: mismos endpoints y reglas; cambia la interacción (navegación,
  pasos de caja, carrito persistente).
- **Riesgo**: medio por la cantidad de pantallas; mitigado con pruebas actualizadas y
  verificación `typecheck`/`test`/`lint`/`build`.
