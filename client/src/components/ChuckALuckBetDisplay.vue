<template>
  <div class="w-full flex flex-col bg-steel-700 rounded-md mb-2 p-2 pb-1">
    <div class="flex flex-row items-center">
      <div class="flex flex-row bg-steel-800 p-2 rounded-md">
        <Dice class="mini-dice bg-gray-900" :initialNumber="game.bet"></Dice>
      </div>
      <img
        src="@/assets/right-thin-chevron-svgrepo-com.svg"
        width="12"
        class="mx-1"
      />
      <div class="flex flex-row bg-steel-800 p-2 rounded-md gap-2">
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="game.rolls[0]"
        ></Dice>
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="game.rolls[1]"
        ></Dice>
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="game.rolls[2]"
        ></Dice>
      </div>

      <div class="flex-1 spacer" />
      <div class="bet-amount-box bg-steel-800">
        <p
          class="pr-1 flex-1 text-red-500"
          :class="{ 'text-green-500 font-bold': sum > 0 }"
        >
          {{ sum > 0 ? "+" : "-" }}{{ formatEther(sum) }}
        </p>
        <img src="@/assets/matic-token-icon.svg" width="16" />
      </div>
    </div>
    <hr class="opacity-30 mb-1 mt-2" />

    <div class="flex flex-row items-end">
      <a
        class="
          flex-1
          text-xs
          whitespace-nowrap
          overflow-hidden overflow-ellipsis
          better-link
        "
        target="_blank"
        :href="`${this.chain.blockExplorerUrls[0]}/address/${contract_address}?fromaddress=${game.player}`"
      >
        {{ game.player }}
      </a>
      <p class="timestamp text-xs ml-6 opacity-50">
        {{ timestampFormatted }}
      </p>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { mapState } from "vuex";
import Dice from "./Dice.vue";

export default {
  name: "RouletteBetDisplay",
  computed: {
    ...mapState(["chain", "game"]),
    timestampFormatted() {
      const t = new Date(this.game.timestamp.toNumber() * 1000);
      const h = t.getHours().toString().padStart(2, "0");
      const m = t.getMinutes().toString().padStart(2, "0");
      const s = t.getSeconds().toString().padStart(2, "0");
      return `${h}:${m}:${s}`;
    },
    sum() {
      return this.game.winnings.sub(this.game.bet_amount);
    },
  },
  methods: {
    formatEther(v) {
      return ethers.utils.formatEther(v).padEnd(5, "0");
    },
  },
  props: ["game", "contract_address"],
  components: { Dice },
};
</script>

<style scoped>
.bet-amount-box {
  @apply pl-1 pr-1 rounded-md flex items-center text-sm p-2;
}

.better-link {
  opacity: 90%;
}

.better-link:hover {
  opacity: 70%;
}

.mini-dice {
  @apply w-6 h-6 p-1 rounded-sm;
}
</style>