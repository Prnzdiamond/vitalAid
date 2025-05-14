// plugins/fontawesome.js
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

export default defineNuxtPlugin((nuxtApp) => {
  library.add(fas) // You can import individual icons too

  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
