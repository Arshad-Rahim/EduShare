import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthForm from './pages/AuthForm'
import { Toaster } from 'sonner'
// import App from './App.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <App /> */}
    <Toaster position="top-right" richColors />
    <AuthForm />
   
  </StrictMode>
);
