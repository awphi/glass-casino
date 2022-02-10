import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import "./index.css";
import detectEthereumProvider from "@metamask/detect-provider";
import { VueCookieNext } from "vue-cookie-next";
import router from "./router";

detectEthereumProvider({ timeout: 300 }).then((eth) => {
  store.commit("setEthereumProvider", eth);
  if (VueCookieNext.isCookieAvailable("metamask-connected")) {
    store.dispatch("connectWithMetamask");
  }
});

console.log(process.env);
const ws = new WebSocket(process.env.VUE_APP_API_ENDPOINT);
ws.onopen = console.log;
ws.onmessage = (data) => {
  const json = JSON.parse(data.data);
  if (json.address) {
    store.commit("setGameData", json);
  }
};

const app = createApp(App).use(router).use(store);
app.use(VueCookieNext);
app.config.globalProperties.window = window;
app.mount("#app");
