# Data Model: Tokens de diseño (DESIGN.md) en el frontend

**Feature**: `007-ui-redesign` | **Date**: 2026-10-14

## Sin entidades de datos

Esta funcionalidad es de **presentación**: no introduce entidades persistidas, relaciones,
migraciones ni contratos de datos. No modifica el esquema de MySQL, los seeds, ni la forma de
las respuestas de la API.

## "Modelo" de tokens (visual, no persistido)

Los únicos valores definidos son **tokens de diseño** (no datos de aplicación), tomados de
`Docs/DESIGN.md` y declarados como custom properties en `frontend/src/index.css`:

| Grupo | Nombres de token (resumen) |
|---|---|
| Superficie (fondo/tarjetas) | `surface`, `surface-container`, `surface-container-*`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant` |
| Marca | `primary`, `on-primary`, `primary-container`, `secondary`, `tertiary`, `error` |
| Estado de pedido | `status-pending`, `status-paid`, `status-preparing`, `status-ready`, `status-delivered`, `status-cancelled` |
| Tipografía | `--font-heading` (Plus Jakarta Sans), `--font-body` (Inter) |
| Radios | `--radius-*` según `DESIGN.md` |
| Espaciado | unidad base y escalas según `DESIGN.md` |

**Nota**: los valores exactos de cada token no se duplican aquí; la fuente de verdad es
`Docs/DESIGN.md` (front-matter `colors`, `typography`, `rounded`, `spacing`).

## Contratos de API

No aplica: la funcionalidad no expone ni modifica endpoints (`contracts/openapi.yaml`
omitido a propósito).
