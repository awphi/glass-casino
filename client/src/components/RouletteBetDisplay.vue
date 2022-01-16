<template>
  <div class="w-full flex flex-col bg-steel-700 rounded-md mb-2 p-2 pb-1">
    <div class="flex flex-row">
      <!-- TODO support other bet types styling here -->
      <div
        class="bet-box"
        :class="{ 'bg-red-600': bet === 0, ' bg-gray-800': bet === 1 }"
        v-if="bet_type == 0"
      >
        <p class="text-sm text-center">{{ bet === 0 ? "Red" : "Black" }}</p>
      </div>
      <div
        class="bet-box"
        :class="{ 'bg-blue-600': bet === 0, 'bg-green-600': bet === 1 }"
        v-if="bet_type == 1"
      >
        <p class="text-sm text-center">{{ bet === 0 ? "Even" : "Odd" }}</p>
      </div>
      <div class="bet-box bg-purple-600" v-if="bet_type == 2">
        <p class="text-sm text-center whitespace-nowrap">{{ bet }} S.U.</p>
      </div>

      <div class="flex-1 spacer" />
      <div class="bet-amount-box bg-steel-800">
        <p class="pr-1 flex-1">{{ betAmountFormatted }}</p>
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
        :href="`${this.chain.blockExplorerUrls[0]}/address/${contract_address}?fromaddress=${better_address}`"
      >
        {{ better_address }}
      </a>
      <p class="timestamp text-xs ml-6 opacity-50">
        {{ timestampFormatted }}
      </p>
    </div>
  </div>
</template>

<script>
import { BigNumber, ethers } from "ethers";
import { mapState } from "vuex";

export default {
  name: "RouletteBetDisplay",
  computed: {
    ...mapState(["chain"]),
    timestampFormatted() {
      const t = this.timestamp;
      const h = t.getHours().toString().padStart(2, "0");
      const m = t.getMinutes().toString().padStart(2, "0");
      const s = t.getSeconds().toString().padStart(2, "0");
      return `${h}:${m}:${s}`;
    },
    betAmountFormatted() {
      return ethers.utils.formatUnits(this.bet_amount, "ether").padEnd(5, "0");
    },
  },
  props: {
    better_address: {
      type: String,
      default: "",
    },
    bet_type: {
      type: Number,
      default: 0,
    },
    contract_address: {
      type: String,
      default: "null",
    },
    bet_amount: {
      type: BigNumber,
      default: BigNumber.from(0n),
    },
    timestamp: {
      type: Date,
      default: new Date(),
    },
    bet: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style scoped>
.bet-box {
  @apply rounded-md p-0.5 pl-1 pr-1;
}

.bet-amount-box {
  @apply pl-1 pr-1 rounded-md flex items-center text-sm;
}

.better-link {
  opacity: 90%;
}

.better-link:hover {
  opacity: 70%;
}
</style>