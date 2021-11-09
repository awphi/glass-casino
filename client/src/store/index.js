import Vuex from "vuex";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { markRaw } from "vue";

const store = new Vuex.Store({
  state: {
    provider: null,
    signer: null,
  },
  mutations: {
    setProvider(state, payload) {
      markRaw(payload);
      state.provider = payload;
    },
    setSigner(state, payload) {
      if (payload != null) {
        markRaw(payload);
      }
      state.signer = payload;
    },
  },
  actions: {
    connect(state) {
      return detectEthereumProvider().then((eth) => {
        if (eth) {
          eth.enable().then((add) => {
            const provider = new ethers.providers.Web3Provider(
              eth,
              process.env.NODE_ENV ? 1337 : 137
            );
            const signer = provider.getSigner(add[0]);

            //markRaw(provider);
            //markRaw(signer);

            state.commit("setProvider", provider);
            state.commit("setSigner", signer);
            //console.log(signer);
          });
        } else {
          var rpc = "https://polygon-rpc.com";
          if (process.env.NODE_ENV === "development") {
            rpc = "http://localhost:7545";
          }
          const provider = new ethers.providers.JsonRpcProvider(rpc);
          state.commit("setProvider", provider);
          state.commit("setSigner", null);
        }
      });
    },
  },
  getters: {
    hasSigner(state) {
      return state.signer != null;
    },
  },
});

export default store;
