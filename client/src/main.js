import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import "./index.css";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { VueCookieNext } from "vue-cookie-next";
import router from "./router";

store.state.chain =
  process.env.NODE_ENV === "development"
    ? {
        chainName: "Polygon Testnet",
        chainId: "0x" + Number(80001).toString(16),
        rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
        nativeCurrency: { name: "MATIC", symbol: "MATIC" },
        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
      }
    : {
        chainName: "Polygon",
        chainId: "0x" + Number(137).toString(16),
        rpcUrls: ["https://polygon-rpc.com/"],
        nativeCurrency: { name: "MATIC", symbol: "MATIC" },
        blockExplorerUrls: ["https://polygonscan.com/"],
      };

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

const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (data) => {
  const json = JSON.parse(data.data);
  console.log(json);
  if (json.address) {
    store.commit("setGameData", json);
  }
};

const app = createApp(App).use(router).use(store);
app.use(VueCookieNext);
app.config.globalProperties.window = window;
app.mount("#app");
