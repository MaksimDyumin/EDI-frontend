// import 'https://www.cryptopro.ru/sites/default/files/products/cades/cadesplugin_api.js'
import '@/assets/css/main.css'
import 'vue-toast-notification/dist/theme-bootstrap.css';
// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

export default app
