<template>
  <div>
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
</template>

<script>
import rouletteJson from "../../../build/contracts/Roulette.json";
import { mapState } from "vuex";
import { ethers } from "ethers";
import { markRaw } from "vue";
import VueCountdown from "@chenfengyuan/vue-countdown";

export default {
  name: "Roulette",
  components: {
    VueCountdown,
  },
  data() {
    return {
      // TODO use history (on contract) to set this variable initially to position the wheel
      roll: 0,
      contract: null,
      nextRoll: 0,
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
    console.log(rouletteJson.networks);
    this.contract = markRaw(
      new ethers.Contract(
        rouletteJson.networks[this.chainId].address,
        rouletteJson.abi,
        this.provider
      )
    );

    this.updateTimer(this.gameData);

    this.contract.on(this.contract.filters["OutcomeDecided"](), (roll) => {
      this.roll = roll;
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