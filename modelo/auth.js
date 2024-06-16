const bcrypt = require('bcrypt');
const { generateToken, verificaToken, revokeToken } = require('../controlador/tokens');

const saltRounds = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verificaToken,
  revokeToken
};
