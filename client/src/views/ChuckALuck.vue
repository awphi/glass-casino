<template>
  <div class="wrapper">
    <div class="box flex justify-center items-center space-x-6">
      <Dice :number="1"></Dice>
      <Dice :number="2"></Dice>
      <Dice :number="3"></Dice>
    </div>
    <div class="box history-box row-span-2"></div>
    <div class="box">
      <StakeSelector></StakeSelector>
      <hr class="w-full opacity-30 mb-8 mt-8" />
      <div class="grid grid-cols-3 grid-rows-2 gap-1">
        <button
          class="bg-steel-700 rounded-md shadow-sm p-2 text-xl h-16"
          v-for="i in [1, 2, 3, 4, 5, 6]"
          :key="i"
        >
          {{ i }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import chuckaluckJson from "../../../build/contracts/ChuckALuck.json";
import { mapMutations, mapState } from "vuex";
import { BigNumber } from "ethers";
import StakeSelector from "../components/StakeSelector.vue";
import Dice from "../components/Dice.vue";

export default {
  name: "ChuckALuck",
  components: {
    StakeSelector,
    Dice,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(["signer", "provider", "chain", "game"]),
    betSum() {
      var s = BigNumber.from(0);
      this.bets.forEach((i) => {
        s = s.add(i.bet_amount);
      });
      return s;
    },
  },
  methods: {
    ...mapMutations(["setContract"]),
  },
  beforeMount() {
    this.setContract({
      address: chuckaluckJson.networks[Number(this.chain.chainId)].address,
      abi: chuckaluckJson.abi,
    });
  },
  mounted() {
    this.game.contract.on(
      this.game.contract.filters.RandomnessFulfilled(),
      async (b, c) => {
        const tx = await c.getTransaction();
        await tx.wait();
        this.bets = [...this.bets, b];
      }
    );
  },
};
</script>

<style scoped>
.wrapper {
  @apply gap-6 grid h-full;
  grid-template-columns: 3fr 1.2fr;
  grid-template-rows: minmax(0, 1fr);
}
</style>