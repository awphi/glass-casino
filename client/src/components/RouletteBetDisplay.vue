<template>
  <div class="w-full flex flex-col bg-steel-700 rounded-md mb-2 p-2 pb-1">
    <div class="flex flex-row">
      <!-- TODO support other bet types styling here -->
      <div
        class="bet-box"
        :class="{
          'bg-red-600': transaction.bet === 0,
          ' bg-gray-800': transaction.bet === 1,
        }"
        v-if="transaction.bet_type == 0"
      >
        <p class="text-sm text-center">
          {{ transaction.bet === 0 ? "Red" : "Black" }}
        </p>
      </div>
      <div
        class="bet-box"
        :class="{
          'bg-blue-600': transaction.bet === 0,
          'bg-green-600': transaction.bet === 1,
        }"
        v-if="transaction.bet_type == 1"
      >
        <p class="text-sm text-center">
          {{ transaction.bet === 0 ? "Even" : "Odd" }}
        </p>
      </div>
      <div class="bet-box bg-purple-600" v-if="transaction.bet_type == 2">
        <p class="text-sm text-center whitespace-nowrap">
          {{ transaction.bet }} S.U.
        </p>
      </div>

      <div class="flex-1 spacer" />
      <div
        class="px-1.5 py-1 rounded-md flex items-center text-sm bg-steel-800"
      >
        <p class="pr-1 flex-1">{{ formatEther(transaction.bet_amount) }}</p>
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
        :href="`${chain.blockExplorerUrls[0]}/tx/${transaction.transactionHash}`"
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
import TimestampMixin from "../mixins/TimestampMixin";
import EtherFormatMixin from "../mixins/EtherFormatMixin";

export default {
  name: "RouletteBetDisplay",
  mixins: [TimestampMixin, EtherFormatMixin],
  computed: {
    ...mapState(["chain", "game"]),
  },
  props: ["transaction"],
};
</script>

<style scoped>
.bet-box {
  @apply rounded-md px-1.5 flex items-center;
}
</style>