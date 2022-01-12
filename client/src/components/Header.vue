<template>
  <div class="w-100 flex flex-row items-center p-3 bg-gray-700 shadow-lg h-16">
    <h1 class="text-4xl flex-1 text-left font-bold">GlassCasino</h1>
    <div
      class="
        flex
        items-center
        p-1
        pr-2
        pl-2
        rounded-md
        h-full
        bg-black bg-opacity-10
      "
      v-if="hasSigner"
    >
      <h1 class="text-lg pr-2">
        {{ balanceFormatted }}
      </h1>
      <img src="@/assets/matic-token-icon.svg" width="24" />
    </div>
    <div
      class="
        flex
        items-center
        p-1
        pr-2
        pl-2
        rounded-md
        h-full
        bg-black bg-opacity-10
      "
      v-else
    >
      <p>Connect</p>
      <div
        class="w-0.5 h-4/5 bg-black bg-opacity-10 rounded-full mr-2 ml-2"
      ></div>

      <button
        @click="metamaskConnect"
        class="
          flex
          items-center
          justify-center
          bg-green-400 bg-opacity-40
          rounded-full
          p-1
          shadow-sm
        "
      >
        <img src="@/assets/metamask-fox.svg" width="24" />
      </button>
    </div>
  </div>
</template>

<script>
import store from "../store/index";
import { ethers } from "ethers";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Header",
  computed: {
    ...mapState(["balance", "ethereumProviderExists"]),
    ...mapGetters(["hasSigner"]),
    balanceFormatted() {
      const v = ethers.utils.formatUnits(this.balance, "ether");
      const split = v.split(".");
      return `${split[0]}.${split[1].slice(0, 5)}`;
    },
  },
  methods: {
    metamaskConnect() {
      if (this.ethereumProviderExists) {
        store.dispatch("connectWithMetamask");
      } else {
        window.open("https://metamask.io/");
      }
    },
  },
};
</script>