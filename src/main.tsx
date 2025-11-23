import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 Main.tsx is executing - FULL APP');

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('✅ React render called successfully');
} catch (e) {
  console.error('❌ Error during React render:', e);
}
