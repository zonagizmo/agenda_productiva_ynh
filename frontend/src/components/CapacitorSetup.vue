<script setup lang="ts">
import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

const url   = ref('')
const error = ref('')
const connecting = ref(false)

async function connect() {
  error.value = ''
  let u = url.value.trim().replace(/\/$/, '')
  if (!u) { error.value = 'Introduce la URL del servidor'; return }
  if (!u.startsWith('http')) u = 'https://' + u
  try { new URL(u) } catch { error.value = 'URL no válida (ej: https://mi-servidor.tld)'; return }

  connecting.value = true
  await Preferences.set({ key: 'serverUrl', value: u })
  window.location.href = u
}
</script>

<template>
  <div class="cap-setup">
    <div class="cap-setup-card">
      <div class="cap-brand">
        <span class="cap-logo">📅</span>
        <h1 class="cap-title">Agenda Productiva</h1>
      </div>

      <p class="cap-sub">Introduce la URL de tu servidor YunoHost</p>

      <input
        v-model="url"
        class="cap-input"
        type="url"
        placeholder="https://mi-servidor.tld"
        @keydown.enter="connect"
        :disabled="connecting"
      />

      <p v-if="error" class="cap-error">{{ error }}</p>

      <button class="cap-btn" :disabled="connecting" @click="connect">
        <span v-if="connecting">Conectando…</span>
        <span v-else>Conectar →</span>
      </button>

      <p class="cap-hint">Ej: https://midominio.tld · https://192.168.1.100</p>
    </div>
  </div>
</template>

<style scoped>
.cap-setup {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #080810;
  padding: 1.5rem;
}
.cap-setup-card {
  background: #14142a;
  border: 1px solid #22224a;
  border-radius: 18px;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: .9rem;
}
.cap-brand {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin-bottom: .3rem;
}
.cap-logo { font-size: 1.8rem; }
.cap-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  background: linear-gradient(90deg, #fff, #4d96ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cap-sub { font-size: .85rem; color: #7777aa; }
.cap-input {
  background: #0f0f1e;
  border: 1px solid #22224a;
  border-radius: 10px;
  padding: .75rem 1rem;
  font-size: .9rem;
  color: #eeeeff;
  outline: none;
  width: 100%;
  transition: border-color .15s;
}
.cap-input:focus { border-color: #4d96ff; }
.cap-error { font-size: .78rem; color: #ff6b6b; }
.cap-btn {
  background: linear-gradient(135deg, #4d96ff, #c77dff);
  border: none;
  border-radius: 10px;
  padding: .85rem;
  color: #fff;
  font-size: .95rem;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  transition: opacity .15s;
}
.cap-btn:disabled { opacity: .6; cursor: not-allowed; }
.cap-hint { font-size: .72rem; color: #3a3a6a; text-align: center; }
</style>
