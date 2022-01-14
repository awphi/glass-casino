<template>
  <div class="flex flex-row items-center h-10">
    <h1 class="text-center w-full" v-if="history.length == 0">
      Oops! Looks like there's been no games recently...
    </h1>
    <div
      class="history-node"
      v-for="h in history"
      :key="h.transactionHash"
      :class="{
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
import { markRaw } from "vue";
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
    ...mapState(["provider"]),
  },
  async mounted() {
    // Unfortunate hack becase of Vue 3's reactivity system hating ES6 classes like the ones from ethers :(
    this.contractInternal = markRaw(this.contract);
    const b = await this.provider.getBlockNumber();
    const filter = this.contractInternal.filters.OutcomeDecided();

    // Can only query 1000 blocks with free RPC
    this.history = await this.contractInternal.queryFilter(filter, b - 1000, b);
    this.history = this.history.reverse().slice(0, 10);
  },
  props: ["contract"],
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