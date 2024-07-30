import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Table, Form, Row, Col } from 'react-bootstrap';

const RegistrarResultados = () => {
  const [paciente, setPaciente] = useState(null);
  const [medico, setMedico] = useState(null);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [analisisYExamenes, setAnalisisYExamenes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAnalisisId, setSelectedAnalisisId] = useState(null);
  const [selectedExamenId, setSelectedExamenId] = useState(null);

  useEffect(() => {
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

    const fetchPacientesConExamenes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token no encontrado en localStorage');
          return;
        }

        const response = await fetch('/api/mantenexamenes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPacientes(data.mantexamen);
        } else {
          setError('Error al obtener la lista de pacientes');
        }
      } catch (error) {
        console.error('Error al obtener la lista de pacientes:', error);
        setError('Error al obtener la lista de pacientes');
      }
    };

    fetchSession();
    fetchPacientesConExamenes();
  }, []);

  const handlePacienteSelect = async (paciente) => {
    setPaciente(paciente);
    setShowPacienteModal(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token no encontrado en localStorage');
      return;
    }

    try {
      const response = await fetch(`/api/mantenexamenes/${paciente.id_paciente}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedico(data.medico);
        setAnalisisYExamenes(data.analisisYExamenes);
      } else {
        setError('Error al obtener los análisis y exámenes del paciente');
      }
      
    } catch (error) {
      console.error('Error al obtener los análisis y exámenes del paciente:', error);
      setError('Error al obtener los análisis y exámenes del paciente');
    }
  };

  const filteredPacientes = pacientes.filter(p =>
    p.paciente.toLowerCase().includes(searchPaciente.toLowerCase())
  );

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleRegistrarResultados = async (id_realizar) => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('id_realizar', paciente.id_realizar);

    console.log(paciente.id_realizar)

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token no encontrado en localStorage');
      return;
    }

    try {
      const response = await fetch('/api/resultado', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Archivo subido exitosamente.');
        // Optionally reset the file input and other states
        setSelectedFile(null);
      } else {
        setError('Error al registrar los resultados.');
      }
    } catch (error) {
      console.error('Error al registrar los resultados:', error);
      setError('Error al registrar los resultados.');
    }
  };

  return (
    <div className="container mt-4">
      <h4>Registrar Resultados</h4>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Paciente</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                value={paciente ? paciente.paciente : ''}
                readOnly
              />
              <Button variant="primary" onClick={() => setShowPacienteModal(true)}>Buscar Paciente</Button>
            </div>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Médico Indica</Form.Label>
            <Form.Control
              type="text"
              value={medico ? medico.nombre_apellido : ''}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Análisis</th>
            <th>Examen</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {analisisYExamenes.map((item, index) => (
            <tr key={index}>
              <td>{item.analisis}</td>
              <td>{item.examen}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedAnalisisId(item.analisisId);
                    setSelectedExamenId(item.examenId);
                  }}
                >
                  Seleccionar
                </Button>
                {selectedAnalisisId === item.analisisId && selectedExamenId === item.examenId && (
                  <Form.Group>
                    <Form.Label>Subir Resultado (PDF)</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="primary"
                      className="mt-2"
                      onClick={() => handleRegistrarResultados(paciente.id_realizar)} // Pasar id_realizar al manejar el registro de resultados
                    >
                      Registrar Resultados
                    </Button>
                  </Form.Group>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showPacienteModal} onHide={() => setShowPacienteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Buscar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Buscar por Nombre o Cédula</Form.Label>
            <Form.Control
              type="text"
              value={searchPaciente}
              onChange={(e) => setSearchPaciente(e.target.value)}
            />
          </Form.Group>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((p) => (
                <tr key={p.cedula_paciente} onClick={() => handlePacienteSelect(p)} style={{ cursor: 'pointer' }}>
                  <td>{p.cedula_paciente}</td>
                  <td>{p.paciente}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPacienteModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RegistrarResultados;
