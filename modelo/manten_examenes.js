const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
const moment = require('moment-timezone');

// Endpoint para obtener exámenes según el análisis seleccionado
router.get('/', verificaToken, async (req, res) => {
  try {
    const [rows] = await (await Conexion).execute(
      'SELECT re.id_realizar, re.id_paciente, p.cedula AS cedula_paciente, p.paciente, m.nombre_apellido AS nombre_medico, re.fecha FROM realizar_examen re INNER JOIN pacientes p ON re.id_paciente = p.id_paciente INNER JOIN Medico m ON re.id_medico = m.id_medico GROUP BY p.cedula, p.paciente, m.nombre_apellido, re.fecha'
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

// Endpoint para eliminar un examen realizado
router.delete('/:id', verificaToken, async (req, res) => {
  const examenId = req.params.id;

  try {
    // Verifica que el examenId no es undefined
    if (!examenId) {
      return res.status(400).json({ error: 'ID del examen no proporcionado.' });
    }

    await (await Conexion).execute('DELETE FROM realizar_examen WHERE id_realizar = ?', [examenId]);

    console.log('Examen eliminado con ID:', examenId);

    res.json({ success: true, message: 'Examen eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting examen:', error);
    res.status(500).json({ error: 'Error al eliminar examen.' });
  }
});

// Endpoint para editar un examen realizado
router.put('/:id', verificaToken, async (req, res) => {
  const examenId = req.params.id;
  const { id_paciente, id_medico, id_examen, id_analisis, fecha } = req.body;

  // Verifica que los parámetros requeridos no sean undefined
  if (!id_paciente || !id_medico || !id_examen || !id_analisis || !fecha) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    // Actualizar el examen realizado en la base de datos
    const [result] = await (await Conexion).execute(
      'UPDATE realizar_examen SET id_paciente = ?, id_medico = ?, id_examen = ?, id_analisis = ?, fecha = ? WHERE id_realizar = ?',
      [id_paciente, id_medico, id_examen, id_analisis, fecha, examenId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Examen no encontrado.' });
    }

    res.json({ success: true, message: 'Examen actualizado correctamente.' });
  } catch (error) {
    console.error('Error updating examen:', error);
    res.status(500).json({ error: 'Error al actualizar examen.' });
  }
});

// Nuevo endpoint para obtener médico y análisis/exámenes según el paciente seleccionado
router.get('/:id', verificaToken, async (req, res) => {

  const id_paciente = req.params.id;

  try {
    const [medicoResult] = await (await Conexion).execute(
      'SELECT m.nombre_apellido FROM realizar_examen re INNER JOIN Medico m ON re.id_medico = m.id_medico WHERE re.id_paciente = ?',
      [id_paciente]
    );

    console.log(id_paciente);

    if (medicoResult.length === 0) {
      return res.status(404).json({ error: 'Médico no encontrado para el paciente proporcionado.' });
    }

    const medico = medicoResult[0];

    const [analisisYExamenesResult] = await (await Conexion).execute(
      'SELECT a.analisis, e.examen FROM realizar_examen re INNER JOIN analisis a ON re.id_analisis = a.id_analisis INNER JOIN examenes e ON re.id_examen = e.id_examen WHERE re.id_paciente = ?',
      [id_paciente]
    );

    res.json({ medico, analisisYExamenes: analisisYExamenesResult });
  } catch (error) {
    console.error('Error fetching médico and análisis/exámenes:', error);
    res.status(500).json({ error: 'Error al obtener médico y análisis/exámenes.' });
  }
});

module.exports = router;

