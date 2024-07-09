import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Examenes = () => {
  const [examenes, setExamenes] = useState([]);
  const [analisis, setAnalisis] = useState([]);
  const [filteredExamenes, setFilteredExamenes] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    id_examen: '',
    id_analisis: '',
    examen: '',
    fecha: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExamen, setEditExamen] = useState(null);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);

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
        setAnalisis(analisisData.analisis);

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

  // Función para obtener la lista de exámenes
  const fetchExamenes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const examenesResponse = await fetch('/api/examenes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (examenesResponse.ok) {
        const examenesData = await examenesResponse.json();
        setExamenes(examenesData.users);
        setFilteredExamenes(examenesData.users);
      } else {
        console.error('Error fetching examenes:', examenesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching examenes:', error);
    }
  };

  // Función para crear o editar un examen
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_analisis, examen} = formData;

    // Validación de campos
    if (!id_analisis || !examen) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/api/examenes';
      let method = 'POST';

      if (editExamen) {
        endpoint = `/api/examenes/${editExamen.id_examen}`;
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
        fetchExamenes();
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

  // Función para eliminar un examen
  const handleDeleteExamen = async (id_examen) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este examen?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/examenes/${id_examen}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setExamenes(examenes.filter((examen) => examen.id_examen !== id_examen));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar examen.');
      }
    } catch (error) {
      console.error('Error al eliminar examen:', error);
    }
  };

  // Función para abrir el modal de creación/edición
  const handleOpenModal = () => {
    setShowModal(true);
    setEditExamen(null);
    setFormData({
      id_examen: '',
      id_analisis: '',
      examen: '',
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

  const handleEditExamen = (examen) => {
    setEditExamen(examen);
    setFormData({
      ...examen
    });
    setShowModal(true);
    setError(null);
    setModalError(null);
  };

  // Función para generar un reporte PDF de exámenes
  const handleShowReport = () => {
    generatePDF();
  };

  // Función para generar el PDF con los datos de los exámenes
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Exámenes');

    const examenesData = examenes.map(examen => [
      examen.id_examen,
      examen.analisis,
      examen.examen,
      examen.fecha
    ]);

    doc.autoTable({
      head: [['ID Examen', 'Análisis', 'Examen', 'Fecha']],
      body: examenesData,
    });

    doc.save('reporte_examenes.pdf');
  };

  // Columnas para la tabla de exámenes
  const columns = [
    {
      name: '#',
      selector: row => row.id_examen,
      sortable: true,
    },
    {
      name: 'ANÁLISIS',
      selector: row => row.analisis,
      sortable: true,
    },
    {
      name: 'EXAMEN',
      selector: row => row.examen,
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
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditExamen(row)}>
            <i className="fas fa-edit"></i>
           </button> 
          <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeleteExamen(row.id_examen)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchAnalisis();
    fetchExamenes();
  }, []);

  useEffect(() => {
    const result = examenes.filter(examen =>
      examen.examen.toLowerCase().includes(search.toLowerCase()) ||
      examen.analisis.toLowerCase().includes(search.toLowerCase())
      
    );
    setFilteredExamenes(result);
  }, [search, examenes]);

  return (
    <div className="container mt-4">
      <h4>Exámenes</h4>
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
        data={filteredExamenes}
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
                <h5 className="modal-title">{editExamen ? 'Editar Examen' : 'Crear Examen'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Análisis</label>
                    <select className="form-control" name="id_analisis" value={formData.id_analisis} onChange={handleChange}>
                      <option value="">Seleccione un análisis</option>
                      {analisis.map(a => (
                        <option key={a.id_analisis} value={a.id_analisis}>
                          {a.analisis}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nombre del Examen</label>
                    <input type="text" className="form-control" name="examen" value={formData.examen} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editExamen ? 'Editar' : 'Crear'}
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

export default Examenes;
