const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
const moment = require('moment-timezone');

// Endpoint para obtener todos los detalles de exámenes
router.get('/', verificaToken, async (req, res) => {
  try {
    const [rows] = await (await Conexion).execute(
      `SELECT ed.*, e.examen FROM examen_detalle ed
       INNER JOIN examenes e ON ed.id_examen = e.id_examen`
    );
    res.json({ detalles: rows});
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ error: 'Error al obtener detalles de exámenes.' });
  }
});

router.post('/', verificaToken, async (req, res) => {
    const {id_examen, detalle, unidad, valor_referencia } = req.body;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    //const ip_usuario = getClientIp(req);
    //const accion = `Creó Usuario con Cédula: ${cedula}`;
  
   
    try {
  
      await (await Conexion).execute(
        'INSERT INTO examen_detalle (id_examen, detalle, unidad, valor_referencia)  VALUES (?, ?, ?, ?)',
        [id_examen, detalle, unidad, valor_referencia]
      );
  
      res.json({ success: true, message: 'Paciente creado correctamente.' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error al crear usuario.' });
    }
  
  });

  // Endpoint para editar un usuario
router.put('/:id', verificaToken, async (req, res) => {
    const id_detalle = req.params.id;
    const {id_examen, detalle, unidad, valor_referencia } = req.body;
  
    try {
   
      await (await Conexion).execute(
        'UPDATE examen_detalle SET id_examen = ?, detalle = ?, unidad = ?, valor_referencia = ? WHERE id_detalle = ?;',
        [id_examen, detalle, unidad, valor_referencia, id_detalle]
      );

      console.log(id_detalle);
  
      //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
  
      res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Error al actualizar usuario.' });
    }
    
  });
  router.delete('/:id', verificaToken, async (req, res) => {
    const userId = req.params.id;
    const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
    //const ip_usuario = getClientIp(req);
    //const accion = `Eliminó usuario: ${userId}`;
  
    try {
      
      await (await Conexion).execute('DELETE FROM examen_detalle WHERE id_detalle = ?', [userId]);

      console.log(userId);
  
      //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
      res.json({ success: true, message: 'Analisis eliminado correctamente.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  });
  

module.exports = router;