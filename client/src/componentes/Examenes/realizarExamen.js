import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Table, Form, Row, Col } from 'react-bootstrap';

const RealizarExamenes = () => {
  const [cedulaPaciente, setCedulaPaciente] = useState('');
  const [cedulaMedico, setCedulaMedico] = useState('');
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

    const fetchAnalisis = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token no encontrado en localStorage');
          return;
        }

        const response = await fetch('/api/analisis', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalisis(data.users);
         

        } else {
          setError('Error al obtener la lista de análisis');
        }
      } catch (error) {
        console.error('Error al obtener la lista de análisis:', error);
        setError('Error al obtener la lista de análisis');
      }
    };

    fetchSession();
    fetchPacientes();
    fetchMedicos();
    fetchAnalisis();
  }, []);

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
    setCedulaPaciente(paciente.cedula);
    setPaciente(paciente);
    setShowPacienteModal(false);
  };

  const handleMedicoSelect = (medico) => {
    setCedulaMedico(medico.cedula);
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
          { analisis: analisisSeleccionado.analisis, examen: examenSeleccionado.examen }
        ]);
        setSelectedAnalisis('');
        setSelectedExamen('');
      } else {
        setError('No se encontró el análisis o examen seleccionado.');
      }
    }
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
            id_examen: selectedExamen, //parseInt(examenes.id_examen),  // Asegúrate de tener el campo id_examen correctamente
            id_analisis: selectedAnalisis //parseInt(analisis.id_analisis)  // Asegúrate de tener el campo id_analisis correctamente
          
          })),
        })
      });
      console.log(paciente)
      console.log(selectedAnalisis)
      console.log(examenesSeleccionados)
      
  
      if (response.ok) {
        setExamenesSeleccionados([]);
        setCedulaPaciente('');
        setCedulaMedico('');
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
      <h4>Realizar Exámenes</h4>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Cédula del Paciente</Form.Label>
            <Form.Control
              type="text"
              value={cedulaPaciente}
              onChange={(e) => setCedulaPaciente(e.target.value)}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Paciente</Form.Label>
            <Form.Control
              type="text"
              value={paciente ? paciente.paciente : ''}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button className="btn btn-success mr-2" onClick={() => setShowPacienteModal(true)}>
            <i className="fa-solid fa-magnifying-glass"></i> Buscar
          </Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Cédula del Médico</Form.Label>
            <Form.Control
              type="text"
              value={cedulaMedico}
              onChange={(e) => setCedulaMedico(e.target.value)}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Médico</Form.Label>
            <Form.Control
              type="text"
              value={medico ? medico.nombre_apellido : ''}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button className="btn btn-success mr-2" onClick={() => setShowMedicoModal(true)}>
            <i className="fa-solid fa-magnifying-glass"></i> Buscar
          </Button>
        </Col>
      </Row>
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Análisis</Form.Label>
            <select className="form-control" onChange={(e) => setSelectedAnalisis(e.target.value)} value={selectedAnalisis}>
              <option value="">Seleccionar Análisis</option>
              {analisis.map((a) => (
                <option key={a.id_analisis} value={a.id_analisis}>{a.analisis}</option>
              ))}
            </select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Examen</Form.Label>
            <select className="form-control" value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)} disabled={!selectedAnalisis}>
              <option value="">Seleccionar Examen</option>
              {examenes.map((e) => (
                <option key={e.id_examen} value={e.id_examen}>{e.examen}</option>
              ))}
            </select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Button className="btn btn-danger mb-2" onClick={handleAgregarExamen} disabled={!selectedAnalisis || !selectedExamen}>
            <i className="fas fa-plus"></i> Agregar
          </Button>
        </Col>
      </Row>
      <Row className="mb-3 justify-content-center">
        <Col md={12}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Análisis</th>
                <th>Examen</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {examenesSeleccionados.map((examen, index) => (
                <tr key={index}>
                  <td>{examen.analisis}</td>
                  <td>{examen.examen}</td>
                  <td>
                    <Button variant="danger" onClick={() => setExamenesSeleccionados(examenesSeleccionados.filter((_, i) => i !== index))}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mb-3 justify-content-center">
        <Col md={4}>
          <Button className="btn btn-success btn-block" onClick={handleRegistrarExamenes} disabled={examenesSeleccionados.length === 0}>
            Registrar Realización Exámenes
          </Button>
        </Col>
      </Row>

      {/* Modal de Pacientes */}
      <Modal show={showPacienteModal} onHide={() => setShowPacienteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="text"
              value={searchPaciente}
              onChange={(e) => setSearchPaciente(e.target.value)}
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Paciente</th>
                <th>Seleccionar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.cedula}>
                  <td>{paciente.cedula}</td>
                  <td>{paciente.paciente}</td>
                  <td>
                    <Button variant="primary" onClick={() => handlePacienteSelect(paciente)}>Seleccionar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Modal de Médicos */}
      <Modal show={showMedicoModal} onHide={() => setShowMedicoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar Médico</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="text"
              value={searchMedico}
              onChange={(e) => setSearchMedico(e.target.value)}
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre y Apellido</th>
                <th>Seleccionar</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicos.map((medico) => (
                <tr key={medico.cedula}>
                  <td>{medico.cedula}</td>
                  <td>{medico.nombre_apellido}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleMedicoSelect(medico)}>Seleccionar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RealizarExamenes;
