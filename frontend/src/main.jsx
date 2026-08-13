import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// BrowserRouter — History API-г ашиглаж URL-ыг удирдана. Апп-ын хамгийн
// гадна талд ганц удаа тавина; доторх бүх Route / Link / useNavigate үүнээс
// контекстээ авдаг.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
