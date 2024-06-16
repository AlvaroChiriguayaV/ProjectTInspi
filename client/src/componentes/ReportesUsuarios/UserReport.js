import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
    padding: 10
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  header: {
    fontSize: 20,
    marginBottom: 10
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableCell: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold'
  }
});

const ReportPDF = ({ users }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Reporte de Usuarios</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableHeader]}>Cédula</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Nombre</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Correo Electrónico</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Rol</Text>
          </View>
          {users.map((user, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{user.cedula}</Text>
              <Text style={styles.tableCell}>{user.nombre}</Text>
              <Text style={styles.tableCell}>{user.correo_electronico}</Text>
              <Text style={styles.tableCell}>{user.rol}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

const UsersReport = ({ users }) => (
  <PDFViewer>
    <ReportPDF users={users} />
  </PDFViewer>
);

export default UsersReport;

