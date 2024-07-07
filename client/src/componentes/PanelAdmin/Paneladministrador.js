import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Users from '../Usuarios/Users';
import Roles from '../Usuarios/roles';
import Auditoria from '../Usuarios/auditoria';
import Medico from '../Medico/medico';
import Analisis from '../analisis/analisis';
import Examenes from '../Examenes/examenes';
import MantExamen from '../Examenes/mantenimientoExamen';
import RealizarExamenes from '../Examenes/realizarExamen';

import './AdminPage.css';
import labLogo from '../Login/image/GB-LAB.png';
import Pacientes from '../pacientes/pacientes';
import MantenimientoExamen from '../Examenes/mantenimientoExamen';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [categories, setCategories] = useState(new Set());
  const [view, setView] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
    
        if (!token) {
          console.error('Token no encontrado en localStorage');
          setIsLoading(false);
          return;
        }
    
        const response = await fetch('/api/permisos/categorias', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        if (response.ok) {
          const data = await response.json();
          const uniqueCategories = new Set(data.permissions.map(permission => permission.categoria));
          setCategories(uniqueCategories);
          setUserPermissions(data.permissions.map(permission => permission.id_permiso));
        } else {
          console.error('Error al obtener categorías:', response.statusText);
        }
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSession = async () => {
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
          setUserPermissions(data.user.permissions.map(permission => permission.id_permiso));
        } else {
          console.error('Error al hacer la solicitud protegida:', response.statusText);
        }
      } catch (error) {
        console.error('Error al hacer la solicitud protegida:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const renderContent = () => {
    switch (view) {
      case 'inicio':
        return (
          <>
            <h2>{`Bienvenido, ${userName}!`}</h2>
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <img src={labLogo} alt="Lab Logo" className="img-flui mb-3" />
                    <h5 className="card-title">Laboratorio Clínico GB-Lab</h5>
                    <p className="card-text">
                      <i className="fas fa-map-marker-alt"></i> MUCHO LOTE 1 ETAPA 3 Mz: 2344 V: 1 Av. Manuel Gómez Lince, Guayaquil, Ecuador
                    </p>
                    <p className="card-text">
                      <i className="fas fa-phone"></i> (04) 505-2852
                    </p>
                    <p className="card-text">
                      <i className="fas fa-envelope"></i> laboratorio.gblab@gmail.com
                    </p>
                  </div>
                  <div className="col-md-8">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.12345!2d-79.93555!3d-2.14443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d1abcde0fghij:0xabcdef12345678!2sInstituto%20Nacional%20INSPI!5e0!3m2!1sen!2sec!4v1621234567890!5m2!1sen!2sec"
                      width="100%"
                      height="250"
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      aria-hidden="false"
                      tabIndex="0"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'Pacientes':
        return <Pacientes />;
      case 'Medico':
        return <Medico />;
      case 'Realizar Examenes':
        return <MantExamen />;
      case 'Resultado de Examen':
        return <div>Registrar Resultados Médicos</div>;
      case 'users':
        return <Users />;
      case 'roles':
        return <Roles />;
      case 'auditoria':
        return <Auditoria />;
      case 'analisis':
          return <Analisis />;
      case 'examenes':
        return <Examenes/>;
      case 'Realizar Examenes':
        return <div>Generar Orden de Examenes</div>;
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getBreadcrumb = () => {
    switch (view) {
      case 'Pacientes':
        return 'Pacientes';
        case 'Medico':
        return 'Medico';
      case 'Resultado de Examen':
        return 'Resultado de Examen';
      case 'inicio':
        return 'Inicio';
      case 'users':
        return 'Usuarios';
      case 'roles':
        return 'Roles';
      case 'auditoria':
        return 'Auditoría';
      case 'Realizar Examenes':
        return 'Realizar Examenes';
      case 'Analisis':
        return 'Analisis';
      default:
        return '';
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const categoryIcons = {
    'Usuarios': 'fas fa-users',
    'Roles': 'fas fa-user-tag',
    'Auditoria': 'fas fa-file',
    'Pacientes': 'fas fa-user-plus',
    'Medico': 'fa-solid fa-user-doctor',
    'Realizar Examenes': 'fas fa-file-medical',
    'Resultados de Examen': 'fas fa-vials',
  };

  const principalCategories = ['Pacientes', 'Medico', 'Realizar Examenes' , 'Resultados de Examen'];
  const configuracionesCategories = ['Usuarios', 'Roles', 'Auditoria', 'Analisis', 'Examenes'];

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
          <a className="navbar-brand" href="#">&nbsp;&nbsp;&nbsp;&nbsp;Laboratorio Clínico GB-Lab</a>
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
                <button className="nav-link text-white btn btn-link" onClick={() => { setView('inicio'); toggleSidebar(); }}>
                <i className="fa-solid fa-house"></i> Inicio
                </button>
              </li>
		
              <div className="mt-4">
                <h9 className="text-white">PRINCIPAL</h9>
                <ul className="list-unstyled">
                  {Array.from(categories)
			
                    .filter(category => principalCategories.includes(category))
                    .map((category, index) => {
			             let componentKey;
                      switch (category) {
                        case 'Pacientes':
                          componentKey = 'Pacientes';
                          break;
                          case 'Medico':
                            componentKey = 'Medico';
                            break;
                        case 'Realizar Examenes':
                          componentKey = 'Realizar Examenes';
                          break;
                          case 'Resultados de Examen':
                            componentKey = 'Resultados de Examen';
                            break;
                        
                        default:
                          componentKey = category.toLowerCase();
                      }
                      const iconClass = categoryIcons[category] || 'fas fa-circle'; // Default icon if not found
                      return (
                        <li key={index} className="nav-item">
                          <button className="nav-link text-white btn btn-link" onClick={() => { setView(componentKey); toggleSidebar(); }}>
                            <i className={iconClass}></i> {category}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>

              <div className="mt-4">
                <h9 className="text-white">CONFIGURACIONES</h9>
                <ul className="list-unstyled">
                  {Array.from(categories)
                    .filter(category => configuracionesCategories.includes(category))
                    .map((category, index) => {
                      let componentKey;
                      switch (category) {
                        case 'Usuarios':
                          componentKey = 'users';
                          break;
                        case 'Roles':
                          componentKey = 'roles';
                          break;
                        case 'Auditoria':
                          componentKey = 'auditoria';
                          break;
                        case 'Analisis':
                          componentKey = 'analisis';
                          break;
                        case 'Examenes':
                            componentKey = 'examenes';
                            break;
                        default:
                          componentKey = category.toLowerCase();
                      }
                      const iconClass = categoryIcons[category] || 'fas fa-circle'; // Default icon if not found
                      return (
                        <li key={index} className="nav-item">
                          <button className="nav-link text-white btn btn-link" onClick={() => { setView(componentKey); toggleSidebar(); }}>
                            <i className={iconClass}></i> {category}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>

              <li className="nav-item d-lg-none">
                <div className="nav-item">
                  <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>Cerrar Sesión</button>
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
