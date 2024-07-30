const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
const getClientIp = require('request-ip').getClientIp;
const moment = require('moment-timezone');


router.get('/', verificaToken, async (req, res) => {
    try {
      const [rows] = await (await Conexion).execute(
        'SELECT * FROM Pacientes'
      );

      const paciente = rows.map(row => ({
        ...row,
        fecha: moment(row.fecha).format('YYYY-MM-DD HH:mm:ss')
      }));
      res.json({ users: paciente });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
  });

  // Endpoint para crear un nuevo usuario
router.post('/', verificaToken, async (req, res) => {
    const { cedula, paciente, edad, sexo, celular} = req.body;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    const ip_usuario = getClientIp(req);
    const accion = `Creó Usuario con Cédula: ${cedula}`;
  
   
    try {
  
      
  
      const [existingUserRows] = await (await Conexion).execute(
        'SELECT * FROM Pacientes WHERE cedula = ?',
        [cedula]
      );
  
      if (existingUserRows.length > 0) {
        return res.status(400).json({ error: 'Ya existe un paciente con el mismo número de cédula.' });
      }
  
      
  
      await (await Conexion).execute(
        'INSERT INTO Pacientes (cedula, paciente, edad, sexo, celular) VALUES (?, ?, ?, ?, ?)',
        [cedula, paciente, edad, sexo, celular]
      );
  
      res.json({ success: true, message: 'Paciente creado correctamente.' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear usuario.' });
    }
  
    
  });

  // Endpoint para eliminar un usuario
router.delete('/:id', verificaToken, async (req, res) => {
    const userId = req.params.id;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    const ip_usuario = getClientIp(req);
    const accion = `Eliminó usuario: ${userId}`;
  
    try {
      
      await (await Conexion).execute('DELETE FROM Pacientes WHERE cedula = ?', [userId]);
  
      //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
      res.json({ success: true, message: 'Paciente eliminado correctamente.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  });

  router.put('/:id', verificaToken, async (req, res) => {
    const userId = req.params.id;
    const {paciente, edad, sexo, celular} = req.body;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    const ip_usuario = getClientIp(req);
    const accion = `Editó Usuario: ${userId}`;
  
    try {
   
      await (await Conexion).execute(
        'UPDATE Pacientes SET paciente = ?, edad = ?, sexo = ?, celular = ?  WHERE cedula = ?',
        [paciente, edad, sexo, celular, userId]
      );
  
      //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
  
      res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Error al actualizar usuario.' });
    }
    
  });

  // Endpoint buscar paciente
  router.get('/:id', verificaToken, async (req, res) => {
    const userId = req.params.id; // Esta variable no parece ser utilizada en la consulta
    const { cedula } = req.query; // Cambiado req.body a req.query para obtener parámetros de la URL
  
    try {
      // Realizar la consulta para verificar si existe el paciente con la cédula proporcionada
      const [rows] = await (await Conexion).execute('SELECT cedula, paciente FROM Pacientes WHERE cedula = ?', [userId]);
  
      if (rows.length === 1) {
        res.json({ success: true, cedula: rows[0].cedula, paciente: rows[0].paciente, message: 'Paciente encontrado correctamente.' });
      } else {
        res.status(404).json({ error: 'Paciente no encontrado.' });
      }
    } catch (error) {
      console.error('Error al buscar paciente:', error);
      res.status(500).json({ error: 'Error al buscar paciente.' });
    }
  });
  
  module.exports = router;