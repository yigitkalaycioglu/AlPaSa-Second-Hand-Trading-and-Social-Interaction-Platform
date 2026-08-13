import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ensureDatabase } from './lib/bootstrap'
import './index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('#root bulunamadı — index.html bozulmuş olabilir.')
}

// Demo verisi hazır olmadan uygulamayı monte etme; böylece bileşenler
// localStorage'ı senkron okuyabilir ve boş/yükleniyor ara durumu oluşmaz.
// Tohumlama başarısız olsa bile uygulama yine de açılır.
ensureDatabase().finally(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
