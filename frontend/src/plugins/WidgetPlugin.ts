import { registerPlugin } from '@capacitor/core'

export interface WidgetPluginInterface {
  updateData(options: { data: string }): Promise<void>
}

// No-op on web; only active in native Android
const WidgetPlugin = registerPlugin<WidgetPluginInterface>('WidgetPlugin', {
  web: { updateData: async () => {} },
})

export { WidgetPlugin }
