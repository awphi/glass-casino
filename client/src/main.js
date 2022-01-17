import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import "./index.css";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { VueCookieNext } from "vue-cookie-next";
import router from "./router";

detectEthereumProvider({ timeout: 300 }).then((eth) => {
  store.commit("setEthereumProvider", eth);
  if (VueCookieNext.isCookieAvailable("metamask-connected")) {
    store.dispatch("connectWithMetamask");
  }
});

store.commit(
  "setProvider",
  new ethers.providers.JsonRpcProvider(
    store.state.chain.rpcUrls[0],
    Number(store.state.chain.chainId)
  )
);

const ws = new WebSocket("ws://localhost:8090");
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
