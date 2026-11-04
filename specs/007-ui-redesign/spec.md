# Feature Specification: Tokens de diseño y rediseño de navegación/pantallas por rol

**Feature Branch**: `007-ui-redesign`

**Created**: 2026-10-14

**Status**: Implemented (tokens + extensión CFITSH-25…29, 2026-11-02)

**Input**: Aplicar el sistema de diseño canónico `Docs/DESIGN.md` (paleta, tipografía,
radios y espaciado) al frontend como tokens de Tailwind y, en una segunda fase aprobada
(CFITSH-25…29), reemplazar la navegación por drawer/bottom bar y rediseñar las pantallas
de caja, cocina, cliente y administración conforme a `desing/`, sin cambiar rutas,
endpoints ni lógica de negocio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tokens base del sistema de diseño (Priority: P1)

Quien desarrolla y quien usa la aplicación ve la identidad visual de la cafetería
(verde institucional, fondo crema, tipografía, radios) definida como tokens del proyecto,
en lugar de los colores por defecto del framework, sin que cambie ninguna pantalla ni
comportamiento.

**Why this priority**: Es la base del pulido de UI del Sprint 5; sin los tokens definidos
no puede hablarse de un sistema de diseño consistente en el resto de la interfaz.

**Independent Test**: Existen los tokens de `DESIGN.md` como custom properties del
proyecto y el fondo, el texto y la tipografía globales de la aplicación los consumen; la
aplicación compila y las pruebas siguen en verde.

**Acceptance Scenarios**:

1. **Given** el frontend actual con colores por defecto, **When** se aplican los tokens de
   `DESIGN.md`, **Then** el tema global (superficie, texto y tipografía) usa dichos tokens.
2. **Given** los tokens definidos, **When** se compilan las utilidades de estilo, **Then**
   los nombres de token (colores, fuentes, radios) están disponibles para los componentes.
3. **Given** la aplicación con tokens, **When** se ejecutan `typecheck`, `test`, `lint` y
   `build`, **Then** todo permanece en verde y ninguna funcionalidad cambia.

---

### User Story 2 - Componentes base y layout con tokens (Priority: P2)

Quien usa la aplicación percibe botones, tarjetas, campos de formulario y el encabezado del
layout con la identidad visual del proyecto (acción primaria en verde, superficies crema y
blancas, radios y foco definidos), conservando exactamente el mismo comportamiento y los
mismos puntos de navegación.

**Why this priority**: Los componentes compartidos son los que dan coherencia visual a
todas las pantallas; aplicarlos después de los tokens produce una mejora visible sin tocar
la lógica.

**Independent Test**: Los componentes base y el encabezado del layout usan los tokens;
sus variantes y su API pública no cambian y las pantallas que los usan siguen funcionando
igual.

**Acceptance Scenarios**:

1. **Given** el componente de botón, **When** se renderiza su variante primaria, **Then**
   usa el verde institucional con texto blanco; las variantes existentes se conservan.
2. **Given** una tarjeta y un campo de entrada, **When** se muestran, **Then** usan las
   superficies, bordes y foco del sistema de diseño.
3. **Given** el encabezado del layout por rol, **When** se muestra, **Then** usa las
   superficies y el color de texto de los tokens sin alterar sus enlaces ni su estructura.

---

### User Story 3 - Colores de estado de pedido con tokens (Priority: P3)

Quien usa la aplicación ve las insignias de estado de pedido (Pendiente, Pagado, En
preparación, Listo, Entregado, Cancelado) con los colores definidos por el sistema de
diseño, de forma consistente entre cocina y las pantallas del cliente.

**Why this priority**: Unifica la lectura del estado del pedido en todos los roles; es un
refinamiento posterior a la base visual.

**Independent Test**: Las insignias de estado en cocina y en "mis pedidos" usan los tokens
de color de estado definidos en `DESIGN.md` y muestran el mismo color para el mismo estado
en ambas pantallas.

**Acceptance Scenarios**:

1. **Given** un pedido "Listo", **When** se muestra en cocina y en "mis pedidos",
   **Then** ambas insignias usan el mismo color de estado del sistema de diseño.
2. **Given** un pedido en cualquier estado válido, **When** se muestra su insignia,
   **Then** el color corresponde al token de ese estado y el texto es legible.

---

### User Story 4 - Navegación y rediseño de caja (Priority: P2, extensión CFITSH-25/26)

El cajero navega con drawer lateral en móvil y panel fijo en escritorio, captura pedidos
con búsqueda, chips de categoría y stepper, revisa el cobro en un paso y entrega pedidos
listos con contador visible.

**Independent Test**: En `/caja` el drawer/bottom bar navega a Inicio, Capturar pedido y
Pedidos listos; el flujo captura → cobro conserva `useCrearMostrador` + `useCobrarPedido`
y, si el cobro falla, el pedido queda `Pendiente` con reintento sin recapturar.

**Acceptance Scenarios**:

1. **Given** el cajero en `/caja`, **When** abre el menú en móvil, **Then** ve drawer con
   perfil, Inicio, Capturar pedido y Pedidos listos con contador.
2. **Given** un carrito de mostrador, **When** pulsa “Registrar y cobrar”, **Then** se crea
   el pedido y se cobra en efectivo en un solo paso.
3. **Given** un cobro fallido, **When** se muestra el resultado, **Then** el folio queda
   `Pendiente` y se ofrece “Reintentar cobro” y “Cancelar pedido”.

### User Story 5 - Tablero de cocina (KDS) (Priority: P2, extensión CFITSH-27)

El cocinero ve pedidos agrupados por estado, con folio grande, tiempo de espera, contadores,
actualización automática y una acción principal de un toque por pedido.

**Independent Test**: `/cocina` agrupa `Pendiente`, `Pagado`, `En preparación` y `Listo`,
mantiene `ESTADOS_ACTIVOS`, `usePedidos({ refetchInterval: 5000 })` y `useCambiarEstado`, y
muestra estados vacío/error/conflicto.

**Acceptance Scenarios**:

1. **Given** pedidos activos, **When** carga el tablero, **Then** cada tarjeta muestra folio,
   artículos, total, espera y el CTA del siguiente estado.
2. **Given** un error de transición, **When** falla el cambio de estado, **Then** se muestra
   el mensaje y la opción de actualizar el tablero.

### User Story 6 - Menú y carrito del cliente (Priority: P2, extensión CFITSH-28)

El cliente explora el menú con búsqueda y categorías, agrega cantidades con stepper, conserva
su carrito al recargar y confirma el pedido con su hora de recolección calculada por el backend.

**Independent Test**: `/menu` muestra buscador, chips y steppers; el carrito persiste en
`localStorage`, se valida contra el menú vigente y se limpia al cerrar sesión o completar el
pedido; `/pedido` confirma y `/mis-pedidos` muestra `fechaRecoleccion`.

**Acceptance Scenarios**:

1. **Given** un platillo disponible, **When** el cliente ajusta su cantidad, **Then** la barra
   flotante muestra cantidad y total y enlaza a `/pedido`.
2. **Given** el carrito con productos, **When** recarga la página, **Then** las cantidades se
   conservan y los productos no disponibles se descartan.
3. **Given** un pedido pagado, **When** se consulta su detalle, **Then** se muestra la hora de
   recolección devuelta por el backend.

### User Story 7 - Panel de administración (Priority: P2, extensión CFITSH-29)

El administrador entra a un panel de inicio con conteos y accesos rápidos, y gestiona
usuarios, platillos y menú con búsqueda, filtros, panel lateral y estados vacío/error.

**Independent Test**: `/admin` muestra el inicio con conteos de usuarios activos, catálogo y
menú publicado; las pantallas existentes conservan sus endpoints y mutaciones.

**Acceptance Scenarios**:

1. **Given** el administrador en `/admin`, **When** entra, **Then** ve accesos rápidos a
   Usuarios, Platillos y Menú del día con conteos.
2. **Given** el catálogo, **When** busca o filtra por categoría, **Then** la lista se filtra
   sin cambiar los datos ni las mutaciones existentes.

### Edge Cases

- Las fuentes de `DESIGN.md` no están disponibles en el dispositivo: debe aplicarse la
  pila de respaldo **sin** bloquear la interfaz ni depender obligatoriamente de la red.
- Definir los radios de `DESIGN.md` cambia también las utilidades de radio existentes:
  el cambio es intencional y no debe romper la apariencia funcional de ningún componente.
- El proyecto es solo modo claro: no se define tema oscuro.
- Coexistencia de clases de color por defecto con los nuevos tokens: ambas deben seguir
  generándose para no romper pantallas aún no migradas.
- Un componente con un color de estado desconocido: debe degradar a un color neutro legible.

## Clarifications

### Session 2026-10-31

- Q: ¿Cómo se implementan los tokens de diseño? → A: Con un bloque `@theme` de Tailwind v4 en `index.css`.
- Q: ¿Qué nomenclatura usan los tokens? → A: Semántica (`--color-primary`, `--font-heading`), no escalas numéricas.
- Q: ¿Se elimina la paleta por defecto? → A: No; se añaden tokens para no romper pantallas aún no migradas.
- Q: ¿Se toca el backend o el router? → A: No; el cambio es solo de presentación.
- Q: ¿Se añaden dependencias npm? → A: No.

### Session 2026-11-02 (extensión CFITSH-25…29)

- Q: ¿Se crea una spec nueva para el rediseño? → A: No; se extiende 007 (CFITSH-25…29).
- Q: ¿Qué navegación se usa? → A: Drawer lateral móvil + panel fijo en escritorio; bottom bar sólo en caja y cliente. Se reutilizan rutas y `ProtectedRoute`.
- Q: ¿Se cambia el backend para la hora de recolección? → A: No; se muestra sólo `fechaRecoleccion` calculada por el backend.
- Q: ¿Cómo persiste el carrito del cliente? → A: Contexto React + `localStorage`, validado contra el menú vigente.
- Q: ¿De dónde sale el KDS de cocina? → A: `Docs/DESIGN.md` + implementación actual, porque `desing/diseño-cocina.md` no existe.
- Q: ¿Se añaden dependencias npm? → A: No.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El frontend MUST definir los tokens de `Docs/DESIGN.md` (colores, tipografía,
  radios y espaciado) como custom properties del sistema de diseño del proyecto.
- **FR-002**: El tema global de la aplicación (fondo, color de texto y tipografía base)
  MUST consumir dichos tokens.
- **FR-003**: Los componentes base compartidos (botón, tarjeta, entrada y etiqueta) MUST
  usar los tokens, conservando sus variantes y su API pública actual.
- **FR-004**: El encabezado del layout por rol MUST usar los tokens de superficie y texto,
  sin alterar su estructura ni sus enlaces de navegación.
- **FR-005**: Las insignias de estado de pedido MUST usar los colores de estado definidos en
  `DESIGN.md`, de forma consistente entre las pantallas de cocina y del cliente.
- **FR-006**: La aplicación MUST seguir siendo responsiva y conservar el área táctil mínima
  de 44 px en caja y cocina.
- **FR-007**: La aplicación MUST NOT incorporar dependencias npm nuevas.
- **FR-008**: La aplicación MUST conservar las rutas existentes, `ProtectedRoute`, la lógica
  de negocio y el backend; sólo puede cambiar la presentación y la navegación visual.
- **FR-009**: Los cuatro layouts por rol MUST usar drawer lateral en móvil y panel fijo en
  escritorio, con bottom bar en caja y cliente.
- **FR-010**: Caja MUST conservar `useCrearMostrador` + `useCobrarPedido` y encadenar
  “Registrar y cobrar”; un cobro fallido MUST dejar el pedido `Pendiente` con reintento sin
  recaptura.
- **FR-011**: Cocina MUST conservar `ESTADOS_ACTIVOS`, el polling de 5 s y `useCambiarEstado`,
  agrupando pedidos por estado y mostrando folio, espera y CTA principal.
- **FR-012**: El menú del cliente MUST ofrecer búsqueda, chips de categoría y stepper; el
  carrito MUST persistir en `localStorage`, validarse contra el menú y limpiarse al cerrar
  sesión o completar el pedido.
- **FR-013**: Las pantallas del cliente MUST mostrar `fechaRecoleccion` cuando el backend la
  devuelva, sin capturar ni enviar una hora propia.
- **FR-014**: `/admin` MUST tener una landing con conteos y accesos rápidos usando sólo los
  endpoints existentes de usuarios, platillos y menú.
- **FR-015**: Los estados vacío, carga, error y reintento MUST ser consistentes en las
  pantallas rediseñadas.
- **FR-016**: La aplicación MUST mantener el área táctil mínima de 44 px y el contraste AA en
  caja y cocina.

### Key Entities *(include if feature involves data)*

- **Token de diseño**: Valor de color, tipografía, radio o espaciado del sistema de diseño,
  expuesto como custom property del proyecto y consumido por utilidades y componentes.
- **Componente base**: Elemento de interfaz compartido (botón, tarjeta, entrada, etiqueta)
  cuya apariencia pasa a usar tokens conservando su API.
- **Insignia de estado**: Indicador visual del estado de un pedido, coloreado con el token
  del estado correspondiente.
- **Carrito del cliente**: Estado de UI con cantidades por `platilloId`, persistido en
  `localStorage` y validado contra el menú vigente; no es una entidad de backend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `typecheck`, `test`, `lint` y `build` del frontend permanecen en verde.
- **SC-002**: El 100 % de los componentes base y del encabezado del layout afectados dejan
  de usar colores por defecto del framework para sus colores principales (0 clases de color
  por defecto en esos archivos).
- **SC-003**: El mismo estado de pedido muestra el mismo color en cocina y en la vista del
  cliente (100 % de coincidencia).
- **SC-004**: Ningún archivo fuera de `frontend/` es modificado por esta funcionalidad.
- **SC-005**: Ninguna dependencia npm nueva se agrega al proyecto.
- **SC-006**: Los cuatro layouts usan drawer en móvil y panel fijo en escritorio; caja y
  cliente muestran bottom bar con contadores cuando aplica.
- **SC-007**: El flujo de caja crea y cobra en un solo paso y permite reintentar un cobro
  fallido sin recrear el pedido.
- **SC-008**: El carrito del cliente sobrevive una recarga y descarta productos no disponibles.
- **SC-009**: `typecheck`, `test`, `lint` y `build` del frontend permanecen en verde con las
  pruebas actualizadas.

## Assumptions

- `Docs/DESIGN.md` es la fuente de verdad de los tokens; no se redefine la identidad visual
  en esta funcionalidad.
- Las fuentes de `DESIGN.md` se declaran con una pila de respaldo del sistema; una fuente web
  es opcional y, si se usa, debe incluir respaldo local para no depender de la conectividad.
- El alcance es solo modo claro y solo presentación: no se cambian vistas de datos, permisos
  ni endpoints.
- La extensión CFITSH-25…29 **sí incluye** navegación drawer/bottom bar y rediseño de las
  pantallas de caja, cocina, cliente y administración, reutilizando rutas y endpoints.
- Siguen **fuera de alcance** (§27): historial de ventas, configuración, métodos de pago con
  tarjeta/transferencia, descuentos, captura de hora de recolección, imágenes de platillo,
  métricas de negocio y notificaciones push.
- `desing/diseño-cocina.md` no existe; el KDS se deriva de `Docs/DESIGN.md` y de la
  implementación actual, documentando la decisión en `research.md`.
- El resto del sistema (sprints 1–5) está implementado y disponible.

## Trazabilidad a spec 001 y al roadmap

- Se apoya en el pulido de UI del Sprint 5 (`Docs/sprints.md`, criterio "pulido de interfaz
  conforme a los tokens de diseño").
- Requisitos de interfaz de la constitución (§II/§19): UI responsiva, área táctil ≥ 44 px,
  alto contraste y navegación simple.
- La extensión no añade FRs funcionales nuevos de la spec maestra: se reutilizan los flujos
  existentes (FR-013/014, FR-016 y FR-026/027 permanecen intactos en comportamiento).
- Trazabilidad de la extensión: US4→FR-009/010, US5→FR-011, US6→FR-012/013,
  US7→FR-014, transversal→FR-015/016 y SC-006…SC-009.
- Fuera de alcance: funcionalidades fuera del MVP y los elementos de `desing/` no listados
  en las User Stories de esta spec.
