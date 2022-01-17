import { BigNumber, Contract } from "ethers";
import { markRaw } from "vue";

export default {
  state: () => ({
    contract: null,
    contractBalance: BigNumber.from(0n),
    isRefreshing: false,
  }),
  mutations: {
    setContract(state, { address, abi }) {
      // this.state refers to root state in this context
      var contract = new Contract(address, abi, this.state.provider);
      if (this.state.signer != null) {
        contract = contract.connect(this.state.signer);
      }

      markRaw(contract);
      state.contract = contract;
    },
    setContractBalance(state, payload) {
      state.contractBalance = payload;
    },
    setSigner(state, payload) {
      if (payload != null && state.contract != null) {
        const contract = state.contract.connect(payload);
        markRaw(contract);
        state.contract = contract;
      }
    },
    clear(state) {
      state.contract = null;
    },
  },
  actions: {
    async refreshBalance({ commit, state }) {
      if (
        state.isRefreshing ||
        this.state.signer == null ||
        state.contract == null
      ) {
        return;
      }

      console.log("Started Refreshing!");
      const t = Date.now();
      state.isRefreshing = true;

      try {
        const b = await state.contract.balance({
          from: this.state.signer.address,
        });
        commit("setContractBalance", b);
      } catch (_) {
        console.log(this.state.signer, state.contract);
      }
      state.isRefreshing = false;
      console.log("Done Refreshing!", (Date.now() - t) / 1000);
    },
  },
};
