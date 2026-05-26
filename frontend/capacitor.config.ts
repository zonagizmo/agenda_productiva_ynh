import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.agendaproductiva.app',
  appName: 'Agenda Productiva',
  webDir: '../sources/dist',
  android: {
    backgroundColor: '#080810',
  },
  server: {
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: '#080810',
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
}

export default config
