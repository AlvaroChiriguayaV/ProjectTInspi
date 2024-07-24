import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Table, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const RealizarExamenes = () => {
  const [paciente, setPaciente] = useState(null);
  const [medico, setMedico] = useState(null);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showMedicoModal, setShowMedicoModal] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [searchMedico, setSearchMedico] = useState('');
  const [analisis, setAnalisis] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [selectedAnalisis, setSelectedAnalisis] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [examenesSeleccionados, setExamenesSeleccionados] = useState([]);
  const navigate = useNavigate(); // Inicializa useNavigate

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

    const fetchPacientes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token no encontrado en localStorage');
          return;
        }

        const response = await fetch('/api/pacientes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPacientes(data.users);
        } else {
          setError('Error al obtener la lista de pacientes');
        }
      } catch (error) {
        console.error('Error al obtener la lista de pacientes:', error);
        setError('Error al obtener la lista de pacientes');
      }
    };

    const fetchMedicos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token no encontrado en localStorage');
          return;
        }

        const response = await fetch('/api/medico', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMedicos(data.medicos);
        } else {
          setError('Error al obtener la lista de médicos');
        }
      } catch (error) {
        console.error('Error al obtener la lista de médicos:', error);
        setError('Error al obtener la lista de médicos');
      }
    };

    fetchSession();
    fetchPacientes();
    fetchMedicos();
  }, []);

  useEffect(() => {
    const fetchAnalisis = async () => {
      if (!medico) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token no encontrado en localStorage');
          return;
        }

        const response = await fetch(`/api/analisis?especialidad=${medico.nombre}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalisis(data.analisis);
          setSelectedAnalisis('');
          setSelectedExamen('');
          setExamenes([]);
        } else {
          setError('Error al obtener la lista de análisis');
        }
      } catch (error) {
        console.error('Error al obtener la lista de análisis:', error);
        setError('Error al obtener la lista de análisis');
      }
    };

    fetchAnalisis();
  }, [medico]);

  useEffect(() => {
    const fetchExamenes = async () => {
      if (!selectedAnalisis) {
        setExamenes([]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token no encontrado en localStorage');
          return;
        }

        const response = await fetch(`/api/examenes/${selectedAnalisis}/examenes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setExamenes(data);
          setError(null);
        
        } else {
          setError('Error al obtener la lista de exámenes');
        }
      } catch (error) {
        console.error('Error al obtener la lista de exámenes:', error);
        setError('Error al obtener la lista de exámenes');
      }
    };

    fetchExamenes();
  }, [selectedAnalisis]);

  const handlePacienteSelect = (paciente) => {
    setPaciente(paciente);
    setShowPacienteModal(false);
  };

  const handleMedicoSelect = (medico) => {
    setMedico(medico);
    setShowMedicoModal(false);
  };

  const filteredPacientes = pacientes.filter(p =>
    p.paciente.toLowerCase().includes(searchPaciente.toLowerCase())
  );

  const filteredMedicos = medicos.filter(m =>
    m.nombre_apellido.toLowerCase().includes(searchMedico.toLowerCase())
  );

  const handleAgregarExamen = () => {
    if (selectedAnalisis && selectedExamen) {
      const analisisSeleccionado = analisis.find(a => a.id_analisis === parseInt(selectedAnalisis));
      const examenSeleccionado = examenes.find(e => e.id_examen === parseInt(selectedExamen));

      if (analisisSeleccionado && examenSeleccionado) {
        setExamenesSeleccionados([
          ...examenesSeleccionados,
          { 
            id_analisis: analisisSeleccionado.id_analisis,
            analisis: analisisSeleccionado.analisis,
            id_examen: examenSeleccionado.id_examen,
            examen: examenSeleccionado.examen 
          }
        ]);
        setSelectedAnalisis('');
        setSelectedExamen('');
      } else {
        setError('No se encontró el análisis o examen seleccionado.');
      }
    }
  };

  const handleEliminarExamen = (index) => {
    const newExamenesSeleccionados = [...examenesSeleccionados];
    newExamenesSeleccionados.splice(index, 1);
    setExamenesSeleccionados(newExamenesSeleccionados);
  };

  const handleRegistrarExamenes = async () => {
    if (!paciente || !medico || !examenesSeleccionados.length) {
      alert('Debe seleccionar un paciente, un médico y agregar al menos un examen.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token no encontrado en localStorage');
      return;
    }
  
    try {
      const response = await fetch('/api/mantenexamenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_paciente: paciente.id_paciente,
          id_medico: medico.id_medico,
          examenes: examenesSeleccionados.map(e => ({ 
            id_examen: e.id_examen,
            id_analisis: e.id_analisis
          })),
        })
      });
      
      if (response.ok) {
        setExamenesSeleccionados([]);
        setPaciente(null);
        setMedico(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error en la operación.');
      }
    } catch (error) {
      console.error('Error en la operación:', error);
      setError('Error en la operación.');
    }
  };

  return (
    <div className="container mt-4">
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="secondary" onClick={() => navigate('/mantenimientoExamen')}>Atrás</Button>
      </div> */}
      <h4>Realizar Exámenes</h4>
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
            <Form.Label>Médico</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                value={medico ? medico.nombre_apellido : ''}
                readOnly
              />
              <Button variant="primary" onClick={() => setShowMedicoModal(true)}>Buscar Médico</Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Análisis</Form.Label>
            <Form.Control
              as="select"
              value={selectedAnalisis}
              onChange={(e) => setSelectedAnalisis(e.target.value)}
              disabled={!analisis.length}
            >
              <option value="">Seleccione un análisis</option>
              {analisis.map((a) => (
                <option key={a.id_analisis} value={a.id_analisis}>
                  {a.analisis}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Exámenes</Form.Label>
            <Form.Control
              as="select"
              value={selectedExamen}
              onChange={(e) => setSelectedExamen(e.target.value)}
              disabled={!selectedAnalisis}
            >
              <option value="">Seleccione un examen</option>
              {examenes.map((e) => (
                <option key={e.id_examen} value={e.id_examen}>
                  {e.examen}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Button variant="success" onClick={handleAgregarExamen} disabled={!selectedAnalisis || !selectedExamen}>Agregar Examen</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Análisis</th>
            <th>Examen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {examenesSeleccionados.map((examen, index) => (
            <tr key={index}>
              <td>{examen.analisis}</td>
              <td>{examen.examen}</td>
              <td>
                <Button variant="danger" onClick={() => handleEliminarExamen(index)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleRegistrarExamenes} disabled={!examenesSeleccionados.length}>Registrar Exámenes</Button>

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
                <tr key={p.cedula} onClick={() => handlePacienteSelect(p)} style={{ cursor: 'pointer' }}>
                  <td>{p.cedula}</td>
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

      <Modal show={showMedicoModal} onHide={() => setShowMedicoModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Buscar Médico</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Buscar por Nombre o Cédula</Form.Label>
            <Form.Control
              type="text"
              value={searchMedico}
              onChange={(e) => setSearchMedico(e.target.value)}
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
              {filteredMedicos.map((m) => (
                <tr key={m.cedula} onClick={() => handleMedicoSelect(m)} style={{ cursor: 'pointer' }}>
                  <td>{m.cedula}</td>
                  <td>{m.nombre_apellido}</td>
                  
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMedicoModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RealizarExamenes;
