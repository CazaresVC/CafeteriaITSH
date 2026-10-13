# Cómo ejecutar los scripts de migración

Scripts SQL para crear y sembrar la base de datos del **Sistema de Pedidos Anticipados — Cafetería ITSH** en MySQL 8.0 o superior.

## Requisitos

- MySQL Server 8.0 o superior instalado y el servicio corriendo.
- Cliente `mysql` en el PATH (o usar la ruta completa, ver abajo).
- Base de datos `cafe_itsh` y usuario `cafe_admin` creados (ver abajo si aún no existen).

## Crear la base de datos y el usuario (una sola vez)

Conéctate como administrador (por ejemplo `root`) y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS cafe_itsh
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cafe_admin'@'localhost' IDENTIFIED BY 'cafeContra';
GRANT ALL PRIVILEGES ON cafe_itsh.* TO 'cafe_admin'@'localhost';
FLUSH PRIVILEGES;
```

## Conexión

Los datos de acceso:

| Dato | Valor |
|------|-------|
| Servidor | `127.0.0.1:3306` |
| Base de datos | `cafe_itsh` |
| Usuario | `cafe_admin` |
| Contraseña | `cafeContra` |
| Charset | `utf8mb4` |

## Ejecutar los scripts (en orden)

Desde la carpeta del proyecto. La forma más segura es redirigir el archivo con `<`, disponible en **CMD**:

```cmd
mysql -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh < migrations\001_crear_esquema.sql
mysql -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh < migrations\002_seed_inicial.sql
```

En **PowerShell** el `<` no existe, así que invoca CMD desde PowerShell (así se preservan los acentos UTF-8 del script):

```powershell
cmd /c "mysql -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh < migrations\001_crear_esquema.sql"
cmd /c "mysql -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh < migrations\002_seed_inicial.sql"
```

> No uses `Get-Content ... | mysql` en PowerShell 5.1: el pipe recodifica el texto y corrompe los acentos (guarda los archivos `.sql` en UTF-8).

**Importante:** ejecutar `001` antes que `002`. El `001` crea las tablas; el `002` inserta los datos base (roles, estados, transiciones, platillos y menú de ejemplo).

Si `mysql` no está en el PATH, usa la ruta completa:

```powershell
cmd /c '"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh < migrations\001_crear_esquema.sql'
```

## Ejecutar desde el cliente interactivo (`mysql>`)

Abre el cliente y usa el comando `source` (o su atajo `\.`) para cargar cada archivo:

```powershell
mysql -u cafe_admin -p -h 127.0.0.1 -P 3306
```

```sql
mysql> use cafe_itsh;
mysql> source C:/cafeITSH/cafeITSH/migrations/001_crear_esquema.sql;
mysql> source C:/cafeITSH/cafeITSH/migrations/002_seed_inicial.sql;
```

Usa `/` en las rutas (también sirve `\\`); evita `\` simple porque el cliente lo interpreta como escape.

## Ejecutar con DBeaver

1. Abre DBeaver y crea una conexión a **MySQL** con los datos de la tabla de arriba.
2. Abre el archivo `migrations/001_crear_esquema.sql` en un editor SQL.
3. Selecciona toda la consulta y ejecuta (Alt+X o botón SQL → Execute SQL script).
4. Repite con `migrations/002_seed_inicial.sql`.

## Verificar que todo quedó bien

```powershell
mysql -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh -e "SHOW TABLES;"
```

Debe mostrar 11 tablas: `estado_pedido`, `menu_dia`, `notificacion`, `pago`, `pedido`, `pedido_detalle`, `pedido_estado_historial`, `platillo`, `rol`, `transicion_estado`, `usuario`.

Ver el menú de ejemplo del día:

```powershell
mysql -u cafe_admin -p -h 127.0.0.1 -P 3306 cafe_itsh -e "SELECT md.fecha, p.nombre, md.precio, md.especial FROM menu_dia md JOIN platillo p ON p.id = md.platillo_id ORDER BY p.nombre;"
```

## Notas

- El `001` usa `CREATE TABLE` normal: si las tablas ya existen, fallará con "Table '...' already exists" (esto es esperado; no re-ejecutes `001` sobre una BD ya poblada sin antes limpiar).
- El `002` usa `INSERT IGNORE`, por lo que es seguro de re-ejecutar: no duplica roles, estados, transiciones ni el menú del día. Nota: `platillo` no tiene clave única por nombre, así que re-ejecutar el `002` puede volver a insertar los platillos de ejemplo; si vas a re-sembrar, limpia antes la tabla `platillo`.
- Los CHECK de MySQL se aplican en 8.0.16 o superior; en versiones anteriores se aceptan pero no se validan.
- El menú de ejemplo se inserta con la fecha actual (`CURRENT_DATE`). Para tener menú en otro día, ejecuta un `INSERT` manual en `menu_dia` con la fecha deseada.
- Se recomienda usar siempre **`cafe_admin`** para el trabajo diario del proyecto y reservar el usuario `root` solo para tareas administrativas.
