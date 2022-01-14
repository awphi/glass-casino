<template>
  <div class="wrapper flex flex-row h-full">
    <div class="flex flex-col w-full">
      <div class="box wheel-box">
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
          <RouletteWheel ref="wheel" class="w-full h-full" />
        </VueCountdown>
      </div>
      <RouletteBetControls
        class="mt-6 justify-self-center flex-1"
        :contract="contract"
      />
      <div class="box mt-6">
        <h1 class="text-2xl font-bold">Recent Outcomes</h1>
        <p class="text-xs">Most Recent → (within 1000 blocks)</p>
        <hr class="w-full opacity-30 mb-2 mt-2" />
        <RouletteHistory ref="history" :contract="contract" />
      </div>
    </div>

    <div class="flex flex-col w-1/4 ml-6">
      <div class="box bets-list flex-1">
        <div class="flex flex-row items-center">
          <h1 class="text-2xl font-bold">Current Bets</h1>
          <div class="flex-1"></div>
          <div
            class="
              flex flex-row
              items-center
              bg-bop-20
              rounded-md
              p-1
              min-w-max
            "
          >
            <p class="pr-1 text-lg">{{ betSumFormatted }}</p>
            <img src="@/assets/matic-token-icon.svg" width="20" />
          </div>
        </div>
        <hr class="w-full opacity-30 mb-2 mt-2" />
        <div class="overflow-y-auto h-full">
          <RouletteBetDisplay
            v-for="b in bets"
            :key="b"
            :better_address="b.player"
            :contract_address="contract ? contract.address : ''"
            :bet_type="b.bet_type"
            :bet_amount="b.bet_amount"
            :bet="b.bet.toNumber()"
            :timestamp="new Date(b.timestamp.toNumber() * 1000)"
          />
        </div>
      </div>
      <div
        class="
          box
          mt-6
          overflow-ellipsis
          whitespace-nowrap
          overflow-hidden
          text-white
          flex flex-col
        "
      >
        <h1 class="text-2xl font-bold">Relevant Addresses</h1>
        <hr class="w-full opacity-30 mb-2 mt-2" />
        <!-- TODO on hover clicky clicky -->
        <p class="text-xs whitespace-nowrap overflow-hidden overflow-ellipsis">
          Game:
          <a
            :href="`${chain.blockExplorerUrls[0]}/address/${contract.address}`"
            target="_blank"
            class="underline opacity-90"
            >{{ contract.address }}</a
          >
        </p>
        <p class="text-xs whitespace-nowrap overflow-hidden overflow-ellipsis">
          House:
          <a
            :href="`${chain.blockExplorerUrls[0]}/address/${contract.owner}`"
            target="_blank"
            class="underline opacity-90"
            >{{ contract.owner }}</a
          >
        </p>
        <p class="text-xs whitespace-nowrap overflow-hidden overflow-ellipsis">
          Bank:
          <a
            :href="`${chain.blockExplorerUrls[0]}/address/${contract.owner}`"
            target="_blank"
            class="underline opacity-90"
            >TODO</a
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import rouletteJson from "../../../build/contracts/Roulette.json";
import { mapState } from "vuex";
import { BigNumber, ethers } from "ethers";
import { markRaw } from "vue";
import RouletteWheel from "../components/RouletteWheel.vue";
import RouletteBetDisplay from "../components/RouletteBetDisplay.vue";
import VueCountdown from "@chenfengyuan/vue-countdown";
import RouletteBetControls from "../components/RouletteBetControls.vue";
import RouletteHistory from "../components/RouletteHistory.vue";

export default {
  name: "Roulette",
  components: {
    RouletteWheel,
    RouletteBetDisplay,
    VueCountdown,
    RouletteBetControls,
    RouletteHistory,
  },
  data() {
    return {
      contract: null,
      nextRoll: 0,
      bets: [],
    };
  },
  computed: {
    ...mapState(["provider", "signer", "provider", "gameData", "chain"]),
    betSumFormatted() {
      var s = BigNumber.from(0);
      this.bets.forEach((i) => {
        s = s.add(i.bet_amount);
      });
      return ethers.utils.formatUnits(s, "ether");
    },
  },
  methods: {
    updateTimer(gameData) {
      if (this.contract && this.contract.address in gameData) {
        var r = gameData[this.contract.address].nextRoll - Date.now();

        // Avoid collisions as if the values are the same, won't trigger be reactive!
        if (this.nextRoll == r) {
          r += 1;
        }

        this.nextRoll = r;
        console.log(this.nextRoll);
      }
    },
  },
  beforeMount() {
    this.contract = markRaw(
      new ethers.Contract(
        rouletteJson.networks[Number(this.chain.chainId)].address,
        rouletteJson.abi,
        this.provider
      )
    );
  },
  mounted() {
    this.updateTimer(this.gameData);

    this.contract.on(
      this.contract.filters.OutcomeDecided(),
      async (roll, tx) => {
        console.log("Roll:", roll.toNumber());
        await this.$refs.wheel.stopSpinningOn(roll.toNumber());

        // TODO animate wins/losses
        this.bets = [];
        this.$refs.history.add(tx);
      }
    );

    this.contract.on(this.contract.filters.BetPlaced(), (b) => {
      this.bets = [...this.bets, b];
    });

    this.contract.get_bets().then((r) => {
      this.bets = r;
    });

    this.contract.house().then((h) => {
      this.contract.owner = h;
    });
  },
  watch: {
    signer(signer) {
      if (signer == null) {
        console.log("Disonnecting contract from signer!");
        this.contract = this.contract.connect();
      } else {
        console.log("Connecting to contract with signer!");
        this.contract = this.contract.connect(signer);
      }
    },
    gameData: {
      handler: "updateTimer",
      deep: true,
    },
  },
};
</script>

<style scoped>
.bets-list {
  @apply pt-4 pb-4 overflow-hidden;
}

.wheel-box {
  @apply shadow-lg flex flex-col items-center;
}

.wheel-sheath {
  @apply w-full h-full flex items-center justify-center rounded-md absolute bg-black bg-opacity-80;
}

.loading::after {
  display: inline-block;
  animation: dotty steps(1, end) 2s infinite;
  content: "";
}

@keyframes dotty {
  0% {
    content: "";
  }
  25% {
    content: ".";
  }
  50% {
    content: "..";
  }
  75% {
    content: "...";
  }
  100% {
    content: "";
  }
}
</style>