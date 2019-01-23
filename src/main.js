import Vue from 'vue'
import App from './App.vue'
import Vuetify from "vuetify";

import './registerServiceWorker'
import "vuetify/dist/vuetify.min.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  breakpoint: {
    thresholds: {
      xs: 360,
      md: 600
    },
    scrollbarWidth: 10
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
