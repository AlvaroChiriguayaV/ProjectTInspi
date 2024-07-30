import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import RealizarExamen from './realizarExamen'; // Import the RealizarExamen component
import EditarExamenModal from './EditarExamenModal'; // Import the EditarExamenModal component
import jsPDF from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import jsPDF autoTable


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
      examen.nombre_medico.toLowerCase().includes(search.toLowerCase()) ||
      examen.analisis.toLowerCase().includes(search.toLowerCase()) ||
      examen.examen.toLowerCase().includes(search.toLowerCase())
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

  const handleDeleteExamen = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token no encontrado en localStorage');
        return;
      }

      const response = await fetch(`/api/mantenexamenes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setExamenes(examenes.filter(examen => examen.id_realizar !== id));
        setFilteredExamenes(filteredExamenes.filter(examen => examen.id_realizar !== id));
      } else {
        console.error('Error deleting examen:', response.statusText);
        setError('Error al eliminar el examen.');
      }
    } catch (error) {
      console.error('Error deleting examen:', error);
      setError('Error al eliminar el examen.');
    }
  };

  const handleDownloadOrder = (examen) => {
    const doc = new jsPDF();

    // Logo
    
    // Datos del laboratorio
    doc.setFontSize(12);
    doc.text('Laboratorio Clínico GB-Lab', 20, 15);
    doc.text('MUCHO LOTE 1 ETAPA 3 Mz: 2344', 20, 25);
    doc.text('(04) 505-2852', 20, 35);
    doc.text('laboratorio.gblab@gmail.com', 20, 45);

    // Título
    doc.setFontSize(12);
    doc.text('Orden de Examen', 20, 70);

    // Información del paciente y médico en dos columnas
    doc.setFontSize(10);
    doc.text(`Cédula Paciente: ${examen.cedula_paciente}`, 20, 80);
    doc.text(`Paciente: ${examen.paciente}`, 20, 90);
    doc.text(`Edad: ${examen.edad}`, 20, 100);
    
    doc.text(`Sexo: ${examen.sexo}`, 120, 80);
    doc.text(`Médico: ${examen.nombre_medico}`, 120, 90);
    doc.text(`Fecha de Ingreso: ${examen.fecha}`, 120, 100);

    // Tabla de análisis y examen
    doc.autoTable({
      startY: 130,
      head: [['Análisis', 'Examen']],
      body: [
        [examen.analisis, examen.examen]
      ],
      theme: 'striped'
    });

    doc.save(`Orden_Examen_${examen.cedula_paciente}.pdf`);
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
      name: 'Análisis',
      selector: row => row.analisis,
      sortable: true,
    },
    {
      name: 'Examen',
      selector: row => row.examen,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button title="Editar" className="btn btn-primary btn-sm mr-2 action-button" onClick={() => handleOpenEditarExamen(row)}>
            <i className="fas fa-edit"></i>
          </button>
          <button title="Eliminar" className="btn btn-danger btn-sm action-button" onClick={() => handleDeleteExamen(row.id_realizar)}>
            <i className="fas fa-trash"></i>
          </button>
          <button title="Descargar Orden" className="btn btn-secondary btn-sm action-button" onClick={() => handleDownloadOrder(row)}>
            <i className="fas fa-download"></i>
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
