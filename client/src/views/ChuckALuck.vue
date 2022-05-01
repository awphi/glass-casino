<template>
  <div class="flex flex-row gap-6">
    <div class="flex flex-col gap-6 flex-1">
      <div
        class="box flex flex-col relative justify-center items-center flex-1"
      >
        <div class="flex space-x-2 md:space-x-4 lg:space-x-6 my-12">
          <Dice ref="dice0" class="big-dice" :initialNumber="1"></Dice>
          <Dice ref="dice1" class="big-dice" :initialNumber="2"></Dice>
          <Dice ref="dice2" class="big-dice" :initialNumber="3"></Dice>
        </div>
        <p
          class="
            text-xs text-center
            bottom-6
            bg-steel-600
            p-2
            rounded-md
            w-4/5
            absolute
            md:w-1/3
            xl:w-1/4
          "
          :class="{ loading: this.pendingRequest !== null }"
        >
          {{ statusString }}
        </p>
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

    <div class="box game-history-box min-h-0 flex w-full lg:w-1/4 flex-col">
      <h1 class="text-2xl font-bold">Game History</h1>
      <p class="text-xs">Newest → Oldest (within 50 blocks)</p>
      <hr class="w-full opacity-30 my-2" />
      <div v-if="history.length > 0" class="overflow-y-auto">
        <ChuckALuckBetDisplay
          v-for="h in history"
          :key="h"
          :transaction="h"
        ></ChuckALuckBetDisplay>
      </div>
      <div class="flex h-full justify-center items-center text-center" v-else>
        <h1>Looks like there's been no games recently...</h1>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from "vuex";
import StakeSelector from "../components/StakeSelector.vue";
import Dice from "../components/Dice.vue";
import ChuckALuckBetDisplay from "../components/ChuckALuckBetDisplay.vue";

export default {
  name: "ChuckALuck",
  components: {
    StakeSelector,
    Dice,
    ChuckALuckBetDisplay,
  },
  data() {
    return {
      pendingRequest: null,
      history: [],
    };
  },
  computed: {
    ...mapState(["signer", "provider", "chain", "game", "bankBalance"]),
    ...mapGetters(["hasSigner"]),
    statusString() {
      if (this.pendingRequest === null) {
        return "Ready to accept bet!";
      } else if (this.pendingRequest === true) {
        return "Awaiting bet confirmation";
      } else {
        return "Bet confirmed! Awaiting RNG";
      }
    },
  },
  props: {
    blocks: {
      type: Number,
      default: 50,
    },
  },
  methods: {
    ...mapMutations(["setContract", "addAlert"]),
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
      if (!this.hasSigner) {
        this.addAlert({
          title: "No wallet connected.",
          content:
            "You must connect to a wallet to play, check the help menu in the top right to get started!",
        });
        return;
      }

      if (stake.betAmount.lte(0)) {
        this.addAlert({
          title: "Invalid Stake.",
          content:
            "You must stake more than 0 MATIC to play, please adjust your stake and try again!",
        });
        return;
      }

      if (stake.betAmount.gt(this.bankBalance)) {
        this.addAlert({
          title: "Invalid Stake.",
          content:
            "You cannot stake more than your balance, please adjust your stake and try again or deposit more MATIC!",
        });
        return;
      }

      if (this.pendingRequest !== null) {
        this.addAlert({
          title: "Game Already in Progress.",
          content:
            "You are already awaiting the result of a game - please try again once it's complete!",
        });
        return;
      }

      try {
        // See comments in RouletteBetControls.vue for explanation of this
        const metamaskTx = await this.game.contractWithSigner.play(
          bet,
          stake.betAmount
        );
        // Set pendingRequest to some placeholder value to stop spamming
        this.pendingRequest = true;
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
    this.game.contract.on(
      this.game.contract.filters.GameStart(),
      async (requestId, bet, receipt) => {
        if (!this.hasSigner || bet.player !== this.signer._address) {
          return;
        }
        console.log("GameStart", bet, receipt);
        const tx = await receipt.getTransaction();
        await tx.wait();
        this.pendingRequest = bet;
        this.refreshBalance();
      }
    );

    this.game.contract.on(
      this.game.contract.filters.GameComplete(),
      async (requestId, rolls, bet, winnings, receipt) => {
        console.log("GameComplete", bet, rolls);
        const rollsSmall = rolls.map((a) => a.toNumber());

        const anim =
          this.hasSigner && bet.player === this.signer._address
            ? this.roll(rollsSmall)
            : Promise.resolve();
        const tx = await receipt.getTransaction();

        await Promise.all([tx.wait(), anim]);

        if (this.hasSigner && bet.player === this.signer._address) {
          this.pendingRequest = null;
          this.refreshBalance();
        }

        this.history.unshift({
          ...bet,
          rolls: rollsSmall,
          winnings: winnings,
          transactionHash: receipt.transactionHash,
        });
      }
    );

    this.game.contract
      .queryFilter(this.game.contract.filters.GameComplete(), -this.blocks)
      .then((results) => {
        results.forEach((tx) => {
          this.history.unshift({
            ...tx.args.bet,
            rolls: tx.args.rolls.map((a) => a.toNumber()),
            winnings: tx.args.winnings,
            transactionHash: tx.transactionHash,
          });
        });
      });
  },
};
</script>

<style scoped>
.wrapper {
  @apply gap-6 grid;
  grid-template-rows: minmax(0, 1fr);
}

.big-dice {
  @apply w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 p-2 rounded-lg;
}

.game-history-box {
  height: 500px;
  @apply lg:h-full;
}
</style>