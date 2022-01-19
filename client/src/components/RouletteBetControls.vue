<template>
  <div class="box flex flex-col relative">
    <div
      class="w-full h-full absolute left-0 top-0 z-10 p-1"
      v-if="signer == null"
    ></div>
    <div class="flex flex-row justify-center">
      <button
        v-for="v in betButtonValues"
        :key="v"
        @click="addToBetInput(v)"
        class="mr-2 bet-amount-btn"
      >
        {{ formatEther(v) }}
      </button>
      <div class="h-full flex relative items-center">
        <input
          class="bet-input bg-steel-700"
          type="number"
          value="0.01"
          placeholder="0.01"
          ref="betInput"
          min="0.01"
          @keyup="betInputKeyUp"
        />
        <div class="token-bg bg-steel-800">
          <img src="@/assets/matic-token-icon.svg" width="20" />
        </div>
      </div>
      <button
        v-for="v in betButtonValuesAbs"
        :key="v"
        @click="addToBetInput(v)"
        class="ml-2 bg-steel-700 bet-amount-btn"
      >
        +{{ formatEther(v) }}
      </button>
    </div>
    <hr class="w-full opacity-30 mb-8 mt-8" />
    <div class="flex flex-row flex-1 items-center">
      <div class="flex flex-col w-full p-2">
        <button @click="bet(0, 0)" class="bg-red-600 bet-btn hover:bg-red-700">
          Red
        </button>
        <button
          @click="bet(0, 1)"
          class="bg-gray-800 bet-btn hover:bg-gray-900"
        >
          Black
        </button>
        <button
          @click="bet(1, 0)"
          class="bg-blue-600 bet-btn hover:bg-blue-700"
        >
          Even
        </button>
        <button
          @click="bet(1, 1)"
          class="bg-green-600 bet-btn hover:bg-green-700"
        >
          Odd
        </button>
      </div>
      <div class="flex flex-col w-full p-2">
        <button
          @click="refreshBalance"
          class="bg-green-600 bet-btn hover:bg-green-700"
        >
          DEBUG
        </button>
      </div>
      <div class="flex flex-col w-full p-2"></div>
    </div>
  </div>
</template>

<script>
import { ethers, BigNumber } from "ethers";
import { mapState, mapActions } from "vuex";
const ONE_MATIC_CENT = BigNumber.from(10000000000000000n);
const ZERO = BigNumber.from(0n);

export default {
  name: "RouletteBetControls",
  data() {
    return {
      betAmount: ONE_MATIC_CENT,
      betButtonValues: [
        ONE_MATIC_CENT.mul(-1000),
        ONE_MATIC_CENT.mul(-100),
        ONE_MATIC_CENT.mul(-10),
        ONE_MATIC_CENT.mul(-1),
      ],
    };
  },
  methods: {
    ...mapActions(["refreshBalance"]),
    addToBetInput(v) {
      if (this.betAmount.add(v) < ONE_MATIC_CENT) {
        this.betAmount = ONE_MATIC_CENT;
      } else {
        this.betAmount = this.betAmount.add(v);
      }
      this.$refs.betInput.value = ethers.utils.formatEther(this.betAmount);
    },
    // TODO replace betInput here with an editable BalanceBox as per FundsMenu (but with +/- the buttons)
    betInputKeyUp(e) {
      try {
        this.betAmount = ethers.utils.parseEther(e.target.value);
      } catch (_) {
        this.betAmount = ZERO;
      }
    },
    formatEther(v) {
      return ethers.utils.formatEther(v);
    },
    async bet(betType, bet) {
      if (this.betAmount.lte(0)) {
        window.alert("Invalid bet amount, bet must be > 0!");
        return;
      }

      if (this.betAmount.gt(this.game.contractBalance)) {
        window.alert("Insufficient funds to cover bet!");
        return;
      }

      try {
        // MetaMask does not allow the signing of transactions without sending them
        // thus we sign + send in this call
        const metamaskTx = await this.game.contract.place_bet(
          betType,
          this.betAmount,
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
    ...mapState(["signer", "game", "provider"]),
    betAmountFormatted() {
      return ethers.utils.formatUnits(this.betAmount, "ether");
    },
    betButtonValuesAbs() {
      return this.betButtonValues.map((a) => a.abs()).reverse();
    },
  },
};
</script>

<style scoped>
.bet-amount-btn {
  @apply rounded-md p-2 bg-steel-700 hover:bg-steel-800;
}

.bet-input {
  @apply h-full text-center pl-12 pr-12 w-48 rounded-md flex justify-center items-center;
}

.token-bg {
  @apply absolute right-0 flex items-center justify-center p-1.5 mr-1 rounded-lg;
}

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

.bet-btn + .bet-btn {
  @apply mt-4;
}

.bet-btn {
  @apply rounded-md p-2 pt-1 pb-1;
}
</style>