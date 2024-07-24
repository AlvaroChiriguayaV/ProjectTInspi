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
    console.log(paciente)

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
        console.log(data.medico);
        console.log(data.analisisYExamenes);
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

  const handleRegistrarResultados = (analisisId, examenId) => {
    // Aquí puedes implementar la lógica para registrar los resultados del examen
    console.log(`Registrar resultados para análisis ${analisisId}, examen ${examenId}`);
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
                <Button variant="primary" onClick={() => handleRegistrarResultados(item.analisisId, item.examenId)}>Registrar Resultados</Button>
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
