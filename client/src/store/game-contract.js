import { BigNumber, Contract } from "ethers";
import { markRaw } from "vue";

export default {
  state: () => ({
    contract: null,
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
    setSigner(state, payload) {
      if (state.contract != null) {
        const contract = state.contract.connect(payload);
        markRaw(contract);
        state.contract = contract;
      }
    },
    clearContract(state) {
      state.contract = null;
    },
  },
};
