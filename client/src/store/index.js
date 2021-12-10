import Vuex from "vuex";
import { ethers } from "ethers";
import { markRaw } from "vue";
import { VueCookieNext } from "vue-cookie-next";

const store = new Vuex.Store({
  state: {
    provider: null,
    signer: null,
    ethereumProvider: null,
    ethereumProviderExists: true,
    chain: null,
    balance: 0,
    gameData: {},
  },
  getters: {
    hasSigner(state) {
      return state.signer != null;
    },
  },
  mutations: {
    setEthereumProvider(state, payload) {
      state.ethereumProviderExists = payload != null;
      if (payload != null) {
        markRaw(payload);
      }
      state.ethereumProvider = payload;
    },
    setProvider(state, payload) {
      markRaw(payload);
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
    async connectWithMetamask({ state, commit, dispatch }) {
      const eth = state.ethereumProvider;

      if (eth) {
        var add;
        try {
          add = await eth.request({ method: "eth_requestAccounts" });
        } catch (e) {
          // If we have the cookie where they previously gave permission but now they have revoked it
          // we can just remove the cookie after they decline the new popup
          if (e.code === 4001) {
            VueCookieNext.removeCookie("metamask-connected");
          }
          return;
        }
        const address = add[0];

        VueCookieNext.setCookie("metamask-connected", "", { expire: "1d" });

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

        const provider = new ethers.providers.Web3Provider(
          eth,
          Number(state.chain.chainId)
        );

        const signer = provider.getSigner(address);

        // OLD: signer provider is kept separately, RPC provider is preferred since web3 provider responds VERY slowly to events!
        commit("setProvider", provider);
        commit("setSigner", signer);
        dispatch("refreshBalance");
      }
    },
  },
});

export default store;
