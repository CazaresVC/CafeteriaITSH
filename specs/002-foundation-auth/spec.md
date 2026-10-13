# Feature Specification: Fundación y autenticación (Sprint 1)

**Feature Branch**: `002-foundation-auth`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 1 del roadmap (`Docs/sprints.md`): base técnica y de seguridad — inicio de
sesión por rol, rutas protegidas y administración de usuarios operativos. Subconjunto de la
spec maestra `specs/001-advance-order-system/spec.md` (US6, US1–US2 como soporte de acceso).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar sesión y acceder al módulo según el rol (Priority: P1)

Una persona inicia sesión con su correo y contraseña y es dirigida a la pantalla
correspondiente a su rol; cualquier intento de abrir una ruta de otro rol o sin sesión es
bloqueado.

**Why this priority**: Sin autenticación y control de acceso no existe base sobre la que
construir el resto del sistema; es la fundación del Sprint 1.

**Independent Test**: Con credenciales válidas de cada rol (administrador, cajero, cocinero,
alumno/docente) se accede a su módulo; sin sesión se redirige al inicio de sesión; con otro
rol se deniega el acceso.

**Acceptance Scenarios**:

1. **Given** un usuario registrado con credenciales válidas, **When** inicia sesión,
   **Then** el sistema abre la pantalla principal del módulo de su rol.
2. **Given** un usuario con credenciales inválidas, **When** intenta iniciar sesión,
   **Then** ve un mensaje claro de error sin revelar si la cuenta existe.
3. **Given** una persona sin sesión activa, **When** intenta abrir una ruta protegida,
   **Then** es redirigida al inicio de sesión.
4. **Given** un usuario con sesión de un rol, **When** intenta abrir la ruta de otro rol,
   **Then** el acceso es denegado.
5. **Given** una sesión expirada o cerrada, **When** el usuario intenta continuar,
   **Then** debe iniciar sesión de nuevo.

---

### User Story 2 - Registrarse como cliente (Priority: P2)

Un alumno o docente crea su cuenta de cliente con correo y contraseña para poder usar el
sistema.

**Why this priority**: Habilita el acceso de los clientes finales, aunque depende de la
autenticación base (US1).

**Independent Test**: Un visitante puede registrarse con correo y contraseña y luego iniciar
sesión con esas credenciales.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** se registra con correo y contraseña válidos,
   **Then** su cuenta de cliente queda creada con el rol alumno/docente.
2. **Given** un visitante que intenta registrarse con un correo ya existente, **When**
   confirma, **Then** el sistema lo rechaza con un mensaje claro sin exponer datos internos.
3. **Given** un registro con datos inválidos o incompletos, **When** confirma, **Then** el
   sistema no crea la cuenta y explica qué corregir.

---

### User Story 3 - Administrar usuarios operativos (Priority: P3)

El administrador crea, edita y deshabilita las cuentas de cajeros y cocineros.

**Why this priority**: Mantiene los accesos del personal; es la historia US6 de la spec
maestra y complementa la base de autenticación.

**Independent Test**: Un administrador autenticado puede crear un cajero y un cocinero, y
deshabilitar una cuenta existente; cada cuenta accede solo a su módulo.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea un usuario operativo con rol cajero
   o cocinero, **Then** el usuario puede iniciar sesión con acceso solo a su módulo.
2. **Given** un usuario operativo existente, **When** el administrador lo deshabilita,
   **Then** ese usuario deja de poder iniciar sesión.
3. **Given** un administrador, **When** edita los datos de un usuario operativo, **Then** los
   cambios se aplican en su próxima sesión.

---

### Edge Cases

- Acceso a una ruta protegida sin sesión, con sesión de otro rol o con sesión expirada.
- Credenciales inválidas: el mensaje no debe revelar si la cuenta existe.
- Contraseñas que nunca viajan ni se almacenan en texto plano.
- Intento de crear una cuenta operativa con un correo ya en uso.
- Usuario operativo deshabilitado mientras tenía una sesión considerada válida.
- Datos de registro inválidos (correo con formato incorrecto, contraseña demasiado débil).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir el registro y el inicio de sesión con correo
  electrónico y contraseña.
- **FR-002**: Cada usuario MUST tener exactamente un rol asignado: administrador, cajero,
  cocinero o alumno/docente.
- **FR-003**: El sistema MUST restringir el acceso de cada usuario a las funciones
  correspondientes a su rol y bloquear cualquier ruta fuera de su módulo.
- **FR-004**: El sistema MUST exigir una sesión activa y el rol correspondiente para acceder
  a cada módulo (`/admin`, `/caja`, `/cocina`, `/menu`, `/mis-pedidos`).
- **FR-005**: El administrador MUST poder crear, editar y gestionar los usuarios operativos
  (cajeros y cocineros).
- **FR-006**: Las contraseñas MUST almacenarse de forma segura, nunca en texto plano, y las
  credenciales MUST NOT residir en el código fuente.
- **FR-007**: El sistema MUST permitir que los clientes (alumno/docente) se registren por
  correo y contraseña.
- **FR-008**: El sistema MUST mostrar credenciales inválidas con un mensaje claro sin revelar
  la existencia de la cuenta.
- **FR-009**: El administrador MUST poder deshabilitar usuarios operativos, impidiendo su
  inicio de sesión posterior.
- **FR-010**: Toda ruta protegida MUST redirigir al inicio de sesión cuando no exista sesión
  válida.

### Key Entities *(include if feature involves data)*

- **Usuario**: Persona que usa el sistema; identificada por correo y contraseña; tiene un rol
  asignado y un estado (activo/deshabilitado).
- **Rol**: Categoría que determina las funciones permitidas; valores: administrador, cajero,
  cocinero, alumno/docente.
- **Sesión**: Estado de acceso autenticado de un usuario; determina a qué módulo puede entrar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las credenciales válidas de cada rol abren el módulo correcto.
- **SC-002**: El 100 % de los accesos a un módulo sin el rol correspondiente (o sin sesión)
  son bloqueados o redirigidos.
- **SC-003**: El 100 % de los registros con datos válidos crea una cuenta de cliente utilizable.
- **SC-004**: Ninguna contraseña se transmite ni se almacena en texto plano (0 incidencias).
- **SC-005**: El administrador puede crear y deshabilitar un usuario operativo en menos de 2
  minutos.
- **SC-006**: Las pruebas y la verificación de tipos del backend y del frontend están en verde.

## Assumptions

- Existen cuentas operativas iniciales (administrador, cajero, cocinero) disponibles para las
  pruebas y la demo del sprint.
- Los alumnos y docentes comparten el rol/vista de cliente.
- El mecanismo técnico de sesión y de protección de rutas (p. ej. tokens y cifrado de
  contraseñas) se define en la constitución y en el plan técnico, no en esta spec.
- La operación de menú, pedidos, pagos y notificaciones queda fuera de este sprint.

## Trazabilidad a spec 001

- Historias: US6 (Administrar usuarios operativos) y el soporte de acceso de US1/US2.
- FRs de la maestra cubiertos: FR-001 a FR-006.
- Fuera de alcance: menú, pedidos, pagos y notificaciones (sprints 2–5).
