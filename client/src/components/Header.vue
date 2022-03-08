<template>
  <div class="flex flex-row items-center p-4 bg-steel-700 shadow-lg">
    <button
      @click="isSidebarModalOpen = true"
      class="h-full flex p-1.5 md:hidden filter hover:brightness-75"
    >
      <img src="@/assets/menu-svgrepo-com.svg" class="h-full" />
    </button>
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
      :open="isSidebarModalOpen"
      @close="isSidebarModalOpen = false"
    >
      <DialogOverlay class="fixed inset-0 bg-black opacity-50" />
      <Sidebar class="z-10 fixed left-0 top-0 h-full" />
    </Dialog>
    <h1 class="text-4xl text-left font-bold hidden md:block">GlassCasino</h1>
    <div class="flex-1"></div>
    <div v-if="hasSigner" class="flex flex-row space-x-2 items-center">
      <BalanceBox class="text-lg w-28" title="Wallet" :value="balance" />
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
      <BalanceBox class="text-lg w-28" title="Bank" :value="bankBalance" />
    </div>

    <button
      class="flex items-center p-2 h-full rounded-md bg-steel-800"
      v-else
      @click="metamaskConnect"
    >
      <p>Connect</p>
      <img src="@/assets/metamask-fox.svg" class="ml-2" width="24" />
    </button>
    <!-- TODO helpful popover explaining metamask if unconnected and balances if connected -->
    <Popover className="relative h-full flex ml-2">
      <PopoverButton>
        <img
          class="filter hover:brightness-75 h-full"
          src="@/assets/help-svgrepo-com.svg"
        />
      </PopoverButton>

      <PopoverPanel
        className="popover absolute top-16 z-10 bg-steel-800 w-64 p-2 rounded-md right-0 shadow-lg"
      >
        <h1 class="text-xl font-bold">Need some help?</h1>
        <hr class="opacity-30 my-1" />
        <div class="text-sm">
          <div v-if="hasEthereumProvider">
            <p v-if="hasSigner">
              1) First select a game you want to play with the menu on the left!
              <br /><br />
              2) Next, deposit some crypto from your wallet to the game using
              the exchange button above (
              <img
                src="@/assets/arrows-svgrepo-com.svg"
                class="inline"
                width="20"
              />
              ). <br />
              <span class="font-bold text-xs"
                >Make sure to leave some crypto in your wallet to pay gas fees!
              </span>
              <br /><br />
              3) Start playing!
            </p>
            <p v-else>
              We see you've got a wallet installed on this device - perfect!
              <br />
              Hit the connect button above (
              <img src="@/assets/metamask-fox.svg" class="inline" width="20" />
              ) to start by depositing some crypto and get playing.
            </p>
          </div>
          <p v-else>
            It seems you don't have a wallet installed on this device. <br />
            We recommends using
            <a href="https://metamask.io/" class="underline">MetaMask</a>. Hit
            the connect button above (
            <img src="@/assets/metamask-fox.svg" class="inline" width="20" />
            ) to open the their site and install the app or browser extension!
          </p>
        </div>
      </PopoverPanel>
    </Popover>
  </div>
</template>

<script>
import store from "../store/index";
import { mapState, mapGetters } from "vuex";
import FundsMenu from "./FundsMenu.vue";
import BalanceBox from "./BalanceBox.vue";
import {
  Dialog,
  DialogOverlay,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/vue";
import Sidebar from "./Sidebar.vue";

export default {
  name: "Header",
  components: {
    Dialog,
    DialogOverlay,
    FundsMenu,
    BalanceBox,
    Popover,
    PopoverPanel,
    PopoverButton,
    Sidebar,
  },
  data() {
    return {
      isBankOpen: false,
      isSidebarModalOpen: false,
    };
  },
  computed: {
    ...mapState(["balance", "game", "bankBalance"]),
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