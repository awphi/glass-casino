import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";

detectEthereumProvider().then((eth) => {
  if (eth) {
    const provider = new ethers.providers.Web3Provider(eth);
    const signer = provider.getSigner();
    //TODO Save provider, signer to store
  } else {
    console.log("No MetaMask!");
  }

  createApp(App).use(store).mount("#app");
});
