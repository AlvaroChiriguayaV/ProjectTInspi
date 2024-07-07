import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
//import './analisis.css'; // Estilos específicos si los tienes
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Analisis = () => {
  const [analisis, setAnalisis] = useState([]);
  const [filteredAnalisis, setFilteredAnalisis] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    id_analisis: '',
    analisis: '',
    fecha: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAnalisis, setEditAnalisis] = useState(null);
  const [error, setError] = useState(null); // Error general de la tabla
  const [modalError, setModalError] = useState(null); // Error específico del modal

  // Función para obtener la lista de análisis
  const fetchAnalisis = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const analisisResponse = await fetch('/api/analisis', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (analisisResponse.ok) {
        const analisisData = await analisisResponse.json();
        setAnalisis(analisisData.users);
        setFilteredAnalisis(analisisData.users);

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
        console.error('Error fetching analisis:', analisisResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching analisis:', error);
    }
  };

  // Función para crear o editar un análisis
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {analisis} = formData;

    // Validación de campos
    if (!analisis) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/api/analisis';
      let method = 'POST';

      if (editAnalisis) {
        endpoint = `/api/analisis/${editAnalisis.id_analisis}`;
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
        fetchAnalisis();
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

  // Función para eliminar un análisis
  const handleDeleteAnalisis = async (id_analisis) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este análisis?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analisis/${id_analisis}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAnalisis(analisis.filter((analisis) => analisis.id_analisis !== id_analisis));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar análisis.');
      }
    } catch (error) {
      console.error('Error al eliminar análisis:', error);
    }
  };

  // Función para abrir el modal de creación/edición
  const handleOpenModal = () => {
    setShowModal(true);
    setEditAnalisis(null);
    setFormData({
      id_analisis: '',
      analisis: '',
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

  const handleEditAnalisis = (analisis) => {
    setEditAnalisis(analisis);
    setFormData({
      ...analisis
    });
    setShowModal(true);
    setError(null);
    setModalError(null); // Resetear error al abrir el modal
  };

  // Función para generar un reporte PDF de análisis
  const handleShowReport = () => {
    generatePDF();
  };

  // Función para generar el PDF con los datos de los análisis
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Análisis');

    const analisisData = analisis.map(analisis => [
      analisis.id_analisis,
      analisis.analisis,
      analisis.fecha
    ]);

    doc.autoTable({
      head: [['ID Análisis', 'Análisis', 'Fecha']],
      body: analisisData,
    });

    doc.save('reporte_analisis.pdf');
  };

  // Columnas para la tabla de análisis
  const columns = [
    {
      name: '#',
      selector: row => row.id_analisis,
      sortable: true,
    },
    {
      name: 'ANÁLISIS',
      selector: row => row.analisis,
      sortable: true,
    },
    {
      name: 'FECHA',
      selector: row => row.fecha,
      sortable: true,
    },
    {
      name: 'ACCIONES',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditAnalisis(row)}>
            <i className="fas fa-edit"></i>
           </button> 
          <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeleteAnalisis(row.id_analisis)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchAnalisis();
  }, []);

  useEffect(() => {
    const result = analisis.filter(entry => {
      return entry.analisis.toLowerCase().includes(search.toLowerCase());
      
  });
    setFilteredAnalisis(result);
  }, [search, analisis]);

  return (
    <div className="container mt-4">
      <h4>Análisis</h4>
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
        data={filteredAnalisis}
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
                <h5 className="modal-title">{editAnalisis ? 'Editar Análisis' : 'Crear Análisis'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nombre del Análisis</label>
                    <input type="text" className="form-control" name="analisis" value={formData.analisis} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editAnalisis ? 'Editar' : 'Crear'}
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

export default Analisis;
