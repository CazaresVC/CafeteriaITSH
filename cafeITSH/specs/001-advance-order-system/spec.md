# Feature Specification: Sistema de Pedidos Anticipados — Cafetería ITSH

**Feature Branch**: `001-advance-order-system`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "Construir un sistema web de pedidos anticipados llamado 'Sistema de Pedidos Anticipados — Cafetería ITSH' para que alumnos y docentes del Instituto Tecnológico Superior de Huauchinango consulten el menú, hagan pedidos y pagos por adelantado, y reciban una notificación cuando su pedido esté listo, sin interrumpir el servicio actual de mostrador."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar el menú del día (Priority: P1)

Un alumno o docente consulta el menú del día con platillos, precios, disponibilidad y los
especiales del día, de forma rápida incluso en horarios de receso.

**Why this priority**: Es la puerta de entrada a la decisión de compra; sin una consulta
clara y rápida el resto del flujo pierde utilidad.

**Independent Test**: Un visitante puede abrir el menú del día y ver platillos, precios,
disponibilidad y especiales; los cambios publicados por el administrador se reflejan de
inmediato.

**Acceptance Scenarios**:

1. **Given** un menú del día publicado, **When** un cliente abre la consulta de menú,
   **Then** ve los platillos con su precio y disponibilidad y los especiales del día.
2. **Given** un platillo marcado como no disponible, **When** se muestra en el menú,
   **Then** aparece claramente como no disponible y no puede seleccionarse.
3. **Given** un cambio de precio o disponibilidad publicado por el administrador,
   **When** un cliente vuelve a consultar el menú, **Then** ve la información actualizada.

---

### User Story 2 - Realizar un pedido anticipado con pago (Priority: P1)

Un alumno o docente entra al sistema, elige uno o más platillos del menú del día
indicando cantidades, revisa el total y paga en línea para confirmar su pedido antes de
llegar a la cafetería.

**Why this priority**: Es el flujo central del producto y la razón de ser del sistema:
permite anticipar pedidos y pagos, reduciendo la espera en caja y los errores de
comunicación verbal.

**Independent Test**: Un cliente autenticado puede seleccionar platillos disponibles,
confirmar con al menos 10 minutos de anticipación y pagar; el pedido queda registrado en
estado "Pagado" y es visible para el resto del flujo sin necesidad de otras historias.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado con el menú del día disponible, **When** selecciona
   platillos y cantidades y confirma el pedido con al menos 10 minutos de anticipación,
   **Then** el sistema crea el pedido en estado "Pendiente" y muestra el total.
2. **Given** un pedido "Pendiente", **When** el cliente completa el pago en línea
   satisfactoriamente, **Then** el pedido pasa a estado "Pagado".
3. **Given** un cliente que intenta confirmar un pedido con menos de 10 minutos de
   anticipación, **When** confirma, **Then** el sistema rechaza la creación y explica el
   mínimo requerido.
4. **Given** un pedido con un platillo marcado como no disponible, **When** el cliente
   intenta confirmarlo, **Then** el sistema impide la selección y no permite continuar.
5. **Given** un pedido "Pendiente" cuyo pago falla o se cancela, **When** el cliente
   abandona el pago, **Then** el pedido no pasa a "Pagado" y el cliente puede reintentar
   o cancelarlo.

---

### User Story 3 - Visualizar y preparar pedidos en cocina (Priority: P2)

El cocinero ve en una sola pantalla los pedidos entrantes (anticipados y de mostrador) con
sus productos y cantidades, identifica el orden de preparación y actualiza el estado a
"En preparación" y "Listo".

**Why this priority**: Es el punto donde el pedido se materializa; sin él la anticipación no
se traduce en un pedido realmente listo a tiempo.

**Independent Test**: Un cocinero autenticado ve los pedidos pagados en orden de preparación
y puede mover un pedido a "En preparación" y luego a "Listo", reflejando el cambio en el
seguimiento del cliente.

**Acceptance Scenarios**:

1. **Given** pedidos en estado "Pagado", **When** el cocinero abre la pantalla de cocina,
   **Then** ve los pedidos con sus productos, cantidades y un orden de preparación claro.
2. **Given** un pedido "Pagado", **When** el cocinero lo toma, **Then** el estado pasa a
   "En preparación".
3. **Given** un pedido "En preparación", **When** el cocinero lo termina, **Then** el estado
   pasa a "Listo" y se dispara la notificación al cliente.
4. **Given** la pantalla de cocina abierta, **When** llegan nuevos pedidos, **Then** la lista
   se actualiza sin recarga manual.

---

### User Story 4 - Capturar y cobrar pedidos de mostrador (Priority: P2)

El cajero registra pedidos hechos presencialmente y gestiona su cobro, en paralelo con los
pedidos anticipados, con la menor cantidad de pasos posible.

**Why this priority**: Garantiza que la operación tradicional de mostrador no se interrumpa y
conviva con los pedidos anticipados.

**Independent Test**: Un cajero autenticado puede capturar un pedido de mostrador, cobrarlo y
verlo integrarse en la misma cola de cocina que los anticipados.

**Acceptance Scenarios**:

1. **Given** un cliente en mostrador, **When** el cajero captura los platillos y cantidades,
   **Then** el sistema registra el pedido de mostrador con su total.
2. **Given** un pedido de mostrador registrado, **When** el cajero registra el cobro,
   **Then** el pedido pasa a "Pagado" y entra a la cola de preparación.
3. **Given** pedidos anticipados y de mostrador activos, **When** el cajero opera,
   **Then** ambos tipos se gestionan simultáneamente sin bloquearse entre sí.

---

### User Story 5 - Seguimiento y notificación del pedido (Priority: P3)

Un alumno o docente consulta la lista y el detalle de sus pedidos, y recibe una notificación
cuando su pedido pasa a "Listo" para recogerlo.

**Why this priority**: Cierra el ciclo de la experiencia anticipada: el cliente sabe cuándo
recoger sin hacer fila ni preguntar.

**Independent Test**: Un cliente con pedidos registrados ve su estado actualizado y recibe una
notificación al pasar a "Listo".

**Acceptance Scenarios**:

1. **Given** un cliente con pedidos previos, **When** abre "mis pedidos", **Then** ve la
   lista con el estado actual y el detalle (platillos, cantidades, total) de cada uno.
2. **Given** un pedido del cliente en estado "En preparación", **When** el cocinero lo marca
   como "Listo", **Then** el cliente recibe una notificación de que ya puede recogerlo.
3. **Given** un pedido "Listo", **When** el cliente lo recoge y se entrega, **Then** el estado
   pasa a "Entregado" y ya no puede cambiar.

---

### User Story 6 - Administrar usuarios operativos (Priority: P3)

El administrador gestiona los usuarios operativos, creando, editando y deshabilitando las
cuentas de cajeros y cocineros.

**Why this priority**: Habilita y mantiene los accesos del personal, aunque no es la
interacción de cara al cliente final.

**Independent Test**: Un administrador autenticado puede crear un cajero y un cocinero, y
estos pueden iniciar sesión con acceso solo a su módulo.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea un usuario operativo con rol cajero
   o cocinero, **Then** el usuario puede iniciar sesión con acceso solo a su módulo.
2. **Given** un usuario operativo existente, **When** el administrador lo deshabilita,
   **Then** ese usuario deja de poder iniciar sesión.

---

### User Story 7 - Gestionar el menú, platillos y precios (Priority: P1)

El administrador gestiona el menú diario, los platillos, los especiales del día y los precios,
y marca platillos como no disponibles.

**Why this priority**: Es requisito para que exista un menú que los clientes puedan consultar y
sobre el que se puedan realizar pedidos.

**Independent Test**: Un administrador autenticado puede publicar platillos con precios,
marcarlos como no disponibles y configurar un especial del día, y los cambios se reflejan en
el menú de los clientes.

**Acceptance Scenarios**:

1. **Given** un administrador, **When** crea o edita un platillo y define su precio,
   **Then** el platillo queda disponible en el menú según su disponibilidad.
2. **Given** un administrador, **When** marca un platillo como no disponible, **Then** deja de
   poder seleccionarse en nuevos pedidos y se refleja en el menú del cliente.
3. **Given** un administrador, **When** configura un especial del día, **Then** aparece
   destacado para los clientes.

---

### Edge Cases

- Pedido confirmado con exactamente 10 minutos de anticipación (límite permitido) frente a
  uno con 9 minutos (rechazado).
- Intento de incluir un platillo que se marcó como no disponible entre la selección y la
  confirmación del pedido.
- Pago interrumpido por pérdida de conectividad: el pedido no debe quedar en estado
  inconsistente y el cliente debe poder reintentar.
- Dos clientes comprando el último platillo disponible al mismo tiempo.
- Intento de saltar estados (por ejemplo, "Pendiente" → "Listo") o de modificar un pedido
  "Entregado" o "Cancelado".
- Cancelación de un pedido anticipado antes de ser entregado.
- Pedido de mostrador capturado mientras no hay pedidos anticipados (y viceversa).
- Cliente que intenta acceder a una ruta de otro rol (por ejemplo, un alumno abriendo
  `/admin`), o con sesión expirada.
- Falla del servicio externo de pago o de notificación: el pedido y su estado no deben
  corromperse.
- Consulta del menú durante un horario de receso con alta concurrencia.

## Requirements *(mandatory)*

### Functional Requirements

**Usuarios, autenticación y roles**

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

**Menú y platillos**

- **FR-007**: El administrador MUST poder crear y modificar el menú diario.
- **FR-008**: El administrador MUST poder crear, editar y gestionar los platillos.
- **FR-009**: El administrador MUST poder asignar y modificar precios.
- **FR-010**: El administrador MUST poder gestionar los especiales del día.
- **FR-011**: El administrador MUST poder marcar platillos como no disponibles.
- **FR-012**: Un platillo no disponible MUST NOT poder seleccionarse en nuevos pedidos.
- **FR-013**: Los clientes MUST poder consultar el menú del día con platillos, precios,
  disponibilidad y especiales del día.
- **FR-014**: Los cambios publicados en el menú MUST reflejarse de inmediato para los
  usuarios finales.

**Pedidos**

- **FR-015**: Los clientes MUST poder seleccionar uno o más platillos del menú del día y sus
  cantidades.
- **FR-016**: El sistema MUST mostrar el total del pedido antes de confirmarlo.
- **FR-017**: El sistema MUST permitir crear pedidos anticipados únicamente con al menos 10
  minutos de anticipación y MUST rechazar los que tengan menos.
- **FR-018**: El sistema MUST impedir incluir platillos no disponibles en un pedido.
- **FR-019**: Cada pedido MUST tener siempre un estado que refleje su progreso.
- **FR-020**: Los estados válidos MUST ser: Pendiente, Pagado, En preparación, Listo,
  Entregado y Cancelado.
- **FR-021**: El sistema MUST permitir únicamente las transiciones: Pendiente → Pagado,
  Pagado → En preparación, En preparación → Listo, Listo → Entregado, y cualquier estado
  previo a Entregado → Cancelado.
- **FR-022**: El sistema MUST impedir saltarse estados del flujo principal y MUST impedir
  cambiar el estado de un pedido Entregado o Cancelado.
- **FR-023**: El sistema MUST permitir operar simultáneamente pedidos anticipados y pedidos de
  mostrador.
- **FR-024**: El cajero MUST poder capturar pedidos realizados presencialmente en el mostrador
  con la menor cantidad de pasos posible.
- **FR-025**: El sistema MUST permitir registrar y gestionar el cobro de los pedidos de
  mostrador.
- **FR-026**: Los clientes MUST poder consultar la lista de sus pedidos y el estado actual de
  cada uno.
- **FR-027**: Los clientes MUST poder consultar el detalle de un pedido (platillos,
  cantidades y total).

**Pagos**

- **FR-028**: El sistema MUST permitir el pago en línea como parte del flujo de realización
  del pedido anticipado.
- **FR-029**: El sistema MUST NOT almacenar datos sensibles de tarjetas bancarias y MUST
  registrar únicamente la información necesaria para identificar y validar la transacción.
- **FR-030**: Un pedido anticipado MUST pasar a "Pagado" únicamente cuando el pago se
  confirme.

**Cocina**

- **FR-031**: El cocinero MUST poder visualizar en una sola pantalla los pedidos entrantes
  (anticipados y de mostrador).
- **FR-032**: El sistema MUST mostrar al cocinero los productos y cantidades que deben
  prepararse.
- **FR-033**: El sistema MUST facilitar al cocinero identificar el orden de preparación de los
  pedidos.
- **FR-034**: El cocinero MUST poder cambiar el estado del pedido a "En preparación" y a
  "Listo".
- **FR-035**: La lista de pedidos de cocina MUST actualizarse para reflejar los pedidos
  entrantes y sus cambios de estado sin recarga manual.

**Notificaciones**

- **FR-036**: El sistema MUST notificar al cliente cuando su pedido pase a "Listo".
- **FR-037**: La funcionalidad de notificaciones MUST mantenerse separada de la lógica
  principal de pedidos.

**Validación, errores y seguridad**

- **FR-038**: El sistema MUST validar los datos antes de procesarlos y almacenarlos, y MUST
  NOT confiar únicamente en las validaciones del cliente.
- **FR-039**: El sistema MUST mostrar mensajes de error claros, sin exponer información
  interna del servidor ni trazas técnicas.
- **FR-040**: El sistema MUST gestionar la información sensible mediante variables de
  entorno, sin incluir credenciales ni claves en el código.

### Key Entities *(include if feature involves data)*

- **Usuario**: Persona que usa el sistema; identificada por correo y contraseña; tiene un rol
  asignado y datos básicos de identificación.
- **Rol**: Categoría que determina las funciones permitidas; valores: administrador, cajero,
  cocinero, alumno/docente.
- **Platillo**: Producto ofrecible de la cafetería; tiene nombre, precio y estado de
  disponibilidad; puede aparecer en el menú y en los pedidos.
- **Menú diario**: Conjunto de platillos y precios vigentes para un día, incluyendo los
  especiales del día.
- **Especial del día**: Platillo destacado para una fecha determinada.
- **Pedido**: Solicitud de uno o más platillos; tiene un cliente (o captura en mostrador), un
  tipo (anticipado o mostrador), un estado, un total y una fecha/hora.
- **Detalle de pedido**: Cada línea de un pedido con platillo, cantidad y precio aplicado.
- **Pago**: Registro de la transacción asociada a un pedido; incluye el identificador y la
  validación de la transacción, sin datos sensibles de tarjeta.
- **Estado de pedido**: Valor del progreso del pedido (Pendiente, Pagado, En preparación,
  Listo, Entregado, Cancelado) y las transiciones permitidas entre ellos.
- **Notificación**: Aviso enviado al cliente cuando su pedido está listo; operado de forma
  independiente de la lógica de pedidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los clientes pueden completar el flujo de consulta de menú → selección →
  creación del pedido → pago en menos de 3 minutos en condiciones normales.
- **SC-002**: El 100 % de los pedidos anticipados se crean con al menos 10 minutos de
  anticipación; el sistema rechaza el 100 % de los intentos con menos tiempo.
- **SC-003**: El tiempo de espera en caja durante los recesos se reduce en al menos 50 %
  respecto a la operación tradicional.
- **SC-004**: Cero pedidos creados con platillos no disponibles ni con datos inválidos
  almacenados.
- **SC-005**: El 100 % de los pedidos notificados como "Listo" notifican al cliente sin
  intervención manual adicional.
- **SC-006**: El sistema atiende pedidos anticipados y de mostrador simultáneamente sin
  bloquear la operación de caja ni la de cocina.
- **SC-007**: El 100 % de los intentos de acceso a un módulo sin el rol correspondiente son
  bloqueados.
- **SC-008**: Al menos el 90 % de los clientes completa su pedido anticipado en el primer
  intento sin ayuda del personal.
- **SC-009**: El cocinero puede identificar qué pedido preparar a continuación y actualizar su
  estado en 2 interacciones o menos por pedido.

## Assumptions

- Los usuarios cuentan con correo electrónico y conexión a internet dentro del plantel;
  la dependencia de conectividad se asume y se documenta como restricción conocida.
- Los alumnos y docentes comparten la misma vista de cliente y su distinción es únicamente la
  cuenta y su rol; no se requieren permisos distintos entre ellos.
- La creación de cuentas de cliente (alumno/docente) está disponible con registro por correo y
  contraseña; las cuentas operativas (cajero/cocinero) las crea el administrador.
- El sistema de notificaciones puede apoyarse en un servicio externo; el canal de
  notificación (correo, push web, u otro) se definirá en la fase de planeación.
- El pago en línea usa un proveedor externo; el sistema solo registra lo necesario para
  identificar y validar la transacción, sin datos sensibles de tarjeta.
- La operación de mostrador existente se mantiene y convive con el sistema; este no la
  reemplaza ni la interrumpe.
- No se contempla aplicación móvil nativa; la experiencia es web responsiva.
- Están fuera de alcance: reseñas, puntos o lealtad, gestión de inventario y de proveedores.
- No se define una cobertura mínima de pruebas, pero la lógica crítica debe estar cubierta.
- El despliegue del MVP puede realizarse con servicios de hosting gratuitos o de bajo costo.
