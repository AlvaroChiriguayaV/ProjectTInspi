import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from 'react-data-table-component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Uri from '../../enviroment/enviroment';
const Auditoria = () => {
  const [auditoria, setAuditoria] = useState([]);
  const [filteredAuditoria, setFilteredAuditoria] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchAuditoria();
  }, []);

  useEffect(() => {
    const result = auditoria.filter(entry => {
      return entry.usuario_nombre.toLowerCase().includes(search.toLowerCase()) ||
             entry.ip_usuario.toLowerCase().includes(search.toLowerCase()) ||
             entry.accion.toLowerCase().includes(search.toLowerCase()) ||
             entry.fecha.toLowerCase().includes(search.toLowerCase());
    });
    setFilteredAuditoria(result);
  }, [search, auditoria]);

  const fetchAuditoria = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const response = await fetch(Uri+'api/auditoria', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditoria(data.auditoria);
        setFilteredAuditoria(data.auditoria);
      } else {
        console.error('Error fetching auditoria:', response.statusText);
        setError('Error al cargar la auditoría');
      }
    } catch (error) {
      console.error('Error fetching auditoria:', error);
      setError('Error al cargar la auditoría');
    }
  };

  const handleShowReport = () => {
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(20, 20, 'Reporte de Auditoría');

    const auditoriaData = auditoria.map(entry => [entry.usuario_nombre, entry.ip_usuario, entry.fecha, entry.accion]);

    doc.autoTable({
      head: [['Nombre de Usuario', 'IP del Usuario', 'Fecha', 'Acción Realizada']],
      body: auditoriaData,
    });

    doc.save('reporte_auditoria.pdf');
  };

  const columns = [
    {
      name: 'USUARIO',
      selector: row => row.usuario_nombre,
      sortable: true,
    },
    {
      name: 'IP USUARIO',
      selector: row => row.ip_usuario,
      sortable: true,
    },
    {
      name: 'FECHA',
      selector: row => row.fecha,
      sortable: true,
    },
    {
      name: 'ACCIÓN REALIZADA',
      selector: row => row.accion,
      sortable: true,
    },
  ];

  return (
    <div className="container mt-4">
      <h4>Auditoría</h4>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25 mr-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredAuditoria}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        customStyles={{
          headCells: {
            style: {
              backgroundColor: '#135ea9',
              color: '#ffffff',
              border: '1px solid #ccc',
            },
          },
        }}
      />
      <button className="btn btn-primary mt-3" onClick={handleShowReport}>
        Mostrar Reporte
      </button>
    </div>
  );
};

export default Auditoria;
