import './App.css';
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'

// 1. IMPORTA TU PROVIDER (asegúrate de que la ruta sea correcta según tu proyecto)
import { AppProvider } from './contexts/AppContext.jsx' // o de donde sea que venga

ReactDOM.render(
  <React.StrictMode>
    {/* 2. ENVUELVE TU APLICACIÓN CON EL PROVIDER */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)