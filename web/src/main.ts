import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
import { installDirectives } from './directives'
import './style/base.css'
import './style/motion.css'

initTheme()

const app = createApp(App)
installDirectives(app)
app.use(router).mount('#app')
