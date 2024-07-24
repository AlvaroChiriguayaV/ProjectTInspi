const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
const getClientIp = require('request-ip').getClientIp;



router.get('/', verificaToken, async (req, res) => {
    try {
      const [rows] = await (await Conexion).execute(
        'SELECT * FROM Especialidad'
      );

      res.json({ especialidades: rows });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
  });

  // Endpoint para crear un nuevo analisis
router.post('/', verificaToken, async (req, res) => {
    const {nombre} = req.body;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    const ip_usuario = getClientIp(req);
    //const accion = `Creó Usuario con Cédula: ${cedula}`;
  
   
    try {
  
      await (await Conexion).execute(
        'INSERT INTO especialidad (nombre) VALUES (?)',
        [nombre]
      );
  
      res.json({ success: true, message: 'especialidad creado correctamente.' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear especialidad.' });
    }
  
    
  });

  // Endpoint para eliminar un usuario
router.delete('/:id', verificaToken, async (req, res) => {
    const userId = req.params.id;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    const ip_usuario = getClientIp(req);
    const accion = `Eliminó usuario: ${userId}`;
  
    try {
      
      await (await Conexion).execute('DELETE FROM especialidad WHERE id_especialidad = ?', [userId]);
  
      //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
      res.json({ success: true, message: 'Analisis eliminado correctamente.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  });
// Endpoint para editar un usuario
  router.put('/:id', verificaToken, async (req, res) => {
    const userId = req.params.id;
    const {nombre} = req.body;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    const ip_usuario = getClientIp(req);
    const accion = `Editó Usuario: ${userId}`;
  
    try {
   
      await (await Conexion).execute(
        'UPDATE especialidad SET nombre = ?  WHERE id_especialidad = ?',
        [nombre, userId]
      );
  
      //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
  
      res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Error al actualizar usuario.' });
    }
    
  });

  

  module.exports = router;