<template>
  <div class="m-0 h-full flex flex-col">
    <Header />
    <div class="flex-1 flex flex-row">
      <div
        class="
          h-full
          w-40
          flex-shrink-0
          bg-steel-600
          shadow-md
          p-4
          pb-16
          pr-0
          flex flex-col
        "
      >
        <router-link to="roulette" class="menu-item">
          <img src="@/assets/roulette-icon.svg" width="20" />
          <h1 class="menu-text">Roulette</h1>
        </router-link>
        <router-link to="dice" class="menu-item">
          <img src="@/assets/dices-svgrepo-com.svg" width="20" />
          <h1 class="menu-text flex">Dice</h1>
        </router-link>
        <div class="flex-1"></div>

        <div
          v-if="game.contract"
          class="p-2 rounded-l-md flex mb-2 bg-steel-700 flex-col"
        >
          <h1 class="font-bold text-sm">Contract Info</h1>
          <hr class="opacity-30 my-1 w-full" />
          <div class="text-xs flex flex-col">
            <h1 class="whitespace-nowrap overflow-hidden overflow-ellipsis">
              Address:
              <a
                target="_blank"
                class="underline"
                :href="`${this.chain.blockExplorerUrls[0]}/address/${currentGameAddress}`"
              >
                {{ currentGameAddress }}
              </a>
            </h1>
            <div class="flex mt-1">
              <p>Balance:</p>
              <div class="flex-1"></div>
              <div class="flex">
                {{ formatEther(linkBalance) }}
                <img src="@/assets/LINK-blue.svg" class="ml-0.5" width="12" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <router-view class="p-6 flex-1"></router-view>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import { mapState } from "vuex";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import linkJson from "../../build/contracts/LinkTokenInterface.json";
import { markRaw } from "@vue/reactivity";

export default {
  name: "App",
  components: { Header },
  data() {
    return {
      linkBalance: BigNumber.from(0n),
      linkContract: null,
    };
  },
  methods: {
    formatEther(val) {
      return ethers.utils.formatEther(val);
    },
    updateGameBalance() {
      this.linkContract
        .balanceOf(this.currentGameAddress)
        .then((v) => (this.linkBalance = v));
    },
  },
  mounted() {
    this.linkContract = markRaw(
      new ethers.Contract(this.chain.linkAddress, linkJson.abi, this.provider)
    );

    this.provider.on("block", (n) => {
      if (this.currentGameAddress == null || n % 10 !== 0) {
        return;
      }

      this.updateGameBalance();
    });
  },
  computed: {
    ...mapState(["signer", "provider", "chain", "game"]),
    currentGameAddress() {
      if (this.game.contract) {
        return this.game.contract.address;
      }
      return null;
    },
  },
  watch: {
    game: {
      deep: true,
      handler() {
        this.updateGameBalance();
      },
    },
  },
};
</script>

<style>
body,
html,
#app {
  @apply h-full;
}

body {
  @apply m-0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-steel-200;
}
</style>

<style scoped>
.menu-item {
  @apply p-2 rounded-l-md flex flex-row items-center cursor-pointer hover:bg-steel-700;
}

.menu-item + .menu-item {
  @apply mt-2;
}

.router-link-active {
  @apply bg-steel-800;
}

.menu-text {
  @apply text-xl ml-2 flex-1 text-left;
}
</style>