<template>
  <div class="box flex flex-col">
    <div class="flex flex-row justify-center">
      <button
        v-for="v in betButtonValues"
        :key="v"
        @click="addToBetInput(v)"
        class="mr-2 bg-bop-20 bet-amount-btn"
      >
        {{ formatEther(v) }}
      </button>
      <div class="h-full flex relative items-center">
        <div class="bet-input bg-bop-20">
          <p>{{ betAmountFormatted }}</p>
        </div>
        <div class="token-bg bg-bop-10">
          <img src="@/assets/matic-token-icon.svg" width="20" />
        </div>
      </div>
      <button
        v-for="v in betButtonValuesAbs"
        :key="v"
        @click="addToBetInput(v)"
        class="ml-2 bg-bop-20 bet-amount-btn"
      >
        +{{ formatEther(v) }}
      </button>
    </div>
    <hr class="w-full opacity-30 mb-8 mt-8" />
    <div class="flex flex-row flex-1">
      <div class="flex flex-col w-full">
        <!-- TODO hovers clicky clicky -->
        <button class="bg-red-600 bet-btn">Red</button>
        <button class="bg-gray-800 bet-btn">Black</button>
        <button class="bg-blue-400 bet-btn">Even</button>
        <button class="bg-green-400 bet-btn">Odd</button>
      </div>
      <div class="flex flex-col w-full"></div>
      <div class="flex flex-col w-full"></div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
const ONE_MATIC_CENT = ethers.BigNumber.from(10000000000000000n);

export default {
  name: "RouletteBetControls",
  data() {
    return {
      betAmount: ONE_MATIC_CENT.mul(10),
      betButtonValues: [
        ONE_MATIC_CENT.mul(-1000),
        ONE_MATIC_CENT.mul(-100),
        ONE_MATIC_CENT.mul(-10),
        ONE_MATIC_CENT.mul(-1),
      ],
    };
  },
  methods: {
    addToBetInput(v) {
      if (this.betAmount.add(v) < ONE_MATIC_CENT) {
        this.betAmount = ONE_MATIC_CENT;
      } else {
        this.betAmount = this.betAmount.add(v);
      }
    },
    formatEther(v) {
      return ethers.utils.formatEther(v);
    },
  },
  computed: {
    betAmountFormatted() {
      return ethers.utils.formatUnits(this.betAmount, "ether");
    },
    betButtonValuesAbs() {
      return this.betButtonValues.map((a) => a.abs()).reverse();
    },
  },
  props: ["contract"],
};
</script>

<style scoped>
.bet-amount-btn {
  @apply rounded-md p-2;
}

.bet-amount-btn:hover {
  @apply bg-opacity-30;
}

.bet-amount-btn:focus {
  @apply bg-opacity-70;
}

.bet-input {
  @apply h-full text-center pl-12 pr-12 w-48 text-white rounded-md flex justify-center items-center;
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

.bet-btn + .bet-btn {
  @apply mt-4;
}

.bet-btn {
  @apply rounded-md p-2 pt-1 pb-1;
}
</style>