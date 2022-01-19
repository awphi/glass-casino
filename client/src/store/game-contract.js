import { BigNumber, Contract } from "ethers";
import { markRaw } from "vue";

export default {
  state: () => ({
    contract: null,
    // Unfortunately hackish solution to dealing with slow MetaMask providers, used to update contract balance
    contractUnconnected: null,
    contractBalance: BigNumber.from(0n),
  }),
  mutations: {
    setContract(state, { address, abi }) {
      // this.state refers to root state in this context
      var contract = new Contract(address, abi, this.state.provider);
      // TODO test what changing contract.provider here changes
      state.contractUnconnected = markRaw(
        new Contract(address, abi, this.state.provider)
      );
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
      if (this.state.signer == null || state.contractUnconnected == null) {
        return;
      }

      try {
        const b = await state.contractUnconnected.balance({
          from: this.state.signer._address,
        });
        commit("setContractBalance", b);
      } catch (e) {
        console.error(e);
      }
    },
  },
};
