import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExamenDetalle = () => {
  const [detalles, setDetalles] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [filteredDetalles, setFilteredDetalles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [formData, setFormData] = useState({
    id_detalle: '',
    id_examen: '',
    detalle: '',
    unidad: '',
    valor_referencia: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDetalle, setEditDetalle] = useState(null);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);

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
      } else {
        console.error('Error fetching examenes:', examenesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching examenes:', error);
    }
  };

  // Función para obtener la lista de detalles de examen
  const fetchDetalles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const detallesResponse = await fetch('/api/examen_detalle', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (detallesResponse.ok) {
        const detallesData = await detallesResponse.json();
        setDetalles(detallesData.detalles);
        setFilteredDetalles(detallesData.detalles);
      } else {
        console.error('Error fetching detalles:', detallesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching detalles:', error);
    }
  };

  // Función para crear o editar un detalle de examen
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_examen, detalle, unidad, valor_referencia } = formData;

    // Validación de campos
    if (!id_examen || !detalle || !unidad || !valor_referencia) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/api/examen_detalle';
      let method = 'POST';

      if (editDetalle) {
        endpoint = `/api/examen_detalle/${editDetalle.id_detalle}`;
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
        fetchDetalles();
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

  // Función para eliminar un detalle de examen
  const handleDeleteDetalle = async (id_detalle) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este detalle de examen?');
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/examen_detalle/${id_detalle}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDetalles(detalles.filter((detalle) => detalle.id_detalle !== id_detalle));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar detalle de examen.');
      }
    } catch (error) {
      console.error('Error al eliminar detalle de examen:', error);
    }
  };

  // Función para abrir el modal de creación/edición
  const handleOpenModal = () => {
    setShowModal(true);
    setEditDetalle(null);
    setFormData({
      id_detalle: '',
      id_examen: '',
      detalle: '',
      unidad: '',
      valor_referencia: ''
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

  const handleEditDetalle = (detalle) => {
    setEditDetalle(detalle);
    setFormData({
      ...detalle
    });
    setShowModal(true);
    setError(null);
    setModalError(null);
  };

  // Función para generar un reporte PDF de detalles de examen
  const handleShowReport = () => {
    generatePDF();
  };

  // Función para generar el PDF con los datos de los detalles de examen
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Detalles de Examen');

    const detallesData = detalles.map(detalle => [
      detalle.examen,
      detalle.detalle,
      detalle.unidad,
      detalle.valor_referencia
    ]);

    doc.autoTable({
      head: [['Examen', 'Detalle', 'Unidad', 'Valor de Referencia']],
      body: detallesData,
    });

    doc.save('reporte_detalles_examen.pdf');
  };

  // Columnas para la tabla de detalles de examen
  const columns = [
    {
      name: 'EXAMEN',
      selector: row => row.examen,
      sortable: true,
    },
    {
      name: 'DETALLE',
      selector: row => row.detalle,
      sortable: true,
    },
    {
      name: 'UNIDAD',
      selector: row => row.unidad,
      sortable: true,
    },
    {
      name: 'VALOR DE REFERENCIA',
      selector: row => row.valor_referencia,
      sortable: true,
    },
    {
      name: 'ACCIONES',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleEditDetalle(row)}>
            <i className="fas fa-edit"></i>
           </button> 
          <button title="Eliminar" className="btn btn-danger btn-sm mr-2 action-button" onClick={() => handleDeleteDetalle(row.id_detalle)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchExamenes();
    fetchDetalles();
  }, []);

  useEffect(() => {
    const result = detalles.filter(detalle =>
      detalle.detalle.toLowerCase().includes(search.toLowerCase()) ||
      detalle.examen.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDetalles(result);
  }, [search, detalles]);

  return (
    <div className="container mt-4">
      <h4>Detalles de Exámenes</h4>
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
        data={filteredDetalles}
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
                <h5 className="modal-title">{editDetalle ? 'Editar Detalle' : 'Crear Detalle'}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Examen</label>
                    <select className="form-control" name="id_examen" value={formData.id_examen} onChange={handleChange}>
                      <option value="">Seleccione un examen</option>
                      {examenes.map(e => (
                        <option key={e.id_examen} value={e.id_examen}>
                          {e.examen}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Detalle</label>
                    <input type="text" className="form-control" name="detalle" value={formData.detalle} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Unidad</label>
                    <input type="text" className="form-control" name="unidad" value={formData.unidad} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Valor de Referencia</label>
                    <input type="text" className="form-control" name="valor_referencia" value={formData.valor_referencia} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editDetalle ? 'Editar' : 'Crear'}
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

export default ExamenDetalle;
