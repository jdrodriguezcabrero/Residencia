# Gestión de Residencia de Ancianos

Proyecto completo de gestión para una residencia de ancianos, compuesto por un backend en Node.js y un frontend en React. Esta aplicación permite el control integral de usuarios, residentes, trabajadores, medicación, incidencias, habitaciones y más, con diseño responsive y acceso restringido según el rol del usuario.

## Índice

- [Gestión de Residencia de Ancianos](#gestión-de-residencia-de-ancianos)
  - [Índice](#índice)
  - [Creación de la base de datos](#creación-de-la-base-de-datos)
  - [Instalación del backend](#instalación-del-backend)
  - [Configuración del archivo .env](#configuración-del-archivo-env)
  - [Puesta en marcha del backend](#puesta-en-marcha-del-backend)
  - [Instalación del frontend](#instalación-del-frontend)
  - [Puesta en marcha del frontend](#puesta-en-marcha-del-frontend)
  - [Funcionalidades](#funcionalidades)
    - [Inicio de sesión](#inicio-de-sesión)
    - [Seguridad y Middleware](#seguridad-y-middleware)
    - [Gestión de residentes](#gestión-de-residentes)
    - [Gestión de trabajadores](#gestión-de-trabajadores)
    - [Gestión de medicación](#gestión-de-medicación)
    - [Gestión de habitaciones](#gestión-de-habitaciones)
    - [Gestión de incidencias](#gestión-de-incidencias)
    - [Informes y estadísticas](#informes-y-estadísticas)
    - [Gestión de usuarios](#gestión-de-usuarios)
  - [Características especiales](#características-especiales)
  - [Configuración y prueba del correo electrónico](#configuración-y-prueba-del-correo-electrónico)
    - [Cambiar proveedor de correo](#cambiar-proveedor-de-correo)
      - [Ethereal](#ethereal)
      - [Mailtrap](#mailtrap)
    - [Probar el envío de correos](#probar-el-envío-de-correos)
      - [🔧 Pruebas manuales](#-pruebas-manuales)
      - [✉️ Visualizar los correos](#️-visualizar-los-correos)
  - [API REST - Principales Rutas](#api-rest---principales-rutas)
  - [Autoría](#autoría)



---

## Creación de la base de datos

1. Dentro del proyecto, encontrarás el archivo `.bak` en:
   ```
   residencia-api/residencia-api/base-datos/ResidenciaAncianos.bak
   ```

2. Restaura esta base de datos en tu servidor SQL Server utilizando SQL Server Management Studio (SSMS):

   - Abre SSMS y conéctate a tu instancia de SQL Server.
   - Haz clic derecho en "Bases de datos" > "Restaurar base de datos".
   - Selecciona "Dispositivo" y carga el archivo `.bak`.
   - Ajusta rutas y nombres lógicos si es necesario.
   - Finaliza el proceso y asegúrate de que la base esté activa.

---

## Instalación del backend

1. Abre una terminal y dirígete a la carpeta del backend:

   ```bash
   cd residencia-api/residencia-api
   ```

2. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

3. Configura la conexión a la base de datos. El archivo de configuración se encuentra en:

   ```
   src/config/db.js
   ```

   Asegúrate de que los datos de conexión estén correctamente configurados (host, usuario, contraseña, nombre de la base de datos).

---
## Configuración del archivo .env

Crea un archivo llamado `.env` en la ruta `residencia-api/residencia-api` con el siguiente contenido:

```env
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_basedatos
PORT=3000
JWT_SECRET=clave_secreta

EMAIL_PROVIDER=ethereal
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=correo@ethereal.email
SMTP_PASS=contraseña
```

Este archivo es necesario para el correcto funcionamiento del backend y **no está incluido en el repositorio** por motivos de seguridad.


## Puesta en marcha del backend

1. Accede a la carpeta `src`:

   ```bash
   cd src
   ```

2. Inicia el servidor con:

   ```bash
   node index.js
   ```

   El backend quedará a la escucha para gestionar las peticiones REST, autenticaciones y tareas programadas.

---

## Instalación del frontend

1. Abre una neuva terminal y accede al directorio del frontend:

   ```bash
   cd residencia-frontend
   ```

2. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

---

## Puesta en marcha del frontend

1. Ejecuta el entorno de desarrollo con:

   ```bash
   npm start
   ```

   La aplicación abrirá automáticamente en tu navegador en `http://localhost:3000`.

---

## Funcionalidades

###  Inicio de sesión
- Autenticación con usuario y contraseña.
- Acceso personalizado según el rol: administrador, sanitario, cuidador, etc.

### Seguridad y Middleware

- Se protege cada ruta con middleware de autorización JWT (`auth.middleware.js`).
- Se controla el acceso por rol (`admin`, `sanitario`, etc.) directamente desde el middleware.
- Las rutas sensibles están restringidas a usuarios autorizados.

###  Gestión de residentes
- Listado completo con filtros y paginación.
- Añadir, editar o eliminar residentes.
- Cambio de habitación.
- Visualización de historial y estado médico.

###  Gestión de trabajadores
- Alta, edición y baja de trabajadores.
- Asignación de roles y permisos.
- Información personal y profesional.

###  Gestión de medicación
- Registro detallado por residente.
- Añadir nuevas medicaciones.
- Marcar como suministradas.
- Reposiciones automáticas mediante tareas programadas.

###  Gestión de habitaciones
- Visualización de disponibilidad.
- Asignación y cambio de residentes.

###  Gestión de incidencias
- Registro de incidencias médicas y administrativas.
- Cambiar el estado (pendiente, resuelta).
- Seguimiento cronológico.

###  Informes y estadísticas
- Dashboard visual con gráficas (Chart.js).
- Comparativas mensuales y por categorías.

###  Gestión de usuarios
- Alta y edición de cuentas.
- Control de acceso y permisos.
- Visualización del perfil propio.

---

## Características especiales

- **Diseño responsive**: la aplicación se adapta perfectamente a dispositivos móviles, tablets y escritorio.
- **Autenticación segura**: mediante tokens JWT.
- **Roles diferenciados**: cada usuario solo accede a lo que necesita.
- **Validación de formularios**: robusta, con Formik y Yup.
- **Tareas programadas con cron**:
  - Envío diario de correos con el resumen de medicación a suministrar.
  - Control de stock y avisos automáticos de reposición.
- **Notificaciones por email**: integración de envío automático de emails informativos y de aviso.
- **Dashboard visual y moderno**: uso de Chart.js para representar datos de forma clara.
- **Gestión orgánica**: cada módulo permite agregar, editar, eliminar, filtrar y buscar fácilmente.

---

## Configuración y prueba del correo electrónico

Este proyecto permite alternar entre dos proveedores de email para pruebas de desarrollo: **Mailtrap** y **Ethereal**.

### Cambiar proveedor de correo

Edita el archivo `.env` en la raíz del backend (`residencia-api/residencia-api/residencia-api/.env`) y cambia el valor de `EMAIL_PROVIDER`:

- Para usar **Ethereal**:
  ```env
  EMAIL_PROVIDER=ethereal
  ```

- Para usar **Mailtrap**:
  ```env
  EMAIL_PROVIDER=mailtrap
  ```

Asegúrate de tener configuradas las credenciales correspondientes:

#### Ethereal
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=tu_usuario@ethereal.email
SMTP_PASS=tu_contraseña
```

#### Mailtrap
```env
MAILTRAP_USER=tu_usuario_mailtrap
MAILTRAP_PASS=tu_contraseña_mailtrap
```

---

### Probar el envío de correos

El backend incluye tareas programadas (`cron`) para enviar automáticamente correos electrónicos:

- **Verificación de stock**: se ejecuta cada día a las 06:00 AM.
- **Resumen diario de medicación**: también a las 06:00 AM.

Ambas tareas están definidas en `src/index.js` y se ejecutan automáticamente si el servidor está en marcha.

---

#### 🔧 Pruebas manuales

Puedes forzar la ejecución manual desde el navegador o Postman accediendo a las siguientes rutas locales:

- **Verificación de stock**  
  [`http://localhost:3001/api/notificaciones/verificar-stock`](http://localhost:3001/api/notificaciones/verificar-stock)

- **Resumen diario de medicamentos**  
  [`http://localhost:3001/api/notificaciones/resumen-medicamentos`](http://localhost:3001/api/notificaciones/resumen-medicamentos)

---

#### ✉️ Visualizar los correos

- Si estás usando **Ethereal**, al ejecutar cualquiera de esas rutas, se generará un **enlace de vista previa** que aparecerá en la consola del backend. Solo cópialo y pégalo en tu navegador.
- Si estás usando **Mailtrap**, los correos aparecerán automáticamente en tu bandeja de pruebas en [https://mailtrap.io](https://mailtrap.io).




## API REST - Principales Rutas

| Recurso         | Ruta base            | Controlador                       |
|-----------------|----------------------|-----------------------------------|
| Autenticación   | `/api/auth`          | `auth.controller.js`              |
| Residentes      | `/api/residentes`    | `residentes.controller.js`        |
| Habitaciones    | `/api/habitaciones`  | `habitaciones.controller.js`      |
| Medicamentos    | `/api/medicamentos`  | `medicamentos.controller.js`      |
| Tratamientos    | `/api/tratamientos`  | `tratamientos.controller.js`      |
| Personal        | `/api/personal`      | `personal.controller.js`          |
| Incidencias     | `/api/incidencias`   | `incidencias.controller.js`       |
| Dietas          | `/api/dietas`        | `dietas.controller.js`            |
| Actividades     | `/api/actividades`   | `actividades.controller.js`       |
| Visitas         | `/api/visitas`       | `visitas.controller.js`           |
| Notificaciones  | `/api/notificaciones`| `notificacionesController.js`     |

## Autoría

**Juan Diego Rodríguez Cabrero**  
📧 jdrodriguezcabrero@hotmail.com