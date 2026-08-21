import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx'
import './index.css'
import ErrorBoundary from './ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
