/**
 * Portal REGULATEL
 * Versión inicial desarrollada por Diego Cuervo
 * Analista de Relaciones Internacionales – INDOTEL
 * Correo institucional: dcuervo@indotel.gob.do
 * Estructura funcional, curaduría institucional y propuesta visual del portal
 * 2026
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
