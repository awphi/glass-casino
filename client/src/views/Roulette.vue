<template>
  <div class="flex flex-row gap-6 h-full">
    <div class="flex flex-col flex-1 gap-6">
      <div class="box flex flex-1 items-center justify-center">
        <VueCountdown
          @end="countdownEnded()"
          :time="nextRoll"
          :interval="100"
          class="w-full lg:w-4/5 h-16 relative"
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

      <RouletteBetControls class="w-full" />
    </div>

    <div class="flex flex-col gap-6 w-full h-full lg:w-1/4 lg:flex-col-reverse">
      <div class="box">
        <h1 class="text-2xl font-bold">Recent Outcomes</h1>
        <p class="text-xs">Newest → Oldest (within 50 blocks)</p>
        <hr class="w-full opacity-30 mb-2 mt-2" />
        <RouletteHistory ref="history" :blocks="50" />
      </div>

      <div class="box current-bets-box flex flex-col flex-1">
        <div class="flex flex-row items-center">
          <h1 class="mr-auto text-2xl font-bold">Current Bets</h1>
          <BalanceBox class="ml-2 min-w-max" :value="betSum" />
        </div>
        <hr class="w-full opacity-30 my-2" />
        <div class="overflow-y-auto">
          <RouletteBetDisplay v-for="b in bets" :key="b" :transaction="b" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    countdownEnded() {
      if (this.$refs.wheel && this.nextRoll > 0) {
        console.log("countdownEnded -> nextRoll:", this.nextRoll);
        this.$refs.wheel.startSpinning();
        this.nextRoll = 0;
      }
    },
    updateTimer(gameData) {
      if (
        this.game.contract &&
        this.game.contract.address in gameData &&
        this.nextRoll == 0
      ) {
        const r = gameData[this.game.contract.address].nextRoll - Date.now();
        console.log("updateTimer -> r:", r);
        if (r > 0) {
          this.nextRoll = r;
        }
      }
    },
  },
  async mounted() {
    console.log("mounted");
    this.updateTimer(this.gameData);

    this.game.contract.on(
      this.game.contract.filters.OutcomeDecided(),
      async (roll, receipt) => {
        console.log("OutcomeDecided", roll, receipt);
        const tx = await receipt.getTransaction();
        await tx.wait();
        await this.$refs.wheel.stopSpinningOn(roll.toNumber());

        this.bets = [];
        this.$refs.history.add(receipt);
      }
    );

    this.game.contract.on(
      this.game.contract.filters.BetPlaced(),
      async (bet, receipt) => {
        console.log("BetPlaced", bet, receipt);
        const tx = await receipt.getTransaction();
        await tx.wait();
        this.bets.push({ ...bet, transactionHash: receipt.transactionHash });
      }
    );

    this.game.contract
      .lastRoll()
      .then((blockNum) =>
        this.game.contract.queryFilter(
          this.game.contract.filters.BetPlaced(),
          blockNum.toNumber()
        )
      )
      .then((results) => {
        results.forEach((receipt) => {
          this.bets.push({
            ...receipt.args.bet,
            transactionHash: receipt.transactionHash,
          });
        });
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
.wheel-sheath {
  @apply w-full h-full flex items-center justify-center rounded-md absolute bg-black bg-opacity-80;
}

.current-bets-box {
  height: 500px;
}

.clearfix:after {
  content: ".";
  visibility: hidden;
  display: block;
  height: 0;
  clear: both;
}
</style>