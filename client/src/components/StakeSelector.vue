<template>
  <div class="flex flex-row justify-center">
    <button
      v-for="v in betButtonValues"
      :key="v"
      @click="addToBetInput(v)"
      class="mr-2 bet-amount-btn"
    >
      {{ formatEther(v) }}
    </button>
    <div class="flex relative items-center">
      <input
        class="bet-input bg-steel-700"
        type="number"
        value="0.01"
        placeholder="0.01"
        ref="betInput"
        min="0.01"
        @keyup="betInputKeyUp"
      />
      <div class="token-bg bg-steel-800">
        <img src="@/assets/matic-token-icon.svg" width="20" />
      </div>
    </div>
    <button
      v-for="v in betButtonValuesAbs"
      :key="v"
      @click="addToBetInput(v)"
      class="ml-2 bg-steel-700 bet-amount-btn"
    >
      +{{ formatEther(v) }}
    </button>
  </div>
</template>

<script>
const ONE_MATIC_CENT = BigNumber.from(10000000000000000n);
const ZERO = BigNumber.from(0n);

import { ethers, BigNumber } from "ethers";

export default {
  name: "StakeSelector",
  data() {
    return {
      betAmount: ONE_MATIC_CENT,
      betButtonValues: [
        ONE_MATIC_CENT.mul(-1000),
        ONE_MATIC_CENT.mul(-100),
        ONE_MATIC_CENT.mul(-10),
        ONE_MATIC_CENT.mul(-1),
      ],
    };
  },
  methods: {
    betInputKeyUp(e) {
      try {
        this.betAmount = ethers.utils.parseEther(e.target.value);
      } catch (_) {
        this.betAmount = ZERO;
      }
    },
    addToBetInput(v) {
      if (this.betAmount.add(v) < ONE_MATIC_CENT) {
        this.betAmount = ONE_MATIC_CENT;
      } else {
        this.betAmount = this.betAmount.add(v);
      }
      this.$refs.betInput.value = ethers.utils.formatEther(this.betAmount);
    },
    formatEther(v) {
      return ethers.utils.formatEther(v);
    },
  },
  computed: {
    betButtonValuesAbs() {
      return this.betButtonValues.map((a) => a.abs()).reverse();
    },
    betAmountFormatted() {
      return ethers.utils.formatUnits(this.betAmount, "ether");
    },
  },
};
</script>

<style scoped>
.bet-amount-btn {
  @apply rounded-md p-2 bg-steel-700 hover:bg-steel-800;
}

.bet-input {
  @apply h-full text-center pl-12 pr-12 w-48 rounded-md flex justify-center items-center;
}

.token-bg {
  @apply absolute right-0 flex items-center justify-center p-1.5 mr-1 rounded-lg;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>