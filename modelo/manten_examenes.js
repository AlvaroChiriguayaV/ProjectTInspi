const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
const moment = require('moment-timezone');

// Endpoint para obtener exámenes según el análisis seleccionado
router.get('/', verificaToken, async (req, res) => {
  try {
    const [rows] = await (await Conexion).execute(
      'SELECT p.cedula AS cedula_paciente, p.paciente, m.nombre_apellido AS nombre_medico, re.fecha FROM realizar_examen re INNER JOIN pacientes p ON re.id_paciente = p.id_paciente INNER JOIN Medico m ON re.id_medico = m.id_medico GROUP BY p.cedula, p.paciente, m.nombre_apellido, re.fecha'
    );
    const mantexamen = rows.map(row => ({
      ...row,
      fecha: moment(row.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));
    res.json({ mantexamen: mantexamen });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// Endpoint para agregar un nuevo examen realizado

router.post('/', verificaToken, async (req, res) => {
  const { id_paciente, id_medico, examenes } = req.body;

  // Verifica que los parámetros requeridos no sean undefined
  if (!id_paciente || !id_medico || !examenes || !Array.isArray(examenes)) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    // Preparar los datos para la inserción
    const values = examenes.map(examen => [id_paciente, id_medico, examen.id_examen, examen.id_analisis]);

    // Construir la consulta SQL dinámica
    let sql = 'INSERT INTO realizar_examen (id_paciente, id_medico, id_examen, id_analisis) VALUES ';
    sql += values.map(() => '(?, ?, ?, ?)').join(', ');

    // Obtener los valores de la matriz para la inserción
    const flattenedValues = values.reduce((acc, val) => acc.concat(val), []);
    console.log(values)

    // Insertar los nuevos exámenes realizados en la base de datos
    const [result] = await (await Conexion).execute(sql, flattenedValues);

    // Respondemos con el ID del nuevo registro insertado
    res.json({ id_realizar: result.insertId });
  } catch (error) {
    console.error('Error al insertar examen realizado:', error);
    res.status(500).json({ error: 'Error al insertar examen realizado.' });
  }
});

router.delete('/:id', verificaToken, async (req, res) => {
  const userId = req.params.id;
  //const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  //const ip_usuario = getClientIp(req);
  //const accion = `Eliminó usuario: ${userId}`;

  try {
    
    await (await Conexion).execute('DELETE FROM Realizar_examen WHERE id_realizar = ?', [userId]);

    console.log(userId)

    //await registrarAuditoria(usuario_nombre, ip_usuario, accion);
    res.json({ success: true, message: 'Analisis eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});
module.exports = router;
