import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Asegúrate de envolver la aplicación con el Router
import App from './App'; // Asegúrate de importar el componente App
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Envolvemos la aplicación con el Router */}
      <App /> {/* Componente principal con las rutas */}
    </Router>
  </React.StrictMode>
);

reportWebVitals(); // Opcional, para medir el rendimiento
