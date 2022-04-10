import Vuex from "vuex";
import { BigNumber, ethers, Contract } from "ethers";
import { markRaw } from "vue";

import gameData from "./game-data";
import gameContract from "./game-contract";
import metamask from "./metamask";
import alerts from "./alerts";

import chainsJson from "../assets/chains.json";
import bankContractJson from "../../../build/contracts/CentralBank.json";

const chain = markRaw(chainsJson["mumbai"]); //[process.env.NODE_ENV === "development" ? "mumbai" : "main"];

const provider = new ethers.providers.StaticJsonRpcProvider(process.env.VUE_APP_ALCHEMY_API_ENDPOINT);
provider.pollingInterval = 3000;

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
    bankContractReadOnly: markRaw(bankContract.connect(provider)),
    bankBalance: BigNumber.from(0n),
  },
  modules: {
    gameData: gameData,
    game: gameContract,
    metamask: metamask,
    alerts: alerts,
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
        state.bankContract = markRaw(state.bankContract.connect(payload));
      } else {
        state.bankContract = markRaw(state.bankContract.connect(state.provider));
      }

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
      state.bankContractReadOnly.balanceOf(this.state.signer._address).then((b) => commit("setBankBalance", b));
    },
  },
});
