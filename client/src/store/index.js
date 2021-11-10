import Vuex from "vuex";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { markRaw } from "vue";

const store = new Vuex.Store({
  state: {
    provider: {},
    signer: null,
    balance: 0,
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
    setBalance(state, payload) {
      state.balance = payload;
    },
    setLastBlock(state, payload) {
      state.lastBlock = payload;
    },
  },
  actions: {
    // Refreshing balance is done manually to allow game flow to control balancee UI update
    async refreshBalance({ commit, state }) {
      if (state.signer == null) {
        return;
      }
      const b = await state.signer.getBalance();
      commit("setBalance", b);
    },
    async connect(state) {
      var rpc = "https://polygon-rpc.com";
      if (process.env.NODE_ENV === "development") {
        rpc = "http://localhost:7545";
      }

      const provider = new ethers.providers.JsonRpcProvider(rpc);
      state.commit("setProvider", provider);

      const eth = await detectEthereumProvider();
      if (eth) {
        const add = await eth.enable();
        const address = add[0];

        const provider = new ethers.providers.Web3Provider(
          eth,
          process.env.NODE_ENV ? 1337 : 137
        );

        const signer = provider.getSigner(address);

        state.commit("setSigner", signer);
        state.commit("setProvider", provider);
      }

      provider.on("block", (block) => {
        state.commit("setLastBlock", block);
      });
    },
  },
});

export default store;
