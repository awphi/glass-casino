import Vuex from "vuex";
import { BigNumber, ethers, Contract } from "ethers";
import { markRaw } from "vue";

import gameData from "./game-data";
import gameContract from "./game-contract";
import metamask from "./metamask";

import chainsJson from "./chains.json";
import bankContractJson from "../../../build/contracts/CentralBank.json";

// TODO! revise this for prod
const chain = chainsJson["mumbai"]; //[process.env.NODE_ENV === "development" ? "mumbai" : "main"];

const provider = new ethers.providers.StaticJsonRpcProvider(process.env.VUE_APP_ALCHEMY_API_ENDPOINT);
provider.pollingInterval = 1000;

const bankContract = new Contract(
  bankContractJson.networks[Number(chain.chainId)].address,
  bankContractJson.abi,
  provider
);

export default new Vuex.Store({
  state: {
    provider: markRaw(provider),
    signer: null,
    chain: chain,
    balance: BigNumber.from(0n),
    bankContract: markRaw(bankContract),
    bankBalance: BigNumber.from(0n),
  },
  modules: {
    gameData: gameData,
    game: gameContract,
    metamask: metamask,
    bank: bankContract,
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

      state.bankContract = markRaw(bankContract.connect(payload));

      state.signer = payload;
    },
    setBalance(state, payload) {
      state.balance = payload;
    },
    setBankBalance(state, payload) {
      state.bankBalance = payload;
    },
  },
  actions: {
    // Refreshing balance is done manually to allow game flow to hide/show balance changes at will
    refreshBalance({ commit, state }) {
      if (state.signer == null) {
        return;
      }

      provider.getBalance(state.signer._address).then((b) => commit("setBalance", b));
      state.bankContract.balanceOf(this.state.signer._address).then((b) => commit("setBankBalance", b));
    },
  },
});
