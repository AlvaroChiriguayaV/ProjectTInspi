const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const usuariosRouter = require('./modelo/usuarios');
const rolesRouter = require('./modelo/roles');
const permisosRouter = require('./modelo/permisos');
const auditoriaRouter = require('./modelo/auditoria')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', usuariosRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permisos', permisosRouter);
app.use('/api/auditoria', auditoriaRouter);

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
