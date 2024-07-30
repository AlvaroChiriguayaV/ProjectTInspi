import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const ResultadosTabla = () => {
  const [resultados, setResultados] = useState([]);
  const [filteredResultados, setFilteredResultados] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResultado, setSelectedResultado] = useState(null);
  const [editFile, setEditFile] = useState(null);

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

  const fetchResultados = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const resultadosResponse = await fetch('/api/resultado', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resultadosResponse.ok) {
        const resultadosData = await resultadosResponse.json();
        setResultados(resultadosData.resultadosData);
        setFilteredResultados(resultadosData.resultadosData);
      } else {
        console.error('Error fetching resultados:', resultadosResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching resultados:', error);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchResultados();
  }, []);

  useEffect(() => {
    const result = resultados.filter(resultado =>
      resultado.cedula_paciente.toLowerCase().includes(search.toLowerCase()) ||
      resultado.paciente.toLowerCase().includes(search.toLowerCase()) ||
      resultado.nombre_medico.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredResultados(result);
  }, [search, resultados]);

  const handleDownloadResult = (filePath) => {
    const link = document.createElement('a');
    link.href = `/${filePath}`;
    link.download = filePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditResult = (resultado) => {
    setSelectedResultado(resultado);
    setShowEditModal(true);
  };

  const handleDeleteResult = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const deleteResponse = await fetch(`/api/resultado/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (deleteResponse.ok) {
        fetchResultados();
      } else {
        console.error('Error deleting resultado:', deleteResponse.statusText);
      }
    } catch (error) {
      console.error('Error deleting resultado:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const formData = new FormData();
      formData.append('id_realizar', selectedResultado.id_realizar);
      if (editFile) {
        formData.append('file', editFile);
      }

      const editResponse = await fetch(`/api/resultado/${selectedResultado.id_resultado}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (editResponse.ok) {
        fetchResultados();
        setShowEditModal(false);
        setEditFile(null);
      } else {
        console.error('Error editing resultado:', editResponse.statusText);
      }
    } catch (error) {
      console.error('Error editing resultado:', error);
    }
  };

  // Columnas para la tabla de resultados
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
      name: 'Resultado',
      cell: row => (
        <button className="btn btn-secondary btn-sm action-button" onClick={() => handleDownloadResult(row.resultado)}>
          <i className="fas fa-file-pdf"></i>
        </button>
      ),
      sortable: false,
    },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button className="btn btn-warning btn-sm action-button mr-2" onClick={() => handleEditResult(row)}>
            <i className="fas fa-edit"></i>
          </button>
          <button className="btn btn-danger btn-sm action-button" onClick={() => handleDeleteResult(row.id_resultado)}>
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="container mt-4">
      <h4>Resultados de Exámenes</h4>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25 mr-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredResultados}
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

      {/* Modal para editar resultado */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Resultado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Subir nuevo archivo PDF
              </Form.Label>
              <Form.Control type="file" onChange={(e) => setEditFile(e.target.files[0])} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="ml-2">
              Cancelar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ResultadosTabla;
