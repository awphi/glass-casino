<template>
  <div class="flex flex-row items-center h-10">
    <h1 class="text-center w-full" v-if="history.length == 0">
      Looks like there's been no games recently...
    </h1>
    <div
      class="history-node"
      v-for="h in history"
      :key="h.transactionHash"
      :class="{
        'bg-green-500': h.args.roll == 0,
        'bg-red-600': isRed(h.args.roll),
        'bg-gray-800': !isRed(h.args.roll),
      }"
    >
      <p>{{ h.args.roll }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { isRed } from "../utils/roulette-utils";

export default {
  name: "RouletteHistory",
  data() {
    return {
      history: [],
      contractInternal: null,
    };
  },
  computed: {
    ...mapState(["provider", "game"]),
  },
  async mounted() {
    let p = this.game.contract.filters.OutcomeDecided();
    const b = await this.provider.getBlockNumber();

    // Can only query 1000 blocks with free RPC
    let h = await this.game.contract.queryFilter(p, b - 1000, b);
    this.history = h.reverse().slice(0, 10);
  },
  methods: {
    add(tx) {
      this.history = [tx, ...this.history].slice(0, 10);
    },
    isRed(r) {
      return isRed(r);
    },
  },
};
</script>

<style scoped>
.history-node {
  @apply p-2 rounded-full h-10 w-10 flex justify-center items-center;
}

.history-node + .history-node {
  @apply ml-1;
}
</style>