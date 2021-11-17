<template>
  <div>
    <h1>Last roll: {{ roll }}</h1>
  </div>
</template>

<script>
import rouletteJson from "../../../build/contracts/Roulette.json";
import { mapState } from "vuex";
import { ethers } from "ethers";
var contract;

export default {
  name: "Roulette",
  data() {
    return {
      roll: 0,
    };
  },
  computed: {
    ...mapState(["provider", "signer"]),
  },
  async mounted() {
    const { chainId } = await this.provider.getNetwork();

    contract = new ethers.Contract(
      rouletteJson.networks[chainId].address,
      rouletteJson.abi,
      this.provider
    );

    contract.on(contract.filters["OutcomeDecided"](), (roll) => {
      this.roll = roll;
    });
  },
  watch: {
    signer(signer) {
      if (signer == null) {
        console.log("Disonnecting contract from signer!");
        contract = contract.connect();
      } else {
        console.log("Connecting to contract with signer!");
        contract = contract.connect(signer);
      }
    },
  },
};
</script>