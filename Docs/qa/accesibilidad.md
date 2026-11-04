# Checklist de accesibilidad y aceptación manual

**Fecha de creación**: 2026-10-31
**Alcance**: login, menú, caja y cocina.
**Referencia**: WCAG 2.1 AA (contraste, foco, teclado, etiquetas y tamaño táctil).

## Cómo registrar

Para cada pantalla, marcar `Sí`, `No` o `N/A`, anotar la evidencia (captura, navegador,
dispositivo) y abrir un defecto en `Docs/qa/bitacora-defectos.md` si algo falla.

## Checklist

| # | Criterio | Login | Menú | Caja | Cocina |
|---|---|---|---|---|---|
| 1 | Navegación completa con Tab/Shift+Tab, sin trampas de foco | Pendiente | Pendiente | Pendiente | Pendiente |
| 2 | Foco visible en enlaces, botones, campos y tabs | Pendiente | Pendiente | Pendiente | Pendiente |
| 3 | Contraste de texto ≥ 4.5:1 | Pendiente | Pendiente | Pendiente | Pendiente |
| 4 | Contraste de componentes/estado ≥ 3:1 | Pendiente | Pendiente | Pendiente | Pendiente |
| 5 | Campos con `label` o `aria-label` asociado | Pendiente | Pendiente | Pendiente | Pendiente |
| 6 | Errores anunciados y asociados al campo | Pendiente | Pendiente | Pendiente | Pendiente |
| 7 | Estado del pedido no depende solo del color | Pendiente | Pendiente | Pendiente | Pendiente |
| 8 | Área táctil ≥ 44 × 44 px | N/A | Pendiente | Pendiente | Pendiente |
| 9 | Zoom al 200 % sin pérdida ni solapamiento | Pendiente | Pendiente | Pendiente | Pendiente |
| 10 | Uso con red desconectada: tipografía legible por fallback | Pendiente | Pendiente | Pendiente | Pendiente |

## Evidencia de ejecución

| Fecha | Pantalla | Navegador/dispositivo | Resultado | Notas |
|---|---|---|---|---|
| — | — | — | Pendiente | Requiere ejecución visual con backend y frontend en marcha |

## Escenarios del quickstart 007

| # | Escenario | Resultado | Evidencia |
|---|---|---|---|
| 1 | Tokens `@theme` definidos y disponibles | Pendiente | `frontend/src/index.css` |
| 2 | Tema global (fondo crema y tipografía base) | Pendiente | Captura de `/menu` |
| 3 | Botones primario/secundario/ghost/danger | Pendiente | Captura de `/login` |
| 4 | Tarjetas, entradas, etiquetas y foco verde | Pendiente | Captura de formulario |
| 5 | Encabezado de `LayoutModulo` por rol | Pendiente | Captura por rol |
| 6 | Colores de estado consistentes cocina/cliente | Pendiente | Captura comparativa |
| 7 | Tipografía sin dependencia de red | Pendiente | Captura con CDN bloqueada |
| 8 | Responsividad y áreas táctiles ≥ 44 px | Pendiente | Captura móvil |

## Rendimiento

Ejecutar con el backend en marcha:

```powershell
cd backend
node scripts/smoke-perf.mjs
```

Registrar aquí el p95 de `GET /api/health` y `GET /api/menu`, y el umbral usado
(`PERF_P95_MS`, por defecto 500 ms).

| Fecha | Endpoint | p50 | p95 | Umbral | Resultado |
|---|---|---:|---:|---:|---|
| — | `/api/health` | — | — | 500 ms | Pendiente |
| — | `/api/menu` | — | — | 500 ms | Pendiente (requiere cookie) |
