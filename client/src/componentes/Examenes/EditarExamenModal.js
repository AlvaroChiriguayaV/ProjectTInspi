import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';

const EditarExamenModal = ({ examen, onClose }) => {
  const [analisis, setAnalisis] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [selectedAnalisis, setSelectedAnalisis] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [analisisList, setAnalisisList] = useState([]);
  const [examenesList, setExamenesList] = useState([]);
  const [error, setError] = useState(null); // Error general de la tabla

  useEffect(() => {
    // Fetch analisis and examenes from API
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
            setAnalisisList(data.analisis);
           
  
          } else {
            setError('Error al obtener la lista de análisis');
          }
        } catch (error) {
          console.error('Error al obtener la lista de análisis:', error);
          setError('Error al obtener la lista de análisis');
        }
      };

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
            setExamenesList(examenesData.users);
            
          } else {
            console.error('Error fetching examenes:', examenesResponse.statusText);
          }
        } catch (error) {
          console.error('Error fetching examenes:', error);
        }
      };

    fetchAnalisis();
    fetchExamenes();
  }, []);

  const handleAddAnalisis = () => {
    if (selectedAnalisis) {
      setAnalisis([...analisis, selectedAnalisis]);
      setSelectedAnalisis('');
    }
  };

  const handleAddExamen = () => {
    if (selectedExamen) {
      setExamenes([...examenes, selectedExamen]);
      setSelectedExamen('');
    }
  };

  const handleDeleteAnalisis = (analisisToDelete) => {
    setAnalisis(analisis.filter(a => a !== analisisToDelete));
  };

  const handleDeleteExamen = (examenToDelete) => {
    setExamenes(examenes.filter(e => e !== examenToDelete));
  };

  const handleSave = async () => {
    // Save updated examen to the API
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mantenexamenes/${examen.id_realizar}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ analisis, examenes })
      });

      if (response.ok) {
        onClose();
      } else {
        console.error('Error saving examen:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving examen:', error);
    }
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Examen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="analisis">
            <Form.Label>Análisis</Form.Label>
            <Form.Control
              as="select"
              value={selectedAnalisis}
              onChange={(e) => setSelectedAnalisis(e.target.value)}
            >
              <option value="">Seleccionar análisis</option>
              {analisisList.map((analisis) => (
                <option key={analisis.id_analisis} value={analisis.analisis}>
                  {analisis.analisis}
                </option>
              ))}
            </Form.Control>
            <Button variant="secondary" onClick={handleAddAnalisis} className="mt-2">
              Agregar Análisis
            </Button>
          </Form.Group>
          <Form.Group controlId="examen">
            <Form.Label>Exámenes</Form.Label>
            <Form.Control
              as="select"
              value={selectedExamen}
              onChange={(e) => setSelectedExamen(e.target.value)}
            >
              <option value="">Seleccionar examen</option>
              {examenesList.map((examen) => (
                <option key={examen.id_examen} value={examen.examen}>
                  {examen.examen}
                </option>
              ))}
            </Form.Control>
            <Button variant="secondary" onClick={handleAddExamen} className="mt-2">
              Agregar Examen
            </Button>
          </Form.Group>
        </Form>
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Análisis</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {analisis.map((a, index) => (
              <tr key={index}>
                <td>{a}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDeleteAnalisis(a)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Exámenes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {examenes.map((e, index) => (
              <tr key={index}>
                <td>{e}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDeleteExamen(e)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditarExamenModal;
