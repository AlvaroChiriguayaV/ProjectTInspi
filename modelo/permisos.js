const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');

// Endpoint para obtener todos los permisos
router.get('/', verificaToken, async (req, res) => {
  try {
    const [permisos] = await (await Conexion).execute('SELECT id_permiso, nombre_permiso, categoria, descripcion FROM Permisos');
    res.json({ permisos });
  } catch (error) {
    console.error('Error fetching permisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos.' });
  }
});

module.exports = router;
