import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ensureDatabase } from './lib/bootstrap'
import './index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('#root bulunamadi - index.html bozulmus olabilir.')
}

// Demo verisi hazır olmadan uygulamayı monte etme; boylece bileşenler
// localStorage'i senkron okuyabilir ve boş/yükleniyor ara durumu oluşmaz.
// Tohumlama başarısız olsa bile uygulama yine de açılır.
ensureDatabase().finally(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
