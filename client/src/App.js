import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Importa Routes y Route para definir las rutas
import Login from './componentes/Login/Login'; // Importa el componente Login
import Paneladministrador from './componentes/PanelAdmin/Paneladministrador'; // Importa el componente Paneladministrador
import Users from './componentes/Usuarios/Users';
const App = () => (
  <Routes> {/* Configuración de rutas */}
    <Route path="/" element={<Login />} /> {/* Ruta para el login */}
    <Route path="/admin" element={<Paneladministrador />} /> {/* Ruta para el panel administrativo */}
    <Route path="/users" element={<Users />} /> 
  </Routes>
);

export default App; // Exporta el componente App
