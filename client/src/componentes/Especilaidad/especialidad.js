import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Especialidad = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [filteredEspecialidades, setFilteredEspecialidades] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    id_especialidad: '',
    nombre: '',
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEspecialidad, setEditEspecialidad] = useState(null);
  const [error, setError] = useState(null); // Error general de la tabla
  const [modalError, setModalError] = useState(null); // Error específico del modal

  // Función para obtener la lista de especialidades
  const fetchEspecialidades = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const especialidadesResponse = await fetch('/api/especialidades', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (especialidadesResponse.ok) {
        const especialidadesData = await especialidadesResponse.json();
        setEspecialidades(especialidadesData.especialidades);
        setFilteredEspecialidades(especialidadesData.especialidades);

        const sessionResponse = await fetch('/api/session', {
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
        console.error('Error fetching especialidades:', especialidadesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching especialidades:', error);
    }
  };

  // Función para crear o editar una especialidad
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre } = formData;

    // Validación de campos
    if (!nombre) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/api/especialidades';
      let method = 'POST';

      if (editEspecialidad) {
        endpoint = `/api/especialidades/${editEspecialidad.id_especialidad}`;
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
        fetchEspecialidades();
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

  // Función para eliminar una especialidad
  const handleDeleteEspecialidad = async (id_especialidad) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar esta especialidad?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/especialidades/${id_especialidad}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEspecialidades(especialidades.filter((especialidad) => especialidad.id_especialidad !== id_especialidad));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar especialidad.');
      }
    } catch (error) {
      console.error('Error al eliminar especialidad:', error);
    }
  };

  // Función para abrir el modal de creación/edición
  const handleOpenModal = () => {
    setShowModal(true);
    setEditEspecialidad(null);
    setFormData({
      id_especialidad: '',
      nombre: '',
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

  const handleEditEspecialidad = (especialidad) => {
    setEditEspecialidad(especialidad);
    setFormData({
      ...especialidad,
    });
    setShowModal(true);
    setError(null);
    setModalError(null); // Resetear error al abrir el modal
  };

  // Función para generar un reporte PDF de especialidades
  const handleShowReport = () => {
    generatePDF();
  };

  // Función para generar el PDF con los datos de las especialidades
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Especialidades');

    const especialidadesData = especialidades.map(especialidad => [
      especialidad.id_especialidad,
      especialidad.nombre,
    ]);

    doc.autoTable({
      head: [['ID Especialidad', 'Nombre']],
      body: especialidadesData,
    });

    doc.save('reporte_especialidades.pdf');
  };

  // Columnas para la tabla de especialidades
  const columns = [
    {
      name: '#',
      selector: row => row.id_especialidad,
      sortable: true,
    },
    {
      name: 'NOMBRE',
      selector: row => row.nombre,
      sortable: true,
    },
    {
      name: 'ACCIONES',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditEspecialidad(row)}>
            <i className="fas fa-edit"></i>
          </button>
          <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeleteEspecialidad(row.id_especialidad)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  useEffect(() => {
    const result = especialidades.filter(entry => {
      return entry.nombre.toLowerCase().includes(search.toLowerCase());
    });
    setFilteredEspecialidades(result);
  }, [search, especialidades]);

  return (
    <div className="container mt-4">
      <h4>Especialidades</h4>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25 mr-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleOpenModal}>
          <i className="fas fa-plus"></i> Nueva
        </button>
      </div>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredEspecialidades}
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
                <h5 className="modal-title">{editEspecialidad ? 'Editar Especialidad' : 'Crear Especialidad'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nombre de la Especialidad</label>
                    <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editEspecialidad ? 'Editar' : 'Crear'}
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

export default Especialidad;
