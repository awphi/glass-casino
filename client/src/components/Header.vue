<template>
  <div class="w-100 flex flex-row items-center p-3 bg-steel-700 shadow-lg h-20">
    <h1 class="text-4xl text-left font-bold">GlassCasino</h1>
    <div class="flex-1"></div>
    <div v-if="hasSigner" class="flex flex-row space-x-2 items-center">
      <BalanceBox class="w-28" title="Wallet" :value="balance" />
      <Dialog
        class="
          fixed
          inset-0
          z-10
          flex flex-col
          items-center
          justify-center
          overflow-y-auto
        "
        :open="isBankOpen"
        @close="isBankOpen = false"
      >
        <DialogOverlay class="fixed inset-0 bg-black opacity-50" />
        <FundsMenu />
      </Dialog>
      <button
        class="
          flex flex-col
          items-center
          bg-steel-800
          px-2
          py-1
          rounded-md
          hover:bg-steel-900
        "
        @click="isBankOpen = true"
      >
        <img src="@/assets/arrows-svgrepo-com.svg" width="20" />
        <p class="text-xs">Transfer</p>
      </button>
      <BalanceBox class="w-28" title="Table" :value="game.contractBalance" />
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
import { mapState, mapGetters } from "vuex";
import FundsMenu from "./FundsMenu.vue";
import BalanceBox from "./BalanceBox.vue";
import { Dialog, DialogOverlay } from "@headlessui/vue";

export default {
  name: "Header",
  components: {
    Dialog,
    DialogOverlay,
    FundsMenu,
    BalanceBox,
  },
  data() {
    return {
      isBankOpen: false,
    };
  },
  computed: {
    ...mapState(["balance", "game"]),
    ...mapGetters(["hasSigner", "hasEthereumProvider"]),
  },
  methods: {
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