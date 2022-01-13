<template>
  <div class="wrapper flex flex-row h-full">
    <div class="flex flex-col w-full">
      <div class="wheel-box">
        <VueCountdown
          @end="if ($refs.wheel) $refs.wheel.startSpinning();"
          :time="nextRoll"
          :interval="100"
          class="w-4/5 h-16 relative"
          v-slot="{ seconds, milliseconds, totalMilliseconds }"
        >
          <div
            v-if="totalMilliseconds > 0"
            class="
              w-full
              h-full
              flex
              items-center
              justify-center
              rounded-md
              absolute
              bg-black bg-opacity-80
            "
          >
            <p class="text-4xl">
              {{ seconds }}.{{ Math.floor(milliseconds / 100) }}
            </p>
          </div>
          <RouletteWheel ref="wheel" class="w-full h-full" />
        </VueCountdown>
      </div>
      <div class="menu-box flex flex-col">
        <div class="flex flex-row items-center justify-center">
          <button class="mr-2 bg-bop-20 rounded-md p-2">-0.01</button>
          <div class="h-full flex relative items-center">
            <input
              class="
                h-full
                text-center
                bg-bop-20
                pl-12
                pr-12
                w-48
                text-white
                rounded-md
              "
              type="number"
              v-model="betInput"
            />
            <div
              class="
                absolute
                right-0
                bg-bop-10
                flex
                items-center
                justify-center
                p-1.5
                mr-1
                rounded-lg
              "
            >
              <img src="@/assets/matic-token-icon.svg" width="20" />
            </div>
          </div>
          <button class="ml-2 bg-bop-20 rounded-md p-2">+0.01</button>
        </div>
        <hr class="w-full opacity-30 mb-8 mt-8" />
      </div>
    </div>
    <div class="bets-list">
      <div class="flex flex-row items-center">
        <h1 class="text-2xl font-bold">Current Bets</h1>
        <div class="flex-1"></div>
        <div
          class="flex flex-row items-center bg-bop-20 rounded-md p-1 min-w-max"
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

export default {
  name: "Roulette",
  components: {
    RouletteWheel,
    RouletteBetDisplay,
    VueCountdown,
  },
  data() {
    return {
      // TODO use history (on contract) to set this variable initially to position the wheel
      contract: null,
      nextRoll: 0,
      bets: [],
      betInput: 0.01,
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
  mounted() {
    this.contract = markRaw(
      new ethers.Contract(
        rouletteJson.networks[Number(this.chain.chainId)].address,
        rouletteJson.abi,
        this.provider
      )
    );

    this.updateTimer(this.gameData);

    this.contract.on(this.contract.filters["OutcomeDecided"](), (roll) => {
      //console.log("Roll:", roll);
      this.$refs.wheel.stopSpinningOn(roll.toNumber());
    });

    this.contract.on(this.contract.filters["BetPlaced"](), (b) => {
      this.bets = [...this.bets, b];
    });

    this.contract.get_bets().then((r) => {
      this.bets = r;
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
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

.box {
  @apply bg-gray-700 p-8 rounded-md shadow-md;
}

.bets-list {
  @apply box pt-4 pb-4 w-1/4 overflow-hidden ml-6;
}

.menu-box {
  @apply box mt-6 flex-1;
}

.wheel-box {
  @apply box shadow-lg flex flex-col items-center;
}
</style>