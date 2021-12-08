import Vuex from "vuex";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { markRaw } from "vue";

const chain =
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

const store = new Vuex.Store({
  state: {
    provider: null,
    signer: null,
    chain: chain,
    signerProvider: null,
    balance: 0,
    gameData: {},
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
      const { address, data } = payload;
      var g = state.gameData;
      if (address in g) {
        state.gameData[address] = data;
      } else {
        const o = {};
        o[address] = data;
        state.gameData = { ...g, ...o };
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
    async connect({ state, commit }) {
      const provider = new ethers.providers.JsonRpcProvider(
        state.chain.rpcUrls[0],
        state.chain.chainId
      );
      commit("setProvider", provider);

      const ws = new WebSocket("ws://localhost:8080");

      ws.onmessage = (data) => {
        const json = JSON.parse(data.data);
        console.log(json);
        if (json.address) {
          commit("setGameData", json);
        }
      };
    },
    async connectWithMetamask({ state, commit, dispatch }) {
      const eth = await detectEthereumProvider();
      if (eth) {
        const add = await eth.enable();
        const address = add[0];

        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: state.chain.chainId }],
          });
        } catch (e) {
          if (e.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [state.chain],
            });
          }
        }

        const provider = new ethers.providers.Web3Provider(eth, state.chainId);

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
