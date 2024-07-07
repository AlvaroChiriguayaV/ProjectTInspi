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
// Endpoint para crear  los permisos
router.post('/', verificaToken, async (req, res) => {
  const { nombre_permiso, categoria, descripcion } = req.body;
  try {
    const [result] = await (await Conexion).execute(
      'INSERT INTO Permisos (nombre_permiso, descripcion, categoria ) VALUES (?, ?, ?)',
      [nombre_permiso, descripcion, categoria]
    );
    const newPermission = {
      id_permiso: result.insertId,
      nombre_permiso,
      descripcion,
      categoria
    };
    res.status(201).json(newPermission);
  } catch (error) {
    console.error('Error creating permiso:', error);
    res.status(500).json({ error: 'Error al crear permiso.' });
  }
});

// Nuevo endpoint para obtener todas las categorías de permisos
/* router.get('/categorias', verificaToken, async (req, res) => {
  try {
    const [categorias] = await (await Conexion).execute('SELECT rp.id_permiso FROM Roles_Permisos rp JOIN Rol r ON rp.id_rol = r.id_rol WHERE r.id_rol = ?');
    res.json({ categorias });

    console.log(categorias)
  } catch (error) {
    console.error('Error fetching categorias de permisos:', error);
    res.status(500).json({ error: 'Error al obtener categorias de permisos.' });
  }
});  */

// Nuevo endpoint para obtener todas las categorías de permisos según el rol del usuario
router.get('/categorias', verificaToken, async (req, res) => {
  try {
    const { rol } = req.user; // Asegúrate de que el rol está disponible en req.user
    const [rows] = await (await Conexion).execute(
      'SELECT p.id_permiso, p.categoria FROM Roles_Permisos rp JOIN Permisos p ON rp.id_permiso = p.id_permiso WHERE rp.id_rol = ?',
      [rol]
    );

    const permissions = rows.map(row => ({
      id_permiso: row.id_permiso,
      categoria: row.categoria
    }));

    res.json({ permissions });
  } catch (error) {
    console.error('Error al obtener categorías de permisos:', error);
    res.status(500).json({ error: 'Error al obtener categorías de permisos.' });
  }
});

module.exports = router;



