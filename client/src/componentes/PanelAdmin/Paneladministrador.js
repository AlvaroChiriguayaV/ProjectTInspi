import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Users from '../Usuarios/Users';
import Roles from '../Usuarios/roles';
import Auditoria from '../Usuarios/auditoria';
import './AdminPage.css';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleProtectedRequest = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('Token no encontrado en localStorage');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/session', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          const firstName = data.user.name.split(' ')[0];
          setUserName(firstName);
          setUserPermissions(data.user.permissions);
        } else {
          console.error('Error al hacer la solicitud protegida:', response.statusText);
        }
      } catch (error) {
        console.error('Error al hacer la solicitud protegida:', error);
      } finally {
        setIsLoading(false);
      }
    };

    handleProtectedRequest();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <>
            <h2>{`Bienvenido, ${userName}!`}</h2>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Estadísticas del Panel</h5>
                <p>Información clave.</p>
              </div>
            </div>
          </>
        );
      case 'muestras':
        return <div>Gestion de Muestras Microbiologicas</div>;
      case 'users':
        return <Users />;
      case 'roles':
        return <Roles />;
      case 'auditoria':
        return  <Auditoria/>;
      case 'settings':
        return <div>Configuración</div>;
      case 'reports':
        return <div>Reportes</div>;
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getBreadcrumb = () => {
    switch (view) {
      case 'muestras':
        return 'Muestras';
      case 'dashboard':
        return 'Dashboard';
      case 'users':
        return 'Usuarios > Usuarios';
      case 'roles':
        return 'Usuarios > Roles';
      case 'auditoria':
        return 'Auditoria';
      case 'settings':
        return 'Configuración';
      case 'reports':
        return 'Reportes';
      default:
        return '';
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  // Verifica si el usuario tiene el permiso de gestión de usuarios
  //const hasGestionUsuariosPermission = userPermissions.includes(8);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Barra superior */}
      {isAuthenticated && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
          <a className="navbar-brand" href="#">&nbsp;&nbsp;&nbsp;&nbsp;Instituto Nacional INSPI</a>
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end d-none d-lg-flex">
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <div className="user-initial bg-light text-dark rounded-circle d-flex justify-content-center align-items-center">
                    {getInitial(userName)}
                  </div>
                  <span className="ms-2">{userName}</span>
                  &nbsp;</a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><a className="dropdown-item" href="#">Perfil</a></li>
                  <li><a className="dropdown-item" href="#">Ajustes</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Cerrar Sesión</button></li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      )}

      <div className="d-flex">
        {/* Barra lateral fija */}
        {isAuthenticated && (
          <div className={`sidebar bg-dark text-white p-3 ${sidebarOpen ? 'show' : ''}`}>
            <div className="breadcrumb mb-3">
              <i className="fas fa-home"></i> {getBreadcrumb()}
            </div>
            <ul className="nav flex-column">
              <li className="nav-item d-lg-none">
                <button
                  className="nav-link text-white btn btn-link"
                  data-bs-toggle="collapse"
                  data-bs-target="#userProfileSubMenu"
                  aria-expanded="false"
                  aria-controls="userProfileSubMenu"
                >
                  <i className="fas fa-user"></i> {userName} <i className="fas fa-chevron-down"></i>
                </button>
                {/* Submenu para el perfil del usuario */}
                <div className="collapse" id="userProfileSubMenu">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <a className="nav-link text-white" href="#">Perfil</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link text-white" href="#">Ajustes</a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="nav-item">
                <button className="nav-link text-white btn btn-link" onClick={() => { setView('dashboard'); toggleSidebar(); }}>
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link text-white btn btn-link" onClick={() => { setView('muestras'); toggleSidebar(); }}>
                  <i className="fas fa-vial"></i> Gestión de Muestras
                </button>
              </li>
              {/* Mostrar solo si el usuario tiene permiso de gestión de usuarios */}
              {/* {userPermissions.includes(11) && ( 
                <li className="nav-item">
                  <button
                    className="nav-link text-white btn btn-link"
                    data-bs-toggle="collapse"
                    data-bs-target="#userSubMenu"
                    aria-expanded="false"
                    aria-controls="userSubMenu"
                  >
                    <i className="fas fa-user"></i> Gestión de Usuarios <i className="fas fa-chevron-down"></i>
                  </button> */}
                  {/* Submenu para la gestión de usuarios */}
                  {/* <div className="collapse" id="userSubMenu">
                    <ul className="nav flex-column"> */}
                    {userPermissions.includes(8) && (
                      <li className="nav-item">
                        <button
                          className="nav-link text-white btn btn-link"
                          onClick={() => { setView('users'); toggleSidebar(); }}
                        >
                          <i class="fas fa-users"></i> Usuarios
                        </button>
                      </li>
                      )}
                      {userPermissions.includes(10) && (
                      <li className="nav-item">
                        <button
                          className="nav-link text-white btn btn-link"
                          onClick={() => { setView('roles'); toggleSidebar(); }}
                        >
                         <i class="fas fa-user-friends"></i> Roles
                        </button>
                      </li>
                       /* )}
                    </ul>
                  </div>
                </li> */
               )}
          {userPermissions.includes(9) && (
              <li className="nav-item">
                <button className="nav-link text-white btn btn-link" onClick={() => { setView('auditoria'); toggleSidebar(); }}>
                  <i className="fas fa-vial"></i> Auditoria
                </button>
              </li>
          )}    
              <li className="nav-item">
                <button className="nav-link text-white btn btn-link" onClick={() => { setView('settings'); toggleSidebar(); }}>
                  <i className="fas fa-cogs"></i> Configuración
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link text-white btn btn-link" onClick={() => { setView('reports'); toggleSidebar(); }}>
                  <i className="fas fa-file-alt"></i> Reportes
                </button>
              </li>
              <li className="nav-item d-lg-none">
                <div className="nav-item">
                  <button className="nav-link text-white btn btn-link" onClick={handleLogout}>Cerrar Sesión</button>
                </div>
              </li>
            </ul>
          </div>
        )}

        <div className={`content p-4`}>
          {isAuthenticated ? renderContent() : <h1>No tienes permiso para acceder a esta página.</h1>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
