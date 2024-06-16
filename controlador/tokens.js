const jwt = require('jsonwebtoken');

const tokensRevocados = new Set(); // Conjunto para almacenar tokens revocados

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      cedula: user.cedula,
      email: user.correo_electronico,
      name: user.nombre,
      rol: user.rol_id
    },
    'tu_clave_secreta',
    { expiresIn: '1h' }
  );
}

function verificaToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const tokenValue = token.split(' ')[1];

  if (tokensRevocados.has(tokenValue)) {
    return res.status(401).json({ error: 'Token revocado. Inicie sesión nuevamente.' });
  }

  jwt.verify(tokenValue, 'tu_clave_secreta', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido.' });
    }

    // El token es válido, asignar los datos decodificados a req.user
    req.user = decoded;
    
    // Continuar con la solicitud
    next();
  });
}

function revokeToken(token) {
  tokensRevocados.add(token);
}

module.exports = {
  verificaToken,
  generateToken,
  revokeToken,
  tokensRevocados,
};