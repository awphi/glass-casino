<template>
  <div class="box flex flex-col relative">
    <StakeSelector ref="stakeSelector"></StakeSelector>
    <hr class="w-full opacity-30 mb-8 mt-8" />
    <div class="flex flex-col flex-1 items-center">
      <button @click="bet(0, 0)" class="bg-red-600 bet-btn hover:bg-red-700">
        Red
      </button>
      <button @click="bet(0, 1)" class="bg-gray-800 bet-btn hover:bg-gray-900">
        Black
      </button>
      <button @click="bet(1, 0)" class="bg-blue-600 bet-btn hover:bg-blue-700">
        Even
      </button>
      <button
        @click="bet(1, 1)"
        class="bg-green-600 bet-btn hover:bg-green-700"
      >
        Odd
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import StakeSelector from "./StakeSelector.vue";

export default {
  name: "RouletteBetControls",
  components: {
    StakeSelector,
  },
  methods: {
    ...mapActions(["refreshBalance"]),
    ...mapMutations(["addAlert"]),
    async bet(betType, bet) {
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

      try {
        // MetaMask does not allow the signing of transactions without sending them
        // thus we sign + send in this call
        const metamaskTx = await this.game.contractWithSigner.place_bet(
          betType,
          stake.betAmount,
          bet
        );
        // And use the hash from the sent transaction to obtain the pending transaction through Alchemy's provider
        // (much faster + consistent with elsewhere in the app)
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
  computed: {
    ...mapState(["signer", "game", "provider", "bankBalance"]),
    ...mapGetters(["hasSigner"]),
  },
};
</script>

<style scoped>
.bet-btn + .bet-btn {
  @apply mt-4;
}

.bet-btn {
  @apply rounded-md p-2 pt-1 pb-1 w-full sm:w-4/5 md:w-1/2 lg:w-1/3;
}
</style>