<template>
  <div class="w-full flex flex-col bg-steel-700 rounded-md mb-2 p-2 pb-1">
    <div class="flex flex-row items-center">
      <div class="flex flex-row bg-steel-800 p-2 rounded-md">
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="transaction.bet"
        ></Dice>
      </div>
      <img
        src="@/assets/right-thin-chevron-svgrepo-com.svg"
        width="12"
        class="mx-1"
      />
      <div class="flex flex-row bg-steel-800 p-2 rounded-md gap-2">
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="transaction.rolls[0]"
        ></Dice>
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="transaction.rolls[1]"
        ></Dice>
        <Dice
          class="mini-dice bg-gray-900"
          :initialNumber="transaction.rolls[2]"
        ></Dice>
      </div>

      <div class="flex-1 spacer" />
      <div
        class="px-1.5 py-1 rounded-md flex items-center text-sm bg-steel-800"
      >
        <p
          class="pr-1 flex-1 font-bold"
          :class="{ 'text-red-500': sum < 0, 'text-green-500': sum > 0 }"
        >
          {{ sum > 0 ? "+" : "" }}{{ formatEther(sum) }}
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
          opacity-90
          hover:opacity-70
        "
        target="_blank"
        :href="`${this.chain.blockExplorerUrls[0]}/tx/${transaction.transactionHash}`"
      >
        {{ transaction.transactionHash }}
      </a>
      <p class="timestamp text-xs ml-6 opacity-50">
        {{ formatTimestamp(transaction.timestamp.mul(1000).toNumber()) }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Dice from "./Dice.vue";
import TimestampMixin from "../mixins/TimestampMixin";
import EtherFormatMixin from "../mixins/EtherFormatMixin";

export default {
  name: "RouletteBetDisplay",
  mixins: [TimestampMixin, EtherFormatMixin],
  computed: {
    ...mapState(["chain", "game"]),
    sum() {
      return this.transaction.winnings.sub(this.transaction.bet_amount);
    },
  },
  props: ["transaction", "contract_address"],
  components: { Dice },
};
</script>

<style scoped>
.mini-dice {
  @apply w-6 h-6 p-1 rounded-sm;
}
</style>