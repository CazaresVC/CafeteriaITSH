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

## 7. Qué NO se hace (fuera de alcance)

- Navegación drawer/bottom bar y reestructuración de `LayoutModulo` (solo colores/superficies).
- Rediseño de pantallas, nuevas rutas o pantallas nuevas.
- Cambios en `src/lib/*`, `src/router.tsx`, `backend/` o `database/`.
- Dependencias npm nuevas o herramientas de estilos adicionales.

## Impacto esperado

- **Archivos**: ~8 en `frontend/src` más, opcionalmente, `frontend/index.html`.
- **Comportamiento en runtime**: sin cambios (solo clases/tokens).
- **Riesgo**: bajo; el mayor es visual (radios) y de coexistencia de paletas, mitigados.
