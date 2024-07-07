import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
//import './medicos.css'; // Estilos específicos si los tienes
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [filteredMedicos, setFilteredMedicos] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_apellido: '',
    especialidad: '',
    celular: '',
    direccion: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMedico, setEditMedico] = useState(null);
  const [error, setError] = useState(null); // Error general de la tabla
  const [modalError, setModalError] = useState(null); // Error específico del modal

  // Función para obtener la lista de médicos
  const fetchMedicos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const medicosResponse = await fetch('/api/medico', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (medicosResponse.ok) {
        const medicosData = await medicosResponse.json();
        setMedicos(medicosData.medicos);
        setFilteredMedicos(medicosData.medicos);

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
        console.error('Error fetching medicos:', medicosResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching medicos:', error);
    }
  };

  // Función para crear o editar un médico
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cedula, nombre_apellido, especialidad, celular, direccion } = formData;

    // Validación de campos
    if (!cedula || !nombre_apellido || !especialidad || !celular || !direccion) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/api/medico';
      let method = 'POST';

      if (editMedico) {
        endpoint = `/api/medico/${editMedico.cedula}`;
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
        fetchMedicos();
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

  // Función para eliminar un médico
  const handleDeleteMedico = async (cedula) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este médico?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medico/${cedula}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMedicos(medicos.filter((medico) => medico.cedula !== cedula));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar médico.');
      }
    } catch (error) {
      console.error('Error al eliminar médico:', error);
    }
  };

  // Función para abrir el modal de creación/edición
  const handleOpenModal = () => {
    setShowModal(true);
    setEditMedico(null);
    setFormData({
      cedula: '',
      nombre_apellido: '',
      especialidad: '',
      celular: '',
      direccion: ''
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

  const handleEditMedico = (medico) => {
    setEditMedico(medico);
    setFormData({
      ...medico
    });
    setShowModal(true);
    setError(null);
    setModalError(null); // Resetear error al abrir el modal
  };

  // Función para generar un reporte PDF de médicos
  const handleShowReport = () => {
    generatePDF();
  };

  // Función para generar el PDF con los datos de los médicos
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Médicos');

    const medicosData = medicos.map(medico => [
      medico.cedula,
      medico.nombre_apellido,
      medico.especialidad,
      medico.celular,
      medico.direccion
    ]);

    doc.autoTable({
      head: [['Cédula', 'Nombre y Apellido', 'Especialidad', 'Celular', 'Dirección']],
      body: medicosData,
    });

    doc.save('reporte_medicos.pdf');
  };

  // Columnas para la tabla de médicos
  const columns = [
    {
      name: 'CÉDULA',
      selector: row => row.cedula,
      sortable: true,
    },
    {
      name: 'NOMBRE Y APELLIDO',
      selector: row => row.nombre_apellido,
      sortable: true,
    },
    {
      name: 'ESPECIALIDAD',
      selector: row => row.especialidad,
      sortable: true,
    },
    {
      name: 'CELULAR',
      selector: row => row.celular,
      sortable: true,
    },
    {
      name: 'DIRECCIÓN',
      selector: row => row.direccion,
      sortable: true,
    },
    {
      name: 'ACCIONES',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditMedico(row)}>
            <i className="fas fa-edit"></i>
          </button>
          <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeleteMedico(row.cedula)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchMedicos();
  }, []);

  useEffect(() => {
    const result = medicos.filter(medico =>
      medico.nombre_apellido.toLowerCase().includes(search.toLowerCase()) ||
      medico.cedula.includes(search)
    );
    setFilteredMedicos(result);
  }, [search, medicos]);

  return (
    <div className="container mt-4">
      <h4>Médicos</h4>
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
        data={filteredMedicos}
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
                <h5 className="modal-title">{editMedico ? 'Editar Médico' : 'Crear Médico'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Cédula</label>
                    <input type="number" className="form-control" name="cedula" value={formData.cedula} onChange={handleChange} disabled={!!editMedico} />
                  </div>
                  <div className="form-group">
                    <label>Nombre y Apellido</label>
                    <input type="text" className="form-control" name="nombre_apellido" value={formData.nombre_apellido} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Especialidad</label>
                    <input type="text" className="form-control" name="especialidad" value={formData.especialidad} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Celular</label>
                    <input type="text" className="form-control" name="celular" value={formData.celular} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editMedico ? 'Editar' : 'Crear'}
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

export default Medicos;
