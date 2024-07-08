import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import RealizarExamen from './realizarExamen'; // Import the RealizarExamen component
import EditarExamenModal from './EditarExamenModal'; // Import the EditarExamenModal component

const MantenimientoExamen = () => {
  const [examenes, setExamenes] = useState([]);
  const [filteredExamenes, setFilteredExamenes] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [search, setSearch] = useState('');
  const [showRealizarExamen, setShowRealizarExamen] = useState(false);
  const [showEditarExamen, setShowEditarExamen] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [error, setError] = useState(null); // Error general de la tabla
  const [modalError, setModalError] = useState(null); // Error específico del modal

  const fetchSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token no encontrado en localStorage');
        return;
      }

      const sessionResponse = await fetch('/api/session', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setUserPermissions(sessionData.user.permissions);
      } else {
        setError('Error al obtener la sesión del usuario.');
      }
    } catch (error) {
      console.error('Error al obtener la sesión del usuario:', error);
      setError('Error al obtener la sesión del usuario.');
    }
  };

  const fetchExamenes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const examenesResponse = await fetch('/api/mantenexamenes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (examenesResponse.ok) {
        const examenesData = await examenesResponse.json();
        setExamenes(examenesData.mantexamen);
        setFilteredExamenes(examenesData.mantexamen);
      } else {
        console.error('Error fetching examenes:', examenesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching examenes:', error);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchExamenes();
  }, []);

  useEffect(() => {
    const result = examenes.filter(examen =>
      examen.cedula_paciente.toLowerCase().includes(search.toLowerCase()) ||
      examen.paciente.toLowerCase().includes(search.toLowerCase()) ||
      examen.nombre_medico.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredExamenes(result);
  }, [search, examenes]);

  const handleOpenRealizarExamen = () => {
    setShowRealizarExamen(true);
    setModalError(null);
  };

  const handleCloseRealizarExamen = () => {
    setShowRealizarExamen(false);
    setModalError(null);
  };

  const handleOpenEditarExamen = (examen) => {
    setSelectedExamen(examen);
    setShowEditarExamen(true);
    setModalError(null);
  };

  const handleCloseEditarExamen = () => {
    setShowEditarExamen(false);
    setSelectedExamen(null);
    setModalError(null);
  };

  // Columnas para la tabla de exámenes realizados
  const columns = [
    {
      name: 'Cédula Paciente',
      selector: row => row.cedula_paciente,
      sortable: true,
    },
    {
      name: 'Paciente',
      selector: row => row.paciente,
      sortable: true,
    },
    {
      name: 'Médico',
      selector: row => row.nombre_medico,
      sortable: true,
    },
    {
      name: 'Fecha',
      selector: row => row.fecha,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleOpenEditarExamen(row)}>
            <i className="fas fa-edit"></i>
          </button>
        </>
      ),
    },
  ];

  if (showRealizarExamen) {
    return <RealizarExamen onClose={handleCloseRealizarExamen} />;
  }

  return (
    <div className="container mt-4">
      <h4>Mantenimiento de Exámenes</h4>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25 mr-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleOpenRealizarExamen}>
          <i className="fas fa-plus"></i> Nuevo
        </button>
      </div>
      {modalError && (
        <div className="alert alert-danger mt-3" role="alert">
          {modalError}
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
      {showEditarExamen && (
        <EditarExamenModal
          examen={selectedExamen}
          onClose={handleCloseEditarExamen}
        />
      )}
    </div>
  );
};

export default MantenimientoExamen;
