import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { pdfjs } from 'react-pdf'

// react-pdf sets workerSrc to 'pdf.worker.mjs', override to serve from public/
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
