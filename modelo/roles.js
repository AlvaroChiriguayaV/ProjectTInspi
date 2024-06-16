const express = require('express');
const router = express.Router();
const Conexion = require('../controlador/conexion');
const { verificaToken } = require('./auth');
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
// Endpoint para obtener todos los roles
router.get('/', verificaToken, async (req, res) => {
  try {
    const [roles] = await (await Conexion).execute('SELECT id_rol, nombre FROM Rol');
    const rolesWithPermissions = await Promise.all(roles.map(async (role) => {
      const [permisos] = await (await Conexion).execute(
        'SELECT p.id_permiso, p.nombre_permiso AS permiso_nombre FROM Permisos p JOIN Roles_Permisos rp ON p.id_permiso = rp.id_permiso WHERE rp.id_rol = ?',
        [role.id_rol]
      );
      return { ...role, permisos };
    }));

    res.json({ roles: rolesWithPermissions });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Error al obtener roles.' });
  }
});

// Endpoint para crear un nuevo rol con permisos
router.post('/', verificaToken, async (req, res) => {
  const { nombre, permisos } = req.body;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Creó Rol: ${nombre}`;

  try {
    const [result] = await (await Conexion).execute(
      'INSERT INTO Rol (nombre) VALUES (?)',
      [nombre]
    );
    const rolId = result.insertId;

    if (permisos && permisos.length > 0) {
      const permisosValues = permisos.map(permisoId => [rolId, permisoId]);
      await (await Conexion).query(
        'INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES ?',
        [permisosValues]
      );
    }
    await registrarAuditoria(usuario_nombre, ip_usuario, accion);

    res.json({ success: true, message: 'Rol creado correctamente.' });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Error al crear rol.' });
  }
});

// Endpoint para editar un rol con permisos
router.put('/:id', verificaToken, async (req, res) => {
  const roleId = req.params.id;
  const { nombre, permisos } = req.body;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Editó Rol: ${nombre}`;

  try {
    await (await Conexion).execute(
      'UPDATE Rol SET nombre = ? WHERE id_rol = ?',
      [nombre, roleId]
    );

    await (await Conexion).execute('DELETE FROM Roles_Permisos WHERE id_rol = ?', [roleId]);

    if (permisos && permisos.length > 0) {
      const permisosValues = permisos.map(permisoId => [roleId, permisoId]);
      await (await Conexion).query(
        'INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES ?',
        [permisosValues]
      );
    }
    await registrarAuditoria(usuario_nombre, ip_usuario, accion);

    res.json({ success: true, message: 'Rol actualizado correctamente.' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Error al actualizar rol.' });
  }
});

// Endpoint para eliminar un rol con sus permisos
router.delete('/:id', verificaToken, async (req, res) => {
  const roleId = req.params.id;
  const { nombre, permisos} = req.body;
  const usuario_nombre = req.user.name; // Asumiendo que el middleware verificaToken añade el nombre del usuario logueado a req.user
  const ip_usuario = getClientIp(req);
  const accion = `Eliminó Rol: ${roleId}`;

  try {
    const [[usersWithRole]] = await (await Conexion).execute(
      'SELECT COUNT(*) AS count FROM Usuario INNER JOIN Rol ON Usuario.rol_id = Rol.id_rol WHERE Rol.id_rol = ?',
      [roleId]
    );

    if (usersWithRole.count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el rol porque está asignado a uno o más usuarios.' });
    }

    await (await Conexion).execute('DELETE FROM Roles_Permisos WHERE id_rol = ?', [roleId]);
    await (await Conexion).execute('DELETE FROM Rol WHERE id_rol = ?', [roleId]);

    await registrarAuditoria(usuario_nombre, ip_usuario, accion);
    
    res.json({ success: true, message: 'Rol eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error al eliminar rol.' });
  }
});

module.exports = router;
