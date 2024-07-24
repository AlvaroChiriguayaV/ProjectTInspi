import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import './usuario.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Uri from '../../enviroment/enviroment';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    correo_electronico: '',
    contraseña: '',
    rol_id: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState(null); // Error general de la tabla
  const [modalError, setModalError] = useState(null); // Error específico del modal

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const usersResponse = await fetch(Uri+'api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        setUsers(userData.users);
        setFilteredUsers(userData.users);

        const sessionResponse = await fetch(Uri+'api/session', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setUserPermissions(sessionData.user.permissions);
        } else {
          console.error('Error fetching session:', sessionResponse.statusText);
        }
      } else {
        console.error('Error fetching users:', usersResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }
      const response = await fetch(Uri+'api/roles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      } else {
        console.error('Error fetching roles:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    const result = users.filter(user => {
      return user.nombre.toLowerCase().includes(search.toLowerCase()) ||
             user.correo_electronico.toLowerCase().includes(search.toLowerCase()) ||
             user.cedula.includes(search);
    });
    setFilteredUsers(result);
  }, [search, users]);

  const handleCreateUser = () => {
    setShowModal(true);
    setEditUser(null);
    setFormData({
      cedula: '',
      nombre: '',
      correo_electronico: '',
      contraseña: '',
      rol_id: ''
    });
    setError(null);
    setModalError(null); // Resetear error al abrir el modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setModalError(null); // Resetear error al cerrar el modal
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cedula, nombre, correo_electronico, rol_id } = formData; // Eliminar contraseña de los campos a validar
    if (!cedula || !nombre || !correo_electronico || !rol_id) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      let endpoint = Uri+'api/users';
      let method = 'POST';
  
      if (editUser) {
        endpoint = Uri+`api/users/${editUser.cedula}`;
        method = 'PUT';
      }
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
  
      if (response.ok) {
        const responseData = await response.json();
        fetchUsers();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          if (errorData.error.includes('cédula')) {
            setModalError(errorData.error);
          } else if (errorData.error.includes('rol 1')) {
            setModalError(errorData.error);
          } else {
            setModalError('Error en la operación.');
          }
        } else {
          setModalError('Error en la operación.');
        }
      }
    } catch (error) {
      console.error('Error en la operación:', error);
      setModalError('Error en la operación.');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(Uri+`api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.cedula !== userId));
      } else {
        console.error('Error al eliminar usuario:', response.statusText);
        setError(responseData.error);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setFormData({
      ...user, 
      rol_id: user.rol_id
    });
    setShowModal(true);
    setError(null);
    setModalError(null); // Resetear error al abrir el modal
  };

  const handleShowReport = () => {
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Usuarios');

    const usersData = users.map(user => [user.cedula, user.nombre, user.correo_electronico, user.rol]);

    doc.autoTable({
      head: [['Cédula', 'Nombre', 'Correo Electrónico', 'Rol']],
      body: usersData,
    });

    doc.save('reporte_usuarios.pdf');
  };

  const handleChangePassword = (user) => {
    setEditUser(user);
    setShowChangePasswordModal(true);
    setModalError(null); // Resetear error al abrir el modal
    setError(null);
  };

  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
  
    const { nuevaContraseña, confirmarContraseña } = formData;
  
    // Verificar que las contraseñas coincidan
    if (nuevaContraseña !== confirmarContraseña) {
      alert('Las contraseñas no coinciden.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(Uri+`api/users/${editUser.cedula}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaContraseña, confirmarContraseña })
      });
  
      if (response.ok) {
        const responseData = await response.json();
        setShowChangePasswordModal(false);
        alert(responseData.message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al cambiar la contraseña.');
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      alert('Error al cambiar la contraseña.');
    }
  };

  const columns = [
    {
      name: 'CÉDULA',
      selector: row => row.cedula,
      sortable: true,
    },
    {
      name: 'USUARIO',
      selector: row => row.nombre,
      sortable: true,
    },
    {
      name: 'E-MAIL',
      selector: row => row.correo_electronico,
      sortable: true,
    },
    {
      name: 'ROL',
      selector: row => row.rol,
      sortable: true,
    },
    {
      name: 'CONTRASEÑA',
      cell: row => (
        <>
        {userPermissions.includes(7) && (
        <button color='red' className="btn btn-link"  onClick={() => handleChangePassword(row)}>
          <i className="fas fa-pencil-alt"></i> Cambiar
        </button>
        )}
        </>
      )
    },
    {
      name: 'ACCIONES',
      cell: row => (
        <>
          {userPermissions.includes(2) && (
            <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditUser(row)}>
              <i className="fas fa-edit"></i>
            </button>
          )}
          {userPermissions.includes(3) && (
            <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeleteUser(row.cedula)}>
              <i className="fas fa-trash"></i>
            </button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <h4>Usuarios</h4>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25 mr-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {userPermissions.includes(1) && (
          <button className="btn btn-success mr-2" onClick={handleCreateUser}>
            <i className="fas fa-plus"></i> Nuevo
          </button>
        )}
      </div>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredUsers}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        customStyles={{
          headCells: {
            style: {
              backgroundColor: '#135ea9',
              color: '#ffffff',
              border: '1px solid #ccc',
            },
          },
        }}
      />
      <button className="btn btn-primary mt-3" onClick={handleShowReport}>
        Mostrar Reporte
      </button>

      {showModal && (
        <div className="modal show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editUser ? 'Editar Usuario' : 'Crear Usuario'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Cédula</label>
                    <input type="number" maxLength={10} className="form-control" name="cedula" value={formData.cedula} onChange={handleChange} disabled={!!editUser} />
                  </div>
                  <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" className="form-control" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} />
                  </div>
                  {!editUser && (
                    <div className="form-group">
                      <label>Contraseña</label>
                      <input type="password" className="form-control" name="contraseña" value={formData.contraseña} onChange={handleChange} />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Rol</label>
                    <select className="form-control" name="rol_id" value={formData.rol_id} onChange={handleChange}>
                      <option value="">Seleccionar Rol</option>
                      {roles.map((role) => (
                        <option key={role.id_rol} value={role.id_rol}>{role.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">{editUser ? 'Guardar' : 'Crear'}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar contraseña */}
      {showChangePasswordModal && (
        <div className="modal show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Contraseña</h5>
                <button type="button" className="close" onClick={() => setShowChangePasswordModal(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmitChangePassword}>
                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input type="password" className="form-control" name="nuevaContraseña" value={formData.nuevaContraseña} onChange={handleChangePasswordInput} />
                  </div>
                  <div className="form-group">
                    <label>Confirmar Contraseña</label>
                    <input type="password" className="form-control" name="confirmarContraseña" value={formData.confirmarContraseña} onChange={handleChangePasswordInput} />
                  </div>
                  <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
