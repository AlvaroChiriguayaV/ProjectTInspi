const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { hashPassword, comparePassword, generateToken, verificaToken, revokeToken } = require('./auth');
const getClientIp = require('request-ip').getClientIp;

const registrarAuditoria = async (usuarioNombre, ipUsuario, accion) => {
  try {
    await (await Conexion).execute(`
      INSERT INTO auditoria (usuario_nombre, ip_usuario, accion)
      VALUES (?, ?, ?)
    `, [usuarioNombre, ipUsuario, accion]);
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
};
// Endpoint de inicio de sesión
router.post('/login', async (req, res) => {
  const { cedula, contraseña } = req.body;

  if (!cedula || !contraseña) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const [rows] = await (await Conexion).execute(
      'SELECT * FROM Usuario WHERE cedula = ?',
      [cedula]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const usuario = rows[0];
    const passwordMatch = await comparePassword(contraseña, usuario.contraseña);

    if (passwordMatch) {
      const token = generateToken(usuario);
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
  } catch (error) {
    console.error('Error al autenticar:', error);
    return res.status(500).json({ error: 'Error al autenticar usuario.' });
  }
});

// Endpoint para verificar sesión y obtener permisos del usuario
router.get('/session', verificaToken, async (req, res) => {
  try {
    const { cedula, email, name, rol } = req.user;
    const [rows] = await (await Conexion).execute(
      'SELECT rp.id_permiso FROM Roles_Permisos rp WHERE rp.id_rol = ?',
      [rol]
    );

    const permissions = rows.map(row => row.id_permiso);

    res.json({ user: { cedula, name, email, rol, permissions } });
   
  } catch (error) {
    console.error('Error al obtener información de sesión:', error);
    res.status(500).json({ error: 'Error al obtener información de sesión.' });
  }
});

module.exports = router;

// Endpoint para cerrar sesión
router.post('/logout', verificaToken, (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    revokeToken(token);
    res.json({ success: true, message: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ error: 'Error al cerrar sesión.' });
  }
});

// Endpoint para obtener todos los usuarios
router.get('/users', verificaToken, async (req, res) => {
  try {
    const [rows] = await (await Conexion).execute(
      'SELECT u.cedula, u.nombre, u.correo_electronico, r.nombre AS rol FROM Usuario u JOIN Rol r ON u.rol_id = r.id_rol'
    );
    res.json({ users: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// Endpoint para crear un nuevo usuario
router.post('/users', verificaToken, async (req, res) => {
  const { cedula, nombre, correo_electronico, contraseña, rol_id } = req.body;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Creó Usuario con Cédula: ${cedula}`;

 
  try {

    const rolIdNumerico = Number(rol_id);

    if (rolIdNumerico === 1) {
      return res.status(403).json({ error: 'No se pueden crear usuarios con rol 1 Administrador.' });
    }

    const [existingUserRows] = await (await Conexion).execute(
      'SELECT * FROM Usuario WHERE cedula = ?',
      [cedula]
    );

    if (existingUserRows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con el mismo número de cédula.' });
    }

    const hashedPassword = await hashPassword(contraseña);

    await (await Conexion).execute(
      'INSERT INTO Usuario (cedula, nombre, correo_electronico, contraseña, rol_id) VALUES (?, ?, ?, ?, ?)',
      [cedula, nombre, correo_electronico, hashedPassword, rol_id]
    );

    
    await registrarAuditoria(usuario_nombre, ip_usuario, accion);

    console.log(usuario_nombre);
    console.log(ip_usuario);

    res.json({ success: true, message: 'Usuario creado correctamente.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error al crear usuario.' });
  }

  
});

// Endpoint para eliminar un usuario
router.delete('/users/:id', verificaToken, async (req, res) => {
  const userId = req.params.id;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Eliminó usuario: ${userId}`;

  try {
    const [userRows] = await (await Conexion).execute(
      'SELECT rol_id FROM Usuario WHERE cedula = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const userRol = userRows[0].rol_id;

    if (userRol === 1) {
      return res.status(403).json({ error: 'No se puede eliminar a un usuario con rol Administrador.' });
    }

    await (await Conexion).execute('DELETE FROM Usuario WHERE cedula = ?', [userId]);

    await registrarAuditoria(usuario_nombre, ip_usuario, accion);
    res.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

// Endpoint para editar un usuario
router.put('/users/:id', verificaToken, async (req, res) => {
  const userId = req.params.id;
  const { nombre, correo_electronico, rol_id } = req.body;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Editó Usuario: ${userId}`;

  try {
    // Verificar el rol del usuario antes de editar
    const [userRows] = await (await Conexion).execute(
      'SELECT rol_id FROM Usuario WHERE cedula = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const userRol = userRows[0].rol_id;
    const rolIdNumerico = Number(rol_id);

    if (rolIdNumerico === 1) {
      return res.status(403).json({ error: 'No se puede asignar el rol 1 Administrador a un usuario.' });
    }
    

    // Verificar si se está intentando cambiar el rol de un usuario con rol 1
    if (userRol === 1 && rol_id !== userRol) {
      return res.status(403).json({ error: 'No se puede cambiar el rol de un usuario con rol 1 Administrador.' });
    }

    await (await Conexion).execute(
      'UPDATE Usuario SET nombre = ?, correo_electronico = ?, rol_id = ? WHERE cedula = ?',
      [nombre, correo_electronico, userRol === 1 ? userRol : rol_id, userId]
    );

    await registrarAuditoria(usuario_nombre, ip_usuario, accion);

    res.json({ success: true, message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error al actualizar usuario.' });
  }
  
});

// Endpoint para editar la contraseña de un usuario
router.put('/users/:id/password', verificaToken, async (req, res) => {
  const userId = req.params.id;
  const { nuevaContraseña, confirmarContraseña } = req.body;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Reseteo Contraseña de Usuario: ${userId}`;

  if (nuevaContraseña !== confirmarContraseña) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  }

  try {
    const hashedPassword = await hashPassword(nuevaContraseña);

    await (await Conexion).execute(
      'UPDATE Usuario SET contraseña = ? WHERE cedula = ?',
      [hashedPassword, userId]
    );

    await registrarAuditoria(usuario_nombre, ip_usuario, accion);

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }
});

module.exports = router;
