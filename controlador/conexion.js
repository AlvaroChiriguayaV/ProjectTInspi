const mysql = require('mysql2/promise');

const conexion = mysql.createConnection({
  host: 'localhost',  // Cambia por la dirección de tu servidor MySQL
  user: 'root',  // Cambia por tu usuario de MySQL
  password: '',  // Cambia por tu contraseña de MySQL
  database: 'proyecto_tesis',  // Cambia por tu base de datos
});

module.exports = conexion;
