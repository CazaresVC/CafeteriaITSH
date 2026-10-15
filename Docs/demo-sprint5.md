# Demostración del MVP — Sprint 5

Guion para demostrar el flujo completo a la patrocinadora:
menú → selección → pedido → pago → cocina → preparación → listo → notificación → recogida.

## Preparación

1. Aplicar migraciones (incluye `004_notificaciones.sql` y el seed de demo `005_seed_demo.sql`):

   ```powershell
   cd backend
   npm run migrate
   ```

2. Levantar backend y frontend:

   ```powershell
   cd backend;  npm run dev        # http://localhost:3000
   cd frontend; npm run dev        # http://localhost:5173
   ```

3. Menú del día: el seed publica el menú para la fecha en que corren las migraciones. Si el
   demo es otro día, entrar como **Admin** → `/admin/menu`, elegir la fecha y pulsar
   **“Republicar menú del día”** (copia el menú más reciente en un clic).

4. Cuentas de demo:

   | Rol | Correo | Contraseña |
   | --- | --- | --- |
   | Cliente | `cliente@cafeitsh.local` | `Cliente1234` |
   | Caja | `cajero@cafeitsh.local` | `Cajero1234` |
   | Cocina | `cocinero@cafeitsh.local` | `Cocinero1234` |
   | Admin | `admin@cafeitsh.local` | `Admin1234` |

   > La sesión usa una cookie `token` compartida por pestañas del mismo navegador. Para mostrar
   > cliente + caja + cocina a la vez, usar ventanas de incógnito distintas.

## Guion

1. **Cliente** (`cliente@cafeitsh.local`): abrir `/menu`, agregar platillos y confirmar el pedido
   en `/pedido`. Elegir hora de recolección ≥ 10 min y pagar en línea en `/pedido/pago`.
   - Esperado: el pedido queda `Pagado`.
2. **Mis pedidos** (`/mis-pedidos`): el cliente ve su pedido en `Pagado`. La lista se refresca
   sola (polling).
3. **Cocina** (`cocinero@cafeitsh.local`): en `/cocina` aparece el pedido pagado. Pulsar
   *Iniciar preparación* → `En preparación`, luego *Marcar listo* → `Listo`.
4. **Notificación**: en la barra del cliente aparece el badge *Avisos* con el aviso
   "Tu pedido está listo para recoger". Al abrir el detalle y pulsar el aviso se marca como visto.
5. **(Opcional) Caja** (`cajero@cafeitsh.local`): capturar un pedido de mostrador en `/caja`
   (platillos, cantidades, cliente opcional) y cobrar en efectivo → `Pagado`.
6. **Recogida**: la cocina pulsa *Marcar entregado* → `Entregado`. El cliente ve el estado final
   en `/mis-pedidos`.

## Puntos a destacar

- El aviso se genera siempre que un pedido llega a `Listo` (evento de dominio, fuera de la ruta
  crítica del pedido).
- Si el canal externo falla, el aviso queda `fallida` y el pedido permanece intacto; el reintento
  (admin) no duplica avisos.
- Un cliente nunca ve pedidos ni avisos de otro cliente (404, sin revelar existencia).

## Verificación automatizada

```powershell
cd backend;  npm test; npm run typecheck; npm run build
cd frontend; npm test; npm run typecheck; npm run lint; npm run build
```

Pruebas críticas en verde: estados, pagos y permisos (`backend/tests/`), y flujo completo
(`backend/tests/flujo.completo.test.ts`).
