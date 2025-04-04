import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { createPinia } from "pinia";

const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
});
app.use(pinia);
app.mount("#app");
