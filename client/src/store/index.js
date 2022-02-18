import Vuex from "vuex";
import { BigNumber, ethers } from "ethers";
import { markRaw } from "vue";

import gameData from "./game-data";
import gameContract from "./game-contract";
import { mumbai } from "./chains";
import metamask from "./metamask";

// TODO! revise this for prod
const chain = mumbai; // process.env.NODE_ENV === "development" ? mumbai : main;
// We use StaticJsonRpcProvider to cache chain id and reduce alchemy calls
const provider = new ethers.providers.StaticJsonRpcProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/KefZ5j5KdtKEnWEdbOGjqmhdcSNaxHdf"
);
provider.pollingInterval = 1000;

export default new Vuex.Store({
  state: {
    provider: markRaw(provider),
    signer: null,
    chain: chain,
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

      const b = await provider.getBalance(state.signer._address);

      commit("setBalance", b);
    },
  },
});
