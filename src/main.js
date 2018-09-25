import Vue from 'vue'

import App from './App.vue'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

import VueTheMask from 'vue-the-mask'

Vue.use(Vuetify)
Vue.use(VueTheMask)

new Vue({
  el: '#app',
  render: h => h(App)
})
