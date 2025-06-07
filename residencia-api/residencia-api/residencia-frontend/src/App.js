import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import Register from './components/auth/Register';

// Contexto de autenticación
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Páginas de autenticación
import { Login, ChangePassword, Profile } from './components/auth';

// Páginas del Dashboard
import Dashboard from './pages/Dashboard';

// Páginas de residentes
import { ResidentesList, ResidenteDetail, ResidenteForm } from './pages/residentes';

// Páginas de personal
import { PersonalList, PersonalDetail, PersonalForm } from './pages/personal';

// Páginas de medicamentos
import { MedicamentosList, MedicamentoDetail, MedicamentoForm } from './pages/medicamentos';

// Páginas de habitaciones
import { HabitacionesList, HabitacionesDetail, HabitacionesForm } from './pages/habitaciones';

// Importar nuevos componentes
import { ActividadesList, ActividadesForm, ActividadesDetail } from './pages/actividades';

import { VisitasList, VisitasDetail, VisitasForm } from './pages/visitas';

import { DietasList, DietasDetail, DietasForm } from './pages/dietas';

import { IncidenciasList, IncidenciasDetail,IncidenciasForm } from './pages/incidencias';

import { TratamientosList, TratamientosForm, TratamientosDetail } from './pages/tratamientos';



// Crear tema de Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return null;
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rutas específicas de rol
const RoleRoute = ({ children, roles }) => {
  const { hasRole, loading } = useAuth();

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return null;
  }

  // Verificar si el usuario tiene el rol necesario
  if (!hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal de la aplicación
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Perfil y cambio de contraseña */}
                <Route path="profile" element={<Profile />} />
                <Route path="change-password" element={<ChangePassword />} />
                
                {/* Residentes */}
                <Route path="residentes">
                  <Route index element={<ResidentesList />} />
                  <Route path=":id" element={<ResidenteDetail />} />
                  <Route path="new" element={
                    <RoleRoute roles={['Administrador', 'Medico']}>
                      <ResidenteForm />
                    </RoleRoute>
                  } />
                  <Route path="edit/:id" element={
                    <RoleRoute roles={['Administrador', 'Medico']}>
                      <ResidenteForm />
                    </RoleRoute>
                  } />
                </Route>
                
                {/* Personal */}
                <Route path="personal">
                  <Route index element={
                    <RoleRoute roles={['Administrador']}>
                      <PersonalList />
                    </RoleRoute>
                  } />
                  <Route path=":id" element={
                    <RoleRoute roles={['Administrador']}>
                      <PersonalDetail />
                    </RoleRoute>
                  } />
                  <Route path="new" element={
                    <RoleRoute roles={['Administrador']}>
                      <PersonalForm />
                    </RoleRoute>
                  } />
                  <Route path="edit/:id" element={
                    <RoleRoute roles={['Administrador']}>
                      <PersonalForm />
                    </RoleRoute>
                  } />
                </Route>
                
                {/* Medicamentos */}
                <Route path="medicamentos">
                  <Route index element={
                    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero']}>
                      <MedicamentosList />
                    </RoleRoute>
                  } />
                  <Route path=":id" element={
                    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero']}>
                      <MedicamentoDetail />
                    </RoleRoute>
                  } />
                  <Route path="new" element={
                    <RoleRoute roles={['Administrador', 'Medico']}>
                      <MedicamentoForm />
                    </RoleRoute>
                  } />
                  <Route path="edit/:id" element={
                    <RoleRoute roles={['Administrador', 'Medico']}>
                      <MedicamentoForm />
                    </RoleRoute>
                  } />
                </Route>
                
                {/* Habitaciones */}
                <Route path="habitaciones">
                  <Route index element={
                    <RoleRoute roles={['Administrador', 'Recepcion']}>
                      <HabitacionesList />
                    </RoleRoute>
                  } />
                  <Route path=":id" element={
                    <RoleRoute roles={['Administrador', 'Recepcion']}>
                      <HabitacionesDetail />
                    </RoleRoute>
                  } />
                  <Route path="new" element={
                    <RoleRoute roles={['Administrador']}>
                      <HabitacionesForm />
                    </RoleRoute>
                  } />
                  <Route path="edit/:id" element={
                    <RoleRoute roles={['Administrador']}>
                      <HabitacionesForm />
                    </RoleRoute>
                  } />
                </Route>
                
                {/* Tratamientos */}
                {/* Tratamientos */}
<Route path="tratamientos">
  <Route index element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero']}>
      <TratamientosList />
    </RoleRoute>
  } />
  <Route path="new" element={
    <RoleRoute roles={['Administrador', 'Medico']}>
      <TratamientosForm />
    </RoleRoute>
  } />
  <Route path="edit/:id" element={
    <RoleRoute roles={['Administrador', 'Medico']}>
      <TratamientosForm />
    </RoleRoute>
  } />
  <Route path=":id" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero']}>
      <TratamientosDetail />
    </RoleRoute>
  } />
</Route>


                {/* Actividades */}
                <Route path="actividades">
  <Route index element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero', 'Auxiliar']}>
      <ActividadesList />
    </RoleRoute>
  } />
  <Route path="new" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero']}>
      <ActividadesForm />
    </RoleRoute>
  } />
  <Route path="edit/:id" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero']}>
      <ActividadesForm />
    </RoleRoute>
  } />
  <Route path=":id" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero', 'Auxiliar']}>
      <ActividadesDetail />
    </RoleRoute>
  } />
</Route>


                {/* Dietas */}
                <Route path="dietas">
  <Route index element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero', 'Nutricionista']}>
      <DietasList />
    </RoleRoute>
  } />
  <Route path="new" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Nutricionista']}>
      <DietasForm />
    </RoleRoute>
  } />
  <Route path="edit/:id" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Nutricionista']}>
      <DietasForm />
    </RoleRoute>
  } />
  <Route path=":id" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero', 'Nutricionista']}>
      <DietasDetail />
    </RoleRoute>
  } />
</Route>


                {/* Visitas */}
                <Route path="visitas">
  <Route index element={
    <RoleRoute roles={['Administrador', 'Recepcion', 'Auxiliar']}>
      <VisitasList />
    </RoleRoute>
  } />
  <Route path="new" element={
    <RoleRoute roles={['Administrador', 'Recepcion']}>
      <VisitasForm />
    </RoleRoute>
  } />
  <Route path="edit/:id" element={
    <RoleRoute roles={['Administrador', 'Recepcion']}>
      <VisitasForm />
    </RoleRoute>
  } />
  <Route path=":id" element={
    <RoleRoute roles={['Administrador', 'Recepcion', 'Auxiliar']}>
      <VisitasDetail />
    </RoleRoute>
  } />
</Route>


                {/* Incidencias */}
                <Route path="incidencias">
  <Route index element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero', 'Auxiliar']}>
      <IncidenciasList />
    </RoleRoute>
  } />
  <Route path="new" element={
    <RoleRoute roles={['Administrador', 'Enfermero', 'Auxiliar']}>
      <IncidenciasForm />
    </RoleRoute>
  } />
  <Route path="edit/:id" element={
    <RoleRoute roles={['Administrador', 'Enfermero', 'Auxiliar']}>
      <IncidenciasForm />
    </RoleRoute>
  } />
  <Route path=":id" element={
    <RoleRoute roles={['Administrador', 'Medico', 'Enfermero', 'Auxiliar']}>
      <IncidenciasDetail />
    </RoleRoute>
  } />
</Route>

              </Route>
              
              {/* Ruta de fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;