<template>
  <!-- TODO: why does adding flex-wrap to the following break the bet history display? (it will extend forever) -->
  <div class="flex flex-row gap-6">
    <div class="flex flex-col gap-6 flex-1">
      <div class="box flex justify-center items-center space-x-6 flex-1">
        <Dice ref="dice0" :initialNumber="1"></Dice>
        <Dice ref="dice1" :initialNumber="2"></Dice>
        <Dice ref="dice2" :initialNumber="3"></Dice>
      </div>

      <div class="box">
        <StakeSelector ref="stakeSelector"></StakeSelector>
        <hr class="w-full opacity-30 mb-8 mt-8" />
        <div class="grid grid-cols-3 grid-rows-2 gap-1">
          <button
            class="bg-steel-700 rounded-md shadow-sm p-2 text-xl h-16"
            v-for="i in [1, 2, 3, 4, 5, 6]"
            :key="i"
            @click="bet(i)"
          >
            {{ i }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 w-1/3">
      <div class="box flex flex-col">Pending bet</div>
      <div class="box bet-box min-h-0 flex flex-1 flex-col">
        <h1 class="text-2xl font-bold">Game History</h1>
        <hr class="w-full opacity-30 my-2" />
        <div class="overflow-y-auto"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from "vuex";
import StakeSelector from "../components/StakeSelector.vue";
import Dice from "../components/Dice.vue";

export default {
  name: "ChuckALuck",
  components: {
    StakeSelector,
    Dice,
  },
  data() {
    return {
      pendingRequest: false,
    };
  },
  computed: {
    ...mapState(["signer", "provider", "chain", "game", "bankBalance"]),
    ...mapGetters(["hasSigner"]),
  },
  methods: {
    ...mapMutations(["setContract"]),
    ...mapActions(["refreshBalance"]),
    async roll(rolls) {
      const promises = [];
      for (var i = 0; i < 3; i++) {
        const dice = this.$refs[`dice${i}`];
        promises.push(dice.rollTo(rolls[i], 250, 4 * (i + 2)));
      }

      return Promise.all(promises);
    },
    async bet(bet) {
      const stake = this.$refs.stakeSelector;
      if (stake.betAmount.lte(0)) {
        window.alert("Invalid bet amount, bet must be > 0!");
        return;
      }

      if (stake.betAmount.gt(this.bankBalance)) {
        window.alert("Insufficient funds to cover bet!");
        return;
      }

      if (this.pending) {
        window.alert(
          "Game already in progress - please try again after completion!"
        );
        return;
      }

      try {
        // See comments in Roulette.vue for this mess
        const metamaskTx = await this.game.contract.play(bet, stake.betAmount);
        this.pending = true;
        const tx = await this.provider.getTransaction(metamaskTx.hash);
        await tx.wait();
        this.refreshBalance();
      } catch (e) {
        // User reject is 4001
        if (e.code != 4001) {
          console.error(e);
        }
      }
    },
  },
  mounted() {
    // TODO history using GameComplete
    // TODO pending anim using GameStart
    this.game.contract.on(
      this.game.contract.filters.GameComplete(),
      async (rolls, bet, c) => {
        if (!this.hasSigner || bet.player !== this.signer._address) {
          return;
        }
        console.log(bet, rolls);
        const anim = this.roll(rolls.map((a) => a.toNumber()));
        const tx = await c.getTransaction();
        await Promise.all([tx.wait(), anim]);
        // TODO animate gains/losses
        this.refreshBalance();
        this.pending = false;
      }
    );
  },
};
</script>

<style scoped>
.wrapper {
  @apply gap-6 grid;
  grid-template-rows: minmax(0, 1fr);
}
</style>