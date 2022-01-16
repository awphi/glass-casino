<template>
  <div class="w-100 flex flex-row items-center p-3 bg-steel-700 shadow-lg h-20">
    <h1 class="text-4xl text-left font-bold">GlassCasino</h1>
    <div class="flex-1"></div>
    <div v-if="hasSigner" class="flex flex-row space-x-2 items-center">
      <div class="balance-box">
        <p class="text-xs text-left w-full">Wallet</p>
        <hr class="w-full" />
        <div class="flex flex-row w-full text-right">
          <h1 class="text-lg pr-1 flex-1">
            {{ format(balance) }}
          </h1>
          <img src="@/assets/matic-token-icon.svg" width="20" />
        </div>
      </div>
      <!-- TODO open transfer modal to allow deposit and withdrawal of funds from bank -->
      <button
        class="
          flex flex-col
          items-center
          bg-steel-800
          p-2
          pt-1
          pb-1
          rounded-md
          filter
          hover:bg-steel-900
        "
      >
        <img src="@/assets/arrows-svgrepo-com.svg" width="20" />
        <p class="text-xs">Transfer</p>
      </button>
      <div class="balance-box" v-if="hasSigner">
        <p class="text-xs text-left w-full">Table</p>
        <hr class="w-full" />
        <div class="flex flex-row w-full text-right">
          <h1 class="text-lg pr-1 flex-1">
            {{ format(game.contractBalance) }}
          </h1>
          <img src="@/assets/matic-token-icon.svg" width="20" />
        </div>
      </div>
    </div>

    <button
      class="flex items-center p-2 h-4/5 rounded-md bg-steel-800"
      v-else
      @click="metamaskConnect"
    >
      <p>Connect</p>
      <img src="@/assets/metamask-fox.svg" class="ml-2" width="24" />
    </button>
    <!-- TODO helpful popover explaining metamask if unconnected and balances if connected -->
    <img
      class="filter hover:brightness-75 ml-2"
      src="@/assets/help-svgrepo-com.svg"
      width="24"
    />
  </div>
</template>

<script>
import store from "../store/index";
import { ethers } from "ethers";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Header",
  computed: {
    ...mapState(["balance", "game"]),
    ...mapGetters(["hasSigner", "hasEthereumProvider"]),
  },
  methods: {
    format(b) {
      const v = ethers.utils.formatUnits(b, "ether");
      const split = v.split(".");
      return `${split[0]}.${split[1].slice(0, 3)}`;
    },
    metamaskConnect() {
      if (this.hasEthereumProvider) {
        store.dispatch("connectWithMetamask");
      } else {
        window.open("https://metamask.io/");
      }
    },
  },
};
</script>

<style scoped>
.balance-box {
  @apply flex flex-col items-center p-1 pr-2 pl-2 rounded-md h-full w-28 bg-steel-800;
}
</style>