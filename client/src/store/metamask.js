import { ethers } from "ethers";
import { markRaw } from "vue";
import { VueCookieNext } from "vue-cookie-next";

export default {
  state: () => ({
    ethereumProvider: null,
  }),
  mutations: {
    // Used to track if a user has metamask (or similar) or not and redirect them accordingly
    setEthereumProvider(state, payload) {
      if (payload != null) {
        payload = markRaw(payload);
      }
      state.ethereumProvider = payload;
    },
  },
  actions: {
    async connectWithMetamask({ state, commit, dispatch }) {
      const eth = state.ethereumProvider;

      if (eth) {
        var addresses;
        try {
          addresses = await eth.request({ method: "eth_requestAccounts" });
        } catch (e) {
          // If we have the cookie where they previously gave permission but now they have revoked it
          // we can just remove the cookie after they decline the new popup
          if (e.code == 4001) {
            VueCookieNext.removeCookie("metamask-connected");
          }
          return;
        }

        VueCookieNext.setCookie("metamask-connected", "", { expire: "1d" });

        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: this.state.chain.chainId }],
          });
        } catch (e) {
          // TODO verify this is working
          if (e.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [this.state.chain],
            });
          }
        }

        const provider = new ethers.providers.Web3Provider(eth, Number(this.state.chain.chainId));
        provider.pollingInterval = 1000;

        const signer = provider.getSigner(addresses[0]);

        //commit("setProvider", provider);
        commit("setSigner", signer);

        // Finally, we connect to the bank contract and refresh the balances
        dispatch("refreshBalance");
      }
    },
  },
  getters: {
    hasEthereumProvider(state) {
      return state.ethereumProvider != null;
    },
  },
};
