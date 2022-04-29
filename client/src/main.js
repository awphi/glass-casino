import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import "./index.css";
import detectEthereumProvider from "@metamask/detect-provider";
import { VueCookieNext } from "vue-cookie-next";
import router from "./router";

detectEthereumProvider({ timeout: 300 }).then(async (eth) => {
  store.commit("setEthereumProvider", eth);
  if (VueCookieNext.isCookieAvailable("metamask-connected")) {
    store.dispatch("connectWithMetamask");
    eth.on("accountsChanged", () => store.dispatch("connectWithMetamask"));
    eth.on("chainChanged", () => store.dispatch("connectWithMetamask"));
  }
});

const ws = new WebSocket(
  process.env.VUE_APP_API_ENDPOINT ? process.env.VUE_APP_API_ENDPOINT : `ws://${window.location.hostname}:8090`
);

ws.onopen = (e) => {
  console.log("Connected to WS", e);
};

ws.onerror = (e) => {
  console.error("wS error", e);
};

ws.onmessage = (data) => {
  console.log("ws recv", data);
  const json = JSON.parse(data.data);
  if (json.address) {
    store.commit("setGameData", json);
  }
};

const app = createApp(App).use(router).use(store);
app.use(VueCookieNext);
app.config.globalProperties.window = window;
app.mount("#app");
