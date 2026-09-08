import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WorkerMessageHandler } from 'pdfjs-dist/build/pdf.worker.min.mjs'

// ponytail: force pdfjs to run on main thread, bypassing Web Worker.
// iOS Safari module worker bug causes silent hang (no error, no response).
globalThis.pdfjsWorker = { WorkerMessageHandler };

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
