<template>
  <div class="wrapper flex flex-row h-full">
    <div
      class="
        bg-gray-700
        p-8
        shadow-lg
        rounded-md
        flex flex-col
        items-center
        flex-1
        mr-6
      "
    >
      <RouletteWheel class="w-4/5 h-16" />
      <h1>Last roll: {{ roll }}</h1>
      <VueCountdown
        :time="nextRoll"
        :interval="100"
        v-slot="{ seconds, milliseconds, totalMilliseconds }"
      >
        <h2 v-if="totalMilliseconds > 0">
          Next roll：{{ seconds }}.{{ Math.floor(milliseconds / 100) }}s
        </h2>
        <h2 v-else>Spinning...</h2>
      </VueCountdown>
    </div>
    <div
      class="
        bets-list
        pl-8
        pr-8
        pt-4
        pb-4
        bg-gray-700
        rounded-md
        shadow-md
        w-1/6
        overflow-hidden
      "
    >
      <h1 class="text-center text-3xl font-bold">Current Bets</h1>
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
import { ethers } from "ethers";
import { markRaw } from "vue";
import VueCountdown from "@chenfengyuan/vue-countdown";
import RouletteWheel from "./RouletteWheel.vue";
import RouletteBetDisplay from "./RouletteBetDisplay.vue";

export default {
  name: "Roulette",
  components: {
    VueCountdown,
    RouletteWheel,
    RouletteBetDisplay,
  },
  data() {
    return {
      // TODO use history (on contract) to set this variable initially to position the wheel
      roll: 0,
      contract: null,
      nextRoll: 0,
      bets: [],
    };
  },
  computed: {
    ...mapState(["provider", "signer", "provider", "gameData", "chain"]),
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
      this.roll = roll;
    });

    this.contract.get_bets().then((r) => {
      this.bets = r;
      console.log(r);
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