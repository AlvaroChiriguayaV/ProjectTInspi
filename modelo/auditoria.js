const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
const moment = require('moment-timezone');

// Endpoint para obtener todos los registros de auditoría
router.get('/', verificaToken, async (req, res) => {
  try {
    const [rows] = await (await Conexion).execute('SELECT * FROM auditoria');

    // Convertir las fechas al formato deseado
    const auditoriaData = rows.map(row => ({
      ...row,
      fecha: moment(row.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    res.json({ auditoria: auditoriaData });
  } catch (error) {
    console.error('Error al obtener auditoría:', error);
    res.status(500).json({ error: 'Error al obtener auditoría.' });
  }
});

module.exports = router;