# Feature Specification: Republicar el menú del día en un clic

**Feature Branch**: `008-republicar-menu`

**Created**: 2026-10-14

**Status**: Draft

**Input**: Que un administrador pueda publicar el menú de la fecha actual copiando el menú del
día más reciente con **una sola acción**, sin volver a capturar platillos ni precios, y que la
consola de menú del admin sea clara, ordenada y con retroalimentación inmediata. El seed de
demo publica el menú para la fecha en que corren las migraciones; en días posteriores el menú
queda vacío y hoy el admin debe re-capturar todo manualmente. Esta funcionalidad elimina ese
trabajo: “republicar” toma el último menú publicado y lo convierte en el menú del día.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Republicar el menú en un clic (Priority: P1)

El administrador entra a la consola de menú (`/admin/menu`), elige una fecha (por defecto hoy) y
pulsa **Republicar**. El sistema copia todos los platillos del menú del día más reciente a la
fecha elegida, conservando precio, disponibilidad y la marca de “especial”, sin duplicar lo que
ya exista.

**Why this priority**: Es el objetivo de negocio de la funcionalidad: que publicar el menú de un
día nuevo deje de ser una tarea manual y repetitiva para el admin.

**Independent Test**: Con una base de datos en la que solo existe un menú para una fecha pasada,
una petición `POST /api/menu/republicar` para hoy deja el menú de hoy con los mismos platillos
del menú pasado (mismos precios y “especiales”) y responde cuántos se agregaron.

**Acceptance Scenarios**:

1. **Given** existe un menú publicado para el 2026-10-13 con 8 platillos y hoy no hay menú,
   **When** el admin republica para hoy, **Then** el menú de hoy queda con esos 8 platillos y la
   respuesta indica `agregados = 8`.
2. **Given** un menú de hoy que ya contiene algunos platillos del menú de origen, **When** el
   admin republica, **Then** solo se agregan los que faltan y los ya presentes no se duplican.
3. **Given** un menú de hoy que ya tiene todos los platillos del origen, **When** el admin
   republica, **Then** la operación tiene éxito y no agrega ningún registro (`agregados = 0`).
4. **Given** el menú de origen incluye platillos desactivados, **When** el admin republica,
   **Then** los platillos inactivos no se copian.

---

### User Story 2 - Consola de menú clara y atractiva (Priority: P2)

El administrador ve la consola de menú con una sección destacada de **Republicar**, el campo de
fecha compartido, un botón claro y una confirmación legible (cuántos platillos se copiaron y de
qué fecha), además de un mensaje útil cuando la fecha no tiene platillos publicados.

**Why this priority**: La capacidad de republicar no sirve si el admin no la descubre o no
entiende el resultado; una presentación clara reduce el trabajo y los errores.

**Independent Test**: En `/admin/menu`, el admin identifica la acción Republicar, la ejecuta y ve
un aviso con el resultado; cuando la fecha está vacía, el estado muestra cómo publicarla.

**Acceptance Scenarios**:

1. **Given** la consola de menú, **When** el admin la abre, **Then** ve la sección Republicar con
   el botón y el campo de fecha, coherentes con el sistema de diseño.
2. **Given** el admin pulsa Republicar, **When** la operación termina, **Then** ve un aviso con
   cuántos platillos se copiaron y el menú publicado se refresca.
3. **Given** la operación falla (por ejemplo, no hay menú previo), **When** el admin la ejecuta,
   **Then** ve un mensaje de error claro y el resto de la consola sigue funcionando.
4. **Given** una fecha sin platillos, **When** el admin la selecciona, **Then** el estado vacío
   le indica que puede usar Republicar para copiar el menú más reciente.

---

### Edge Cases

- No existe ningún menú previo (base recién instalada): republicar responde un error claro
  (no encontrado) y no crea registros.
- El menú de origen tiene platillos inactivos: se omiten; si todos están inactivos, el resultado
  es `agregados = 0` sin error.
- El destino ya tiene todos los ítems del origen: idempotente, éxito con `agregados = 0`.
- Fecha inválida (formato distinto de `YYYY-MM-DD`): respuesta de datos inválidos.
- Rol sin permiso: se rechaza con acceso prohibido.
- Doble clic/repetición: no genera duplicados (garantía por la unicidad `(fecha, platillo)`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El backend MUST exponer `POST /api/menu/republicar`, accesible **solo** al rol
  administrador.
- **FR-002**: La operación MUST copiar a la fecha destino (por defecto, la fecha actual) los
  ítems del menú de **la fecha publicada más reciente distinta del destino**.
- **FR-003**: La copia MUST conservar precio, disponibilidad y la marca de especial, MUST omitir
  platillos inactivos y MUST NOT duplicar un platillo que ya exista en la fecha destino
  (idempotencia).
- **FR-004**: La respuesta MUST ser `camelCase` con `{ fecha, origen, agregados, omitidos }`.
- **FR-005**: La operación MUST responder error claro cuando no hay menú previo y validar la
  fecha destino (`YYYY-MM-DD` válida); los errores MUST usar el cuerpo uniforme
  `{ error: { codigo, mensaje } }`.
- **FR-006**: La consola de menú del admin (`/admin/menu`) MUST mostrar una sección de Republicar
  ligada a la fecha seleccionada, con confirmación del resultado y mensajes de error claros.
- **FR-007**: La funcionalidad MUST NOT introducir dependencias npm nuevas y MUST usar el
  endpoint/cliente HTTP y el sistema de diseño ya existentes.
- **FR-008**: La lógica crítica (idempotencia, omisión de inactivos, ausencia de menú previo,
  permisos) MUST tener pruebas automatizadas.

### Key Entities *(include if feature involves data)*

- **Ítem de menú del día** (`menu_dia`): fila `(fecha, platillo_id, precio, disponible, especial)`.
  Es el registro que se copia entre fechas; su unicidad `(fecha, platillo_id)` garantiza la
  idempotencia.
- **Menú publicado más reciente**: la `fecha` máxima con ítems en `menu_dia`, excluyendo el
  destino; es la fuente de la copia.
- **Resultado de republicación**: `{ fecha, origen, agregados, omitidos }` que resume la acción.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Partiendo de un destino vacío y un origen con N ítems activos, una sola petición
  deja el destino con N ítems (`agregados = N`).
- **SC-002**: Repetir la operación sobre el mismo destino agrega 0 ítems (idempotencia, 0
  duplicados).
- **SC-003**: `test`, `typecheck`, `build` (backend) y `test`, `typecheck`, `lint`, `build`
  (frontend) permanecen en verde.
- **SC-004**: El flujo manual del admin pasa de re-capturar cada platillo a **una** acción
  (∑ platillos ingresados manualmente = 0).
- **SC-005**: No se agregan dependencias npm nuevas ni se modifica el comportamiento de otros
  roles o flujos de pedidos.

## Assumptions

- El catálogo de platillos y sus precios ya existen; la republicación reutiliza los precios del
  último menú publicado (no recalcula precios de catálogo).
- La fuente de verdad del menú diario es `menu_dia`; no se cambia su esquema ni sus reglas.
- “Fecha actual” usa la zona horaria del servidor, consistente con el resto de la aplicación.
- Queda **fuera de alcance**: programación automática/recurrente del menú, plantillas de menú por
  semana, edición masiva de precios y cualquier cambio de permisos de otros roles.

## Trazabilidad a spec 001 y al roadmap

- Apoya el criterio “publicación del menú del día” del Sprint 3 y el pulido de UI del Sprint 5.
- Requisitos de interfaz de la constitución (§II/§19): UI responsiva, área táctil ≥ 44 px, alto
  contraste y navegación simple.
- Añade una capacidad **de administración** (no un flujo de pedido nuevo); no altera la máquina
  de estados, pagos ni permisos existentes (FR-ronda de pedidos intacta).
- Fuera de alcance: funcionalidades fuera del MVP y automatizaciones no solicitadas.
