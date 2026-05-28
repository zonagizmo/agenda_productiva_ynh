import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/style.css'
import { Capacitor } from '@capacitor/core'

// Tras el login en SSOwat el WebView aterriza en el servidor real.
// Lo detectamos por el hostname: en Capacitor 7 Android el bundle se sirve
// desde https://localhost (hostname === 'localhost').
// Si estamos en otro dominio → post-SSO → volvemos al bundle.
if (Capacitor.isNativePlatform() && window.location.hostname !== 'localhost') {
  window.location.href = 'https://localhost'
} else {
  createApp(App).use(createPinia()).mount('#app')
}
