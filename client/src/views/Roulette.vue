<template>
  <div class="wrapper">
    <div class="box flex items-center justify-center">
      <VueCountdown
        @end="if ($refs.wheel) $refs.wheel.startSpinning();"
        :time="nextRoll"
        :interval="100"
        class="w-4/5 h-16 relative"
        v-slot="{ seconds, milliseconds, totalMilliseconds }"
      >
        <div
          v-if="totalMilliseconds > 0 || bets.length == 0"
          class="wheel-sheath"
        >
          <p v-if="totalMilliseconds > 0" class="text-4xl">
            {{ seconds }}.{{ Math.floor(milliseconds / 100) }}
          </p>
          <p v-else class="text-2xl loading">Awaiting bets</p>
        </div>
        <RouletteWheel ref="wheel" />
      </VueCountdown>
    </div>

    <div class="box pt-4 pb-4 overflow-hidden row-span-3">
      <div class="flex flex-row items-center">
        <h1 class="text-2xl font-bold">Current Bets</h1>
        <div class="flex-1"></div>
        <BalanceBox :value="betSum" />
      </div>
      <hr class="w-full opacity-30 mb-2 mt-2" />
      <div class="overflow-y-auto h-full">
        <RouletteBetDisplay
          v-for="b in bets"
          :key="b"
          :better_address="b.player"
          :contract_address="game.contract.address"
          :bet_type="b.bet_type"
          :bet_amount="b.bet_amount"
          :bet="b.bet.toNumber()"
          :timestamp="new Date(b.timestamp.toNumber() * 1000)"
        />
      </div>
    </div>
    <RouletteBetControls class="w-full justify-self-center flex-1" />
    <div class="box">
      <h1 class="text-2xl font-bold">Recent Outcomes</h1>
      <p class="text-xs">Most Recent → (within 20 blocks)</p>
      <hr class="w-full opacity-30 mb-2 mt-2" />
      <RouletteHistory ref="history" />
    </div>
  </div>
</template>

<script>
import rouletteJson from "../../../build/contracts/Roulette.json";
import { mapMutations, mapState } from "vuex";
import { BigNumber } from "ethers";
import RouletteWheel from "../components/RouletteWheel.vue";
import RouletteBetDisplay from "../components/RouletteBetDisplay.vue";
import VueCountdown from "@chenfengyuan/vue-countdown";
import RouletteBetControls from "../components/RouletteBetControls.vue";
import RouletteHistory from "../components/RouletteHistory.vue";
import BalanceBox from "../components/BalanceBox.vue";

export default {
  name: "Roulette",
  components: {
    RouletteWheel,
    RouletteBetDisplay,
    VueCountdown,
    RouletteBetControls,
    RouletteHistory,
    BalanceBox,
  },
  data() {
    return {
      nextRoll: 0,
      bets: [],
    };
  },
  computed: {
    ...mapState(["provider", "signer", "gameData", "chain", "game"]),
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
    updateTimer(gameData) {
      if (this.game.contract && this.game.contract.address in gameData) {
        var r = gameData[this.game.contract.address].nextRoll - Date.now();

        // Avoid collisions as if the values are the same, won't trigger be reactive!
        if (this.nextRoll == r) {
          r += 1;
        }

        this.nextRoll = r;
      }
    },
  },
  beforeMount() {
    this.setContract({
      address: rouletteJson.networks[Number(this.chain.chainId)].address,
      abi: rouletteJson.abi,
    });
  },
  mounted() {
    this.updateTimer(this.gameData);

    this.game.contract.on(
      this.game.contract.filters.OutcomeDecided(),
      async (roll, tx) => {
        console.log("Roll:", roll.toNumber());
        await this.$refs.wheel.stopSpinningOn(roll.toNumber());

        // TODO animate wins/losses
        this.bets = [];
        this.$refs.history.add(tx);
      }
    );

    this.game.contract.on(
      this.game.contract.filters.BetPlaced(),
      async (b, c) => {
        const tx = await c.getTransaction();
        await tx.wait();
        this.bets = [...this.bets, b];
      }
    );

    this.game.contract.get_bets().then((r) => {
      this.bets = r;
    });
  },
  watch: {
    gameData: {
      handler: "updateTimer",
      deep: true,
    },
  },
};
</script>

<style scoped>
.wrapper {
  @apply gap-6 grid h-full;
  grid-template-columns: 3fr 1.2fr;
}

.wheel-sheath {
  @apply w-full h-full flex items-center justify-center rounded-md absolute bg-black bg-opacity-80;
}
</style>