import { Contract } from "ethers";
import { markRaw } from "vue";

export default {
  state: () => ({
    contract: null,
    contractWithSigner: null,
  }),
  mutations: {
    setContract(state, { address, abi }) {
      // Clear out old listeners
      if (state.contractWithSigner != null) {
        state.contractWithSigner.removeAllListeners();
        state.contractWithSigner = null;
      }

      if (state.contract != null) {
        state.contract.removeAllListeners();
      }

      // this.state refers to root state in this context
      state.contract = markRaw(new Contract(address, abi, this.state.provider));

      if (this.state.signer != null) {
        state.contractWithSigner = markRaw(state.contract.connect(this.state.signer));
      }
    },
    setSigner(state, payload) {
      if (state.contractWithSigner != null) {
        state.contractWithSigner.removeAllListeners();
      }

      if (state.contract != null && payload != null) {
        markRaw(payload);
        state.contractWithSigner = markRaw(state.contract.connect(payload));
      } else {
        state.contractWithSigner = null;
      }
    },
  },
};
