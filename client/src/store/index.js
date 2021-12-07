import Vuex from "vuex";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { markRaw } from "vue";

const store = new Vuex.Store({
  state: {
    provider: null,
    signer: null,
    signerProvider: null,
    balance: 0,
    gameData: {
      roulette: {},
    },
  },
  getters: {
    hasSigner(state) {
      return (
        state.signerProvider != null &&
        state.signer != null &&
        window.ethereum.selectedAddress != null
      );
    },
  },
  mutations: {
    setProvider(state, payload) {
      markRaw(payload);
      payload.pollingInterval = 1000;
      state.provider = payload;
    },
    setSignerProvider(state, payload) {
      markRaw(payload);
      state.signerProvider = payload;
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
    setGameData(state, payload) {
      const { address, game, data } = payload;
      var g = state.gameData[game];
      if (address in g) {
        state.gameData[game][address] = data;
      } else {
        const o = {};
        o[address] = data;
        state.gameData[game] = { ...g, ...o };
      }
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
    async connect({ commit }) {
      var rpc = "https://polygon-rpc.com";
      if (process.env.NODE_ENV === "development") {
        rpc = "http://localhost:7545";
      }

      const provider = new ethers.providers.JsonRpcProvider(rpc);
      commit("setProvider", provider);
    },
    async connectWithMetamask({ commit, dispatch }) {
      const eth = await detectEthereumProvider();
      if (eth) {
        const add = await eth.enable();
        const address = add[0];

        const provider = new ethers.providers.Web3Provider(
          eth,
          process.env.NODE_ENV ? 1337 : 137
        );

        const signer = provider.getSigner(address);

        // signer provider is kept separately, RPC provider is preferred since web3 provider responds VERY slowly to events!
        commit("setSignerProvider", provider);
        commit("setSigner", signer);
        dispatch("refreshBalance");
      }
    },
  },
});

export default store;
