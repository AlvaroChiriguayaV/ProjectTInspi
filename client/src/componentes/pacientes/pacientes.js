import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import './pacientes.css'; // Estilos específicos si los tienes
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    cedula: '',
    paciente: '',
    edad: '',
    sexo: '',
    celular: '',
    fecha: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPaciente, setEditPaciente] = useState(null);
  const [error, setError] = useState(null); // Error general de la tabla
  const [modalError, setModalError] = useState(null); // Error específico del modal

  // Función para obtener la lista de pacientes
  const fetchPacientes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const pacientesResponse = await fetch('/api/pacientes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (pacientesResponse.ok) {
        const pacientesData = await pacientesResponse.json();
        setPacientes(pacientesData.users);
        setFilteredPacientes(pacientesData.users);

        const sessionResponse = await fetch('api/session', {
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
        console.error('Error fetching pacientes:', pacientesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching pacientes:', error);
    }
  };

  // Función para crear o editar un paciente
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cedula, paciente, edad, sexo, celular} = formData;

    // Validación de campos
    if (!cedula || !paciente || !edad || !sexo || !celular) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/api/pacientes';
      let method = 'POST';

      if (editPaciente) {
        endpoint = `/api/pacientes/${editPaciente.cedula}`;
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
        fetchPacientes();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        setModalError(errorData.error || 'Error en la operación.');
      }
    } catch (error) {
      console.error('Error en la operación:', error);
      setModalError('Error en la operación.');
    }
  };

  // Función para eliminar un paciente
  const handleDeletePaciente = async (cedula) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este paciente?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pacientes/${cedula}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPacientes(pacientes.filter((paciente) => paciente.cedula !== cedula));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar paciente.');
      }
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
    }
  };

  // Función para abrir el modal de creación/edición
  const handleOpenModal = () => {
    setShowModal(true);
    setEditPaciente(null);
    setFormData({
      cedula: '',
      paciente: '',
      edad: '',
      sexo: '',
      celular: '',
      fecha: ''
    });
    setError(null);
    setModalError(null);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setModalError(null);
  };

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditPaciente = (paciente) => {
    setEditPaciente(paciente);
    setFormData({
      ...paciente
    });
    setShowModal(true);
    setError(null);
    setModalError(null); // Resetear error al abrir el modal
  };

  // Función para generar un reporte PDF de pacientes
  const handleShowReport = () => {
    generatePDF();
  };

  // Función para generar el PDF con los datos de los pacientes
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Pacientes');

    const pacientesData = pacientes.map(paciente => [
      paciente.cedula,
      paciente.paciente,
      paciente.edad,
      paciente.sexo,
      paciente.celular,
      paciente.fecha
    ]);

    doc.autoTable({
      head: [['Cédula', 'Paciente', 'Edad', 'Sexo', 'Celular', 'Fecha de Ingreso']],
      body: pacientesData,
    });

    doc.save('reporte_pacientes.pdf');
  };

  // Columnas para la tabla de pacientes
  const columns = [
    {
      name: 'CÉDULA',
      selector: row => row.cedula,
      sortable: true,
    },
    {
      name: 'PACIENTE',
      selector: row => row.paciente,
      sortable: true,
    },
    {
      name: 'EDAD',
      selector: row => row.edad,
      sortable: true,
    },
    {
      name: 'SEXO',
      selector: row => row.sexo,
      sortable: true,
    },
    {
      name: 'CELULAR',
      selector: row => row.celular,
      sortable: true,
    },
    {
      name: 'FECHA DE INGRESO',
      selector: row => row.fecha,
      sortable: true,
    },
    {
      name: 'ACCIONES',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditPaciente(row)}>
            <i className="fas fa-edit"></i>
           </button> 
          <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeletePaciente(row.cedula)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    const result = pacientes.filter(paciente =>
      paciente.paciente.toLowerCase().includes(search.toLowerCase()) ||
      paciente.cedula.includes(search)
    );
    setFilteredPacientes(result);
  }, [search, pacientes]);

  return (
    <div className="container mt-4">
      <h4>Pacientes</h4>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25 mr-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleOpenModal}>
          <i className="fas fa-plus"></i> Nuevo
        </button>
      </div>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredPacientes}
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
                <h5 className="modal-title">{editPaciente ? 'Editar Paciente' : 'Crear Paciente'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Cédula</label>
                    <input type="number" className="form-control" name="cedula" value={formData.cedula} onChange={handleChange} disabled={!!editPaciente} />
                  </div>
                  <div className="form-group">
                    <label>Nombre del paciente</label>
                    <input type="text" className="form-control" name="paciente" value={formData.paciente} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Edad</label>
                    <input type="number" className="form-control" name="edad" value={formData.edad} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Sexo</label>
                    <input type="text" className="form-control" name="sexo" value={formData.sexo} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Celular</label>
                    <input type="text" className="form-control" name="celular" value={formData.celular} onChange={handleChange} />
                  </div>
                  {/* <div className="form-group">
                    <label>Fecha de ingreso</label>
                    <input type="date" className="form-control" name="fecha_de_ingreso" value={formData.fecha_de_ingreso} onChange={handleChange} />
                  </div> */}
                  <button type="submit" className="btn btn-primary">
                    {editPaciente ? 'Editar' : 'Crear'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pacientes;
