# Data Model: Fundación y autenticación (Sprint 1)

Fuente de verdad del esquema inicial (`database/migrations/001_crear_esquema.sql` y
`002_seed_inicial.sql`). El acceso es SQL parametrizado con `mysql2`; no hay ORM.

## Entidades

### rol

Catálogo de roles del sistema.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(30) | NOT NULL, UNIQUE (`uq_rol_nombre`) |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Valores sembrados**: `administrador`, `cajero`, `cocinero`, `usuario`.

> Nota de mapeo: el rol `usuario` corresponde a **alumno/docente** (vista de cliente) de las
> specs. Se mantiene el nombre de la BD y se traduce a la etiqueta de UI.

### usuario

Persona que usa el sistema.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `correo` | VARCHAR(150) | NOT NULL, UNIQUE (`uq_usuario_correo`) |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `activo` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `rol_id` | INT | NOT NULL, FK → `rol(id)` (`fk_usuario_rol`) |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Relaciones**: `usuario.rol_id` → `rol.id` (N:1). Índice `idx_usuario_rol`.

## Reglas de validación (de los requisitos)

- **Correo**: obligatorio, formato de correo válido, único (case-insensitive para login).
- **Contraseña**: obligatoria en registro; longitud mínima 8; nunca se almacena ni se registra
  en claro; sólo `password_hash` (bcrypt, coste 10).
- **Nombre**: obligatorio, 1–100 caracteres.
- **Rol**: debe ser uno de `administrador`, `cajero`, `cocinero`, `usuario`.
- **Registro público**: sólo puede crear cuentas con rol `usuario` (cliente). Las cuentas
  `cajero`/`cocinero` sólo las crea un `administrador`.
- **Deshabilitar**: `activo = 0` impide el inicio de sesión.
- **Mensaje de credenciales inválidas**: genérico ("correo o contraseña incorrectos"), sin
  revelar si el correo existe.

## Reglas de sesión (derivadas)

- El token JWT se emite sólo con credenciales válidas y `activo = 1`.
- El token incluye `sub` (usuario id) y `rol`; expiración configurable (p. ej. 2 h).
- `requireAuth` re-verifica que el usuario exista y siga activo.
- `requireRole` compara el rol del token con los roles permitidos por ruta.

## Estado e invariantes

- Un usuario deshabilitado no puede autenticarse aunque su token previo aún no haya expirado:
  la re-verificación en `requireAuth` debe rechazarlo.
- No hay tabla de sesiones: el estado de sesión es stateless (JWT).
