#  Sistema de Gestión de Residencia de Ancianos

Este proyecto es una solución integral para la gestión de una residencia de ancianos. Incluye un **backend en Node.js con Express** y un **frontend en React**, permitiendo gestionar residentes, personal, visitas, dietas, medicamentos, tratamientos, habitaciones, actividades y más.

---

##  Índice

- [Sistema de Gestión de Residencia de Ancianos](#sistema-de-gestión-de-residencia-de-ancianos)
  - [Índice](#índice)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
    - [Backend:](#backend)
    - [Frontend:](#frontend)
  - [Instalación y Ejecución](#instalación-y-ejecución)
    - [1. Clona el Repositorio](#1-clona-el-repositorio)
    - [2. Configuración del Backend](#2-configuración-del-backend)
    - [3. Configuración del Frontend](#3-configuración-del-frontend)
  - [Autenticación](#autenticación)
  - [Notificaciones Automáticas](#notificaciones-automáticas)
  - [Funcionalidades](#funcionalidades)
    - [Backend:](#backend-1)
    - [Frontend:](#frontend-1)
  - [Navegación del Frontend](#navegación-del-frontend)
  - [Gestión de Roles y Permisos](#gestión-de-roles-y-permisos)
  - [Endpoints Principales (API REST)](#endpoints-principales-api-rest)
  - [Licencia](#licencia)
  - [Autor](#autor)

---

##  Estructura del Proyecto

```
residencia-api/
├── src/                       # Backend
│   ├── config/                # Configuración de base de datos
│   ├── controllers/           # Lógica de negocio
│   ├── middleware/            # Middleware (e.g. autenticación)
│   ├── models/                # Modelos de datos (limitado)
│   ├── routes/                # Endpoints organizados por módulo
│   └── index.js               # Punto de entrada principal
├── residencia-frontend/       # Aplicación React
│   ├── public/                # Archivos estáticos
│   └── src/                   # Componentes, páginas, servicios y estilos
├── .env                       # Variables de entorno del backend
└── README.md                  # Documentación del proyecto
```

---

##  Tecnologías Utilizadas

### Backend:
- **Node.js**, **Express**
- **Microsoft SQL Server** (vía `mssql`)
- **JWT** (autenticación)
- **Nodemailer** (notificaciones por correo)
- **node-cron** (tareas automatizadas)
- **dotenv**, **morgan**, **body-parser**, **cors**

### Frontend:
- **React** + **React Router DOM**
- **Context API** para autenticación
- **Axios** para consumo de la API
- **Bootstrap** y estilos personalizados

---

##  Instalación y Ejecución

### 1. Clona el Repositorio

```bash
git clone https://github.com/tu_usuario/residencia-api.git
cd residencia-api
```

### 2. Configuración del Backend

```bash
cd residencia-api
npm install
```

Crea un archivo `.env` con la siguiente estructura:

```env
PORT=3001
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_SERVER=localhost
DB_DATABASE=Residencia
JWT_SECRET=clave_secreta
MAILTRAP_USER=usuario_mailtrap
MAILTRAP_PASS=clave_mailtrap
```

Inicia el backend:

```bash
node src/index.js
```

### 3. Configuración del Frontend

```bash
cd residencia-frontend
npm install
npm start
```

Esto abrirá la app React en `http://localhost:3000`.

---

##  Autenticación

El sistema usa **JSON Web Tokens (JWT)**. Al iniciar sesión, se genera un token que se almacena en el frontend y se incluye en todas las peticiones protegidas al backend. Hay rutas protegidas por middleware en el backend que validan este token.

---

##  Notificaciones Automáticas

- Envío diario de **resumen de medicamentos**.
- Alerta por **stock bajo** de medicamentos.

Estas tareas están definidas en `src/controllers/notificacionesController.js` y programadas con **node-cron** en `src/index.js`.

---

##  Funcionalidades

### Backend:
- API RESTful completa para:
  - Autenticación de usuarios
  - Residentes
  - Personal
  - Medicamentos y tratamientos
  - Habitaciones
  - Dietas
  - Actividades
  - Visitas
  - Incidencias
- Autenticación vía JWT
- Middleware de autorización
- Conexión segura a base de datos SQL Server

### Frontend:
- Aplicación React con interfaz moderna
- Login y registro de usuarios
- Vistas protegidas para usuarios autenticados
- Formularios para crear, editar y listar entidades
- Visualización de información de residentes, actividades, visitas, etc.
- Gestión de incidencias y administración general

---

##  Navegación del Frontend

La aplicación React incluye las siguientes vistas accesibles desde el menú principal (tras iniciar sesión):

- **Dashboard**: vista general del estado del centro  
- **Residentes**: listado, edición, detalle, cambio de habitación  
- **Personal**: gestión de empleados  
- **Tratamientos y Medicamentos**: administración médica  
- **Actividades y Dietas**: programación y seguimiento  
- **Visitas**: control de entradas/salidas familiares  
- **Incidencias**: gestión de problemas internos

---

##  Gestión de Roles y Permisos

El sistema cuenta con un sistema de roles ya implementado. Según el tipo de cuenta con la que se accede, la interfaz y el backend adaptan la funcionalidad y visibilidad de datos:

- **Administrador**: acceso total a todas las entidades y operaciones.  
- **Sanitario**: acceso a módulos médicos (residentes, medicamentos, tratamientos, dietas).  
- **Asistencial**: acceso restringido a información de residentes y actividades.  
- **Recepción o Visitas**: acceso al registro de entradas/salidas e incidencias.  

Este control se aplica tanto en el frontend (navegación y visibilidad) como en el backend (validación por middleware o lógica de controladores).

---

##  Endpoints Principales (API REST)

- `POST /api/auth/login` – Inicio de sesión  
- `POST /api/auth/register` – Registro de usuario  
- `GET /api/residentes` – Listado de residentes  
- `GET /api/medicamentos` – Control de stock  
- `GET /api/visitas` – Registro de visitas  
- `POST /api/incidencias` – Reporte de incidencias  
- `GET /api/dietas` – Planes de comida  
- `GET /api/actividades` – Actividades programadas  
- `GET /api/personal` – Gestión del personal  
- `GET /api/habitaciones` – Habitaciones disponibles  

---

##  Licencia

Este proyecto está bajo la licencia ISC. Puedes adaptarla según tus necesidades en el archivo `package.json`.

---

##  Autor

Este sistema ha sido desarrollado por **Juan Diego Rodríguez Cabrero**.  
 Contacto: [jdrodriguezcabrero@hotmail.com](mailto:jdrodriguezcabrero@hotmail.com)

---
