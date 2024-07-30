const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');

// Obtener todos los resultados
router.get('/', verificaToken, async (req, res) => {
  try {
    const [rows] = await (await Conexion).execute(`
      SELECT r.id_resultado, r.resultado, p.cedula AS cedula_paciente, p.paciente, 
             m.nombre_apellido AS nombre_medico, 
             a.analisis, e.examen
      FROM resultado r
      JOIN realizar_examen re ON r.id_realizar = re.id_realizar
      JOIN pacientes p ON re.id_paciente = p.id_paciente
      JOIN medico m ON re.id_medico = m.id_medico
      JOIN analisis a ON re.id_analisis = a.id_analisis
      JOIN examenes e ON re.id_examen = e.id_examen
    `);
    
    res.json({ resultadosData: rows });
  } catch (error) {
    console.error('Error al obtener los resultados:', error);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
});

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// Subir un nuevo archivo
router.post('/', verificaToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const { id_realizar } = req.body;
  const filePath = req.file.path;

  try {
    await (await Conexion).execute(
      'INSERT INTO resultado (resultado, id_realizar) VALUES (?, ?)',
      [filePath, id_realizar]
    );

    res.json({ success: true, message: 'Archivo subido exitosamente.' });
  } catch (error) {
    console.error('Error al guardar el archivo en la base de datos:', error);
    res.status(500).json({ error: 'Error al guardar el archivo' });
  }
});

// Editar un resultado existente
router.put('/:id', verificaToken, upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const filePath = req.file ? req.file.path : null;

  try {
    if (filePath) {
      // Si hay un archivo, actualizamos el campo 'resultado'
      const query = 'UPDATE resultado SET resultado = ? WHERE id_resultado = ?';
      await (await Conexion).execute(query, [filePath, id]);
    } else {
      // Si no hay archivo, devolvemos un error
      return res.status(400).json({ error: 'No se ha proporcionado un archivo para actualizar el resultado' });
    }

    res.json({ success: true, message: 'Resultado actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el resultado en la base de datos:', error);
    res.status(500).json({ error: 'Error al actualizar el resultado' });
  }
});


// Eliminar un resultado existente
router.delete('/:id', verificaToken, async (req, res) => {
  const { id } = req.params;

  try {
    await (await Conexion).execute('DELETE FROM resultado WHERE id_resultado = ?', [id]);

    res.json({ success: true, message: 'Resultado eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el resultado de la base de datos:', error);
    res.status(500).json({ error: 'Error al eliminar el resultado' });
  }
});

module.exports = router;
