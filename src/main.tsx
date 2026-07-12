import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { preloadFonts } from './utils/fonts'
import { useEditorStore } from './store/useEditorStore'

preloadFonts();
useEditorStore.getState().reloadBrandKit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
