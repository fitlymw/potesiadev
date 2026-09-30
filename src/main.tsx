import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

/**
 * PENTING: Mengimpor library audio di sini memastikan singleton audio 
 * diinisialisasi segera setelah aplikasi dimuat di browser.
 */
import './lib/audio'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
