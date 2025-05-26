import { ListItemButton } from '@mui/material';
import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/components/layout/MainLayout.js (modificado)
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Healing as HealingIcon,
  Bed as BedIcon,
  Event as EventIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Report as ReportIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  VpnKey as PasswordIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  // Función para manejar el menú de usuario
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  // Definir los elementos del menú con control de acceso basado en roles
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <HomeIcon />,
      path: '/dashboard',
      roles: ['Administrador', 'Medico', 'Enfermero', 'Auxiliar', 'Recepcion']
    },
    {
      text: 'Residentes',
      icon: <PersonIcon />,
      path: '/residentes',
      roles: ['Administrador', 'Medico', 'Enfermero', 'Auxiliar', 'Recepcion']
    },
    {
      text: 'Personal',
      icon: <PeopleIcon />,
      path: '/personal',
      roles: ['Administrador']
    },
    {
      text: 'Medicamentos',
      icon: <HealingIcon />,
      path: '/medicamentos',
      roles: ['Administrador', 'Medico', 'Enfermero']
    },
    {
      text: 'Tratamientos',
      icon: <HealingIcon />,
      path: '/tratamientos',
      roles: ['Administrador', 'Medico', 'Enfermero']
    },
    {
      text: 'Habitaciones',
      icon: <BedIcon />,
      path: '/habitaciones',
      roles: ['Administrador', 'Recepcion']
    },
    {
      text: 'Actividades',
      icon: <EventIcon />,
      path: '/actividades',
      roles: ['Administrador', 'Enfermero', 'Auxiliar']
    },
    {
      text: 'Dietas',
      icon: <RestaurantIcon />,
      path: '/dietas',
      roles: ['Administrador', 'Medico', 'Enfermero']
    },
    {
      text: 'Visitas',
      icon: <PeopleIcon />,
      path: '/visitas',
      roles: ['Administrador', 'Recepcion']
    },
    {
      text: 'Incidencias',
      icon: <ReportIcon />,
      path: '/incidencias',
      roles: ['Administrador', 'Medico', 'Enfermero', 'Auxiliar']
    }
  ];

  // Filtrar los elementos del menú según los roles del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Residencia
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Gestión Residencia de Ancianos
          </Typography>
          {user && (
            <div>
              <Button 
                color="inherit"
                onClick={handleMenu}
                startIcon={<AccountCircle />}
              >
                {user.nombreCompleto || user.username}
              </Button>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={handleChangePassword}>
                  <ListItemIcon>
                    <PasswordIcon fontSize="small" />
                  </ListItemIcon>
                  Cambiar Contraseña
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;