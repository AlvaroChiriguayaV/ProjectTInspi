import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Uri from '../../enviroment/enviroment';

const PermissionModal = ({ isOpen, onClose, onSave }) => {
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    nombre_permiso: '',
    categoria: '',
    descripcion: ''
  });

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }
      const response = await fetch(Uri+'api/permisos', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permisos); // Assuming the response contains a list of permissions
      } else {
        console.error('Error fetching permissions:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(Uri+'api/permisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newPermission = await response.json();
        onSave(newPermission);
        onClose(); // Close the modal after saving
      } else {
        console.error('Error creating permission:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Permiso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Nombre del Permiso</Form.Label>
            <Form.Control
              type="text"
              name="nombre_permiso"
              value={formData.nombre_permiso}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermissionModal;
