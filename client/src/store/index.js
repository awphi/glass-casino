import Vuex from "vuex";
import { BigNumber } from "ethers";
import { markRaw } from "vue";

import gameData from "./game-data";
import gameContract from "./game-contract";
import { mumbai, main } from "./chains";
import metamask from "./metamask";

export default new Vuex.Store({
  state: {
    provider: null,
    signer: null,
    chain: process.env.NODE_ENV === "development" ? mumbai : main,
    balance: BigNumber.from(0n),
  },
  modules: {
    gameData: gameData,
    game: gameContract,
    metamask: metamask,
  },
  getters: {
    hasSigner(state) {
      return state.signer != null;
    },
  },
  mutations: {
    // This is the actual provider (polygon RPC if not logged in, user-specified MetaMask RPC if logged in)
    setProvider(state, payload) {
      if (payload != null) {
        payload = markRaw(payload);
      }
      payload.pollingInterval = 1000;

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
  },
});
