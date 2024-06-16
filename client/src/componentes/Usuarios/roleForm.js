// Dentro del componente RoleForm

import React, { useState } from 'react';

const RoleForm = ({ role, permissionsList, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: role ? role.nombre : '',
    permisos: role ? role.permisos.map(p => p.id_permiso) : []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermissionsChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevFormData) => {
      let updatedPermisos = [...prevFormData.permisos];
      if (checked) {
        updatedPermisos.push(parseInt(value));
      } else {
        updatedPermisos = updatedPermisos.filter((permiso) => permiso !== parseInt(value));
      }
      return {
        ...prevFormData,
        permisos: updatedPermisos
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const groupPermissions = () => {
    const grouped = permissionsList.reduce((acc, permiso) => {
      const category = permiso.categoria || 'Módulos';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permiso);
      return acc;
    }, {});

    return grouped;
  };

  const groupedPermissions = groupPermissions();

  return (
    <div className="container mt-4">
      <h4>{role ? 'Editar Rol' : 'Crear Nuevo Rol'}</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Rol</label>
          <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} />
        </div>
        <div className="form-group"><br/>
          <label>Asignar Permisos al Rol</label>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Permisos</th>
                <th>Descripción</th> {/* Nueva columna para la descripción */}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([category, permisos]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>
                    {permisos.map(permiso => (
                      <div key={permiso.id_permiso} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="permisos"
                          value={permiso.id_permiso}
                          checked={formData.permisos.includes(permiso.id_permiso)}
                          onChange={handlePermissionsChange}
                        />
                        <label className="form-check-label">
                          {permiso.nombre_permiso}
                        </label>
                      </div>
                    ))}
                  </td>
                  <td> {/* Columna para mostrar la descripción del permiso */}
                    {permisos.map(permiso => (
                      <div key={permiso.id_permiso}>
                        {permiso.descripcion}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" className="btn btn-primary">{role ? 'Guardar' : 'Crear'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </form>
    </div>
  );
};

export default RoleForm;
