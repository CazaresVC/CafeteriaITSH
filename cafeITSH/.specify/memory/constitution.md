<!--
Sync Impact Report
==================
Version change: (unratified template) → 1.0.0
Rationale: Initial ratification from Docs/reglas .md (Sistema de Pedidos Anticipados — Cafetería ITSH).

Modified principles:
  - [PRINCIPLE_1_NAME] → I. TypeScript Estricto de Extremo a Extremo
  - [PRINCIPLE_2_NAME] → II. Aplicación Web Única Organizada por Roles
  - [PRINCIPLE_3_NAME] → III. API REST sobre Express con Estructura Simple
  - [PRINCIPLE_4_NAME] → IV. MySQL 8.0+ como Fuente de Verdad Relacional
  - [PRINCIPLE_5_NAME] → V. Seguridad: Autenticación JWT y Autorización por Roles (NON-NEGOTIABLE)

Added principles:
  - VI. Flujo de Pedidos Anticipados y de Mostrador
  - VII. Validación, Manejo de Errores y Gestión de Secretos
  - VIII. Testing con Vitest y Simplicidad del MVP

Added sections:
  - Restricciones Técnicas y de Alcance (SECTION_2)
  - Flujo de Desarrollo y Calidad (SECTION_3)

Removed sections: none

Follow-up TODOs: none (ratification date set from context; adjust if the sponsor requires a different date).
-->

# Cafetería ITSH — Sistema de Pedidos Anticipados Constitution

## Core Principles

### I. TypeScript Estricto de Extremo a Extremo

El proyecto MUST usar **TypeScript** como lenguaje principal tanto en frontend como en
backend, sobre **Node.js en versión LTS**. El tipado estático MUST mantenerse siempre que
sea posible y el JavaScript sin tipado MUST evitarse en la lógica principal del sistema.

**Rationale**: Un único lenguaje tipado reduce errores en tiempo de compilación, facilita el
mantenimiento y evita divergencias entre capas del sistema.

### II. Aplicación Web Única Organizada por Roles

El frontend MUST ser **una sola aplicación web** en **React + TypeScript compilada con Vite**,
organizada en rutas por rol: `/admin`, `/caja`, `/cocina`, `/menu` y `/mis-pedidos`. Toda ruta
MUST estar **protegida por JWT y rol**: exige sesión activa y el rol correspondiente, y un
usuario sin el rol MUST NOT poder acceder. La interfaz MUST usar **Tailwind CSS + shadcn/ui**
personalizado con los tokens del proyecto, MUST ser responsiva, y las pantallas de caja y
cocina MUST usar botones de alto contraste con área táctil de al menos **44 px**.

**Rationale**: Concentrar todas las interfaces en una sola aplicación simplifica el despliegue
del MVP; la protección por rol garantiza que cada actor acceda solo a su módulo.

### III. API REST sobre Express con Estructura Simple

La comunicación entre frontend y backend MUST realizarse mediante una **API REST** construida
con **Node.js + Express**. La API MUST usar los métodos HTTP según su propósito (`GET`
consultas, `POST` creación, `PUT`/`PATCH` modificación, `DELETE` eliminación) y responder con
**códigos HTTP apropiados**. La estructura MUST ser sencilla y organizada por funcionalidad
(`routes/`, `controllers/`, `services/`, `middlewares/`, `utils/`). Arquitecturas
excesivamente complejas o capas innecesarias MUST evitarse.

**Rationale**: Una API REST simple y predecible es suficiente para el tamaño del proyecto y
minimiza el costo de mantenimiento.

### IV. MySQL 8.0+ como Fuente de Verdad Relacional

La persistencia MUST usar **MySQL 8.0+**. El esquema MUST almacenar como mínimo: usuarios,
roles, platillos, menú, pedidos, detalles de pedidos, pagos y estados de pedidos, con
**relaciones entre entidades** que preserven la integridad de los datos. Las consultas MUST
realizarse mediante una librería de acceso a datos adecuada; **ORM innecesarios** MUST NOT
incorporarse.

**Rationale**: Las relaciones relacionales reflejan fielmente el dominio de pedidos y menú y
protegen la integridad de los datos sin añadir abstracciones no justificadas.

### V. Seguridad: Autenticación JWT y Autorización por Roles (NON-NEGOTIABLE)

La autenticación MUST realizarse con **correo electrónico y contraseña** y las sesiones MUST
gestionarse con **JSON Web Tokens (JWT)**. La autorización MUST ser **basada en roles**, de
modo que cada usuario acceda únicamente a las funciones de su rol. Las contraseñas MUST NOT
almacenarse en texto plano y las credenciales y claves secretas MUST NOT existir en el código
fuente (MUST residir en variables de entorno). En producción MUST usarse HTTPS y
**información sensible de tarjetas bancarias MUST NOT almacenarse**.

**Rationale**: Estos controles son requisitos de seguridad no negociables; su incumplimiento
expone cuentas, cobros y datos de usuarios.

### VI. Flujo de Pedidos Anticipados y de Mostrador

El sistema MUST permitir pedidos anticipados realizados con al menos **10 minutos de
anticipación**, y MUST permitir operar simultáneamente pedidos anticipados y pedidos de
mostrador sin interrumpir el servicio actual. Cada pedido MUST mantener un estado que refleje
su progreso, con los estados mínimos: `Pendiente`, `Pagado`, `En preparación`, `Listo`,
`Entregado`, `Cancelado`. El sistema MUST evitar errores derivados de la interpretación verbal
de los pedidos y MUST notificar al cliente cuando su pedido esté listo. La funcionalidad de
notificaciones MUST mantenerse separada de la lógica principal de pedidos.

**Rationale**: El objetivo central del proyecto es reducir el tiempo de espera en caja y los
errores de comunicación verbal, por lo que la anticipación y el estado trazable son clave.

### VII. Validación, Manejo de Errores y Gestión de Secretos

Los datos MUST validarse tanto en frontend como en backend, y MUST NOT confiarse únicamente en
las validaciones del cliente; los datos MUST validarse antes de almacenarse. Los **stack
traces** y la información interna del servidor MUST NOT mostrarse al usuario: las respuestas
MUST usar mensajes claros y códigos HTTP apropiados, registrando los errores necesarios para
mantenimiento sin exponer información sensible. Las configuraciones sensibles MUST gestionarse
mediante variables de entorno (como mínimo `DATABASE_URL`, `JWT_SECRET`, `PAYMENT_API_KEY`,
`NOTIFICATION_API_KEY`, `NODE_ENV`, `PORT`) y sus valores reales MUST NOT incluirse en el código
fuente.

**Rationale**: La validación defensiva y el manejo seguro de errores protegen datos e
infraestructura, y la separación de secretos permite desplegar el MVP de forma segura.

### VIII. Testing con Vitest y Simplicidad del MVP

Las pruebas unitarias MUST usar **Vitest**. Toda lógica de negocio importante MUST contar con
pruebas, cubriendo como mínimo: autenticación, autorización, gestión de usuarios, gestión del
menú, creación y validación de pedidos, cálculo de totales, cambios de estado y control de
permisos por rol. No se fija una cobertura mínima obligatoria, pero las funcionalidades
críticas MUST estar cubiertas. Las dependencias innecesarias MUST evitarse: antes de incorporar
una librería se MUST verificar si la funcionalidad puede resolverse con las herramientas
existentes. El desarrollo MUST mantenerse dentro del alcance del MVP y las funcionalidades
fuera de alcance MUST NOT agregarse sin aprobación previa.

**Rationale**: Probar la lógica crítica y evitar dependencias o funcionalidades superfluas
mantiene el sistema sostenible y viable dentro del presupuesto académico.

## Restricciones Técnicas y de Alcance

- **Stack**: TypeScript + Node.js LTS; frontend React + Vite; backend Express; base de datos
  MySQL 8.0+; diseño Tailwind CSS + shadcn/ui; pruebas con Vitest. Los tokens de diseño de
  `.stitch/DESIGN.md` son una base de referencia, no un requisito al 100 %.
- **Estructura del proyecto**: `frontend/`, `backend/`, `database/`, `tests/`. El frontend se
  organiza en `src/pages/admin/`, `src/pages/caja/`, `src/pages/cocina/`,
  `src/pages/clientes/`, `src/components/ui/` y `src/lib/`.
- **Roles**: Administrador (usuarios, menú, platillos, especiales, precios), Cajero (pedidos
  presenciales y cobros), Cocinero (visualizar pedidos, actualizar estado a preparado/listo),
  Alumno/Docente (consultar menú, pedidos y pagos anticipados, estado y notificaciones).
- **Alcance del MVP**: gestión de usuarios y roles, gestión y consulta del menú, gestión de
  platillos, pedidos anticipados y de mostrador, pago anticipado, visualización en cocina,
  actualización de estados y notificaciones de pedido listo.
- **Objetivos de rendimiento**: reducir el tiempo de espera en caja al menos 50 % durante los
  recesos; permitir que el 100 % de los pedidos anticipados se realicen con al menos 10 min de
  anticipación; reducir errores por comunicación verbal.
- **Despliegue**: ejecutable localmente en desarrollo y desplegable en hosting gratuito o de
  bajo costo, manteniendo separadas las configuraciones de desarrollo y producción.

## Flujo de Desarrollo y Calidad

- **Control de versiones**: usar Git con repositorio remoto; commits pequeños y descriptivos.
  Los archivos `.env` y cualquier credencial o clave secreta MUST NOT almacenarse en el
  repositorio.
- **Estilo de código**: `camelCase` para variables y funciones, `PascalCase` para componentes,
  tipos e interfaces; nombres descriptivos; funciones pequeñas y reutilizables; sin código
  duplicado; responsabilidades claras entre módulos; TypeScript estrictamente tipado.
- **Interfaz de usuario**: navegación sencilla e intuitiva; operaciones de caja y cocina con la
  menor cantidad de pasos posible; información de menú, pedidos y estados clara; evitar
  elementos visuales innecesarios; priorizar legibilidad en horas de mayor demanda.
- **Criterio de aceptación**: el sistema se considera funcional cuando completa el flujo de
  consulta de menú → selección → creación del pedido → pago → recepción en cocina → preparación
  → pedido listo → notificación → recogida/entrega. La aceptación final está sujeta a una
  demostración funcional y a la validación de la patrocinadora del proyecto.
- **Principio general**: toda decisión de desarrollo MUST priorizar, en orden: cumplimiento del
  alcance, seguridad de la información, facilidad de uso, mantenibilidad, rendimiento en horas
  de mayor demanda, simplicidad de implementación y viabilidad económica del MVP.

## Governance

- Esta constitución supersede cualquier otra práctica del proyecto. Todas las decisiones y
  revisiones de código MUST verificar su cumplimiento.
- Las enmiendas MUST documentarse (qué principio cambia y por qué), aprobarse por los
  responsables del proyecto y aplicarse con un plan de migración cuando corresponda.
- El versionado sigue SemVer: MAJOR ante eliminaciones o redefiniciones incompatibles de
  principios; MINOR ante nuevos principios o secciones o guías materialmente ampliadas; PATCH
  ante aclaraciones, correcciones de redacción o refinamientos no semánticos.
- Cada cambio MUST actualizar la fecha de "Last Amended". Toda complejidad añadida MUST
  justificarse respecto a los principios y al alcance del MVP.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
