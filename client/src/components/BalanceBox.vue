<template>
  <div class="flex flex-col items-center p-1 px-2 rounded-md bg-steel-800">
    <p v-if="title != ''" class="text-xs text-left w-full">{{ title }}</p>
    <hr v-if="title != ''" class="w-full" />
    <div class="flex flex-row w-full text-right">
      <input
        v-if="editable"
        class="text-lg flex-1 text-right pr-1 rounded-md w-full bg-steel-800"
        type="number"
        :placeholder="placeholder"
        ref="input"
        @keyup="inputKeyUp"
      />
      <h1 v-else class="text-lg pr-1 flex-1">
        {{ format(value) }}
      </h1>
      <img src="@/assets/matic-token-icon.svg" width="20" />
    </div>
    <hr v-if="showValueBelow" class="w-full" />
    <div v-if="showValueBelow" class="flex flex-row w-full text-right">
      <h1 class="text-lg pr-1 flex-1">
        {{ format(value) }}
      </h1>
      <img src="@/assets/matic-token-icon.svg" width="20" />
    </div>
  </div>
</template>

<script>
import { BigNumber, ethers } from "ethers";
const ZERO = BigNumber.from(0n);

export default {
  name: "BalanceBox",
  data() {
    return {
      inputValue: null,
    };
  },
  methods: {
    format(b) {
      const v = ethers.utils.formatUnits(b, "ether");
      const split = v.split(".");
      return `${split[0]}.${split[1].slice(0, 3)}`;
    },
    inputKeyUp(e) {
      try {
        this.inputValue = ethers.utils.parseEther(e.target.value);
      } catch (_) {
        this.inputValue = ZERO;
      }
    },
  },
  props: {
    value: {
      type: BigNumber,
      default: BigNumber.from(0n),
    },
    title: {
      type: String,
      default: "",
    },
    editable: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "0.0",
    },
    showValueBelow: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
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