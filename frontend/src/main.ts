import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/style.css'
import { Capacitor } from '@capacitor/core'

// Tras el login en SSOwat, el WebView aterriza en el servidor (https://.../).
// Lo detectamos y volvemos inmediatamente al bundle antes de montar Vue.
if (Capacitor.isNativePlatform() && window.location.origin !== 'capacitor://localhost') {
  window.location.href = 'capacitor://localhost'
} else {
  createApp(App).use(createPinia()).mount('#app')
}
