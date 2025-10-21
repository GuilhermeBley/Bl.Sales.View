import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './scss/styles.scss'
import 'bootstrap'

createRoot(document.getElementById('root')!).render(
  <> {/*Do not add restrict mode, it can reender react components by no one reason in development scenarios.*/}
    <App />
  </>,
)
