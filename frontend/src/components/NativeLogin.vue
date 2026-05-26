<script setup lang="ts">
import { Preferences } from '@capacitor/preferences'

async function goLogin() {
  const { value } = await Preferences.get({ key: 'serverUrl' })
  if (value) window.location.href = value
}

async function changeServer() {
  await Preferences.remove({ key: 'serverUrl' })
  window.location.reload()
}
</script>

<template>
  <div class="cap-setup">
    <div class="cap-setup-card">
      <div class="cap-brand">
        <span class="cap-logo">🔒</span>
        <h1 class="cap-title">Sesión expirada</h1>
      </div>
      <p class="cap-sub">Tu sesión en el servidor ha caducado. Inicia sesión de nuevo para continuar.</p>
      <button class="cap-btn" @click="goLogin">Iniciar sesión →</button>
      <button class="cap-btn-secondary" @click="changeServer">Cambiar servidor</button>
    </div>
  </div>
</template>

<style scoped>
.cap-setup {
  display: flex; align-items: center; justify-content: center;
  height: 100vh; background: #080810; padding: 1.5rem;
}
.cap-setup-card {
  background: #14142a; border: 1px solid #22224a; border-radius: 18px;
  padding: 2rem 1.5rem; width: 100%; max-width: 380px;
  display: flex; flex-direction: column; gap: .9rem;
}
.cap-brand { display: flex; align-items: center; gap: .6rem; margin-bottom: .3rem; }
.cap-logo  { font-size: 1.8rem; }
.cap-title {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem;
  background: linear-gradient(90deg, #fff, #ff9f43);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.cap-sub { font-size: .85rem; color: #7777aa; }
.cap-btn {
  background: linear-gradient(135deg, #4d96ff, #c77dff); border: none;
  border-radius: 10px; padding: .85rem; color: #fff;
  font-size: .95rem; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer;
}
.cap-btn-secondary {
  background: none; border: 1px solid #22224a; border-radius: 10px;
  padding: .7rem; color: #7777aa; font-size: .82rem; cursor: pointer;
}
</style>
