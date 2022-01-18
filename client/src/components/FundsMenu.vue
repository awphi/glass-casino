<template>
  <div class="relative box w-1/4">
    <DialogTitle class="text-2xl font-bold"
      >Manage Funds - {{ mode }}</DialogTitle
    >

    <hr class="mt-2 mb-4" />
    <div class="flex flex-col items-center">
      <div
        class="flex items-center"
        :class="{
          'flex-row': mode == 'Deposit',
          'flex-row-reverse': mode == 'Withdraw',
        }"
      >
        <BalanceBox
          class="w-28"
          :value="balance"
          title="Wallet"
          ref="wallet"
          :editable="mode == 'Deposit'"
          :showValueBelow="mode == 'Deposit'"
        />
        <h1
          class="text-5xl mx-2 cursor-pointer hover:text-gray-300"
          @click="flip"
        >
          ⮂
        </h1>
        <BalanceBox
          :editable="mode == 'Withdraw'"
          :showValueBelow="mode == 'Withdraw'"
          class="w-28"
          ref="table"
          :value="game.contractBalance"
          title="Table"
        />
      </div>
      <button
        class="
          bg-green-600
          disabled:bg-green-600
          hover:bg-green-700
          disabled:opacity-70
          p-2
          rounded-md
          mt-2
        "
        :disabled="!confirmButtonEnabled"
        :class="{ loading: !confirmButtonEnabled }"
        @click="transfer"
      >
        {{ confirmButtonEnabled ? "Confirm Transfer" : "Confirming" }}
      </button>
    </div>
    <hr class="w-full mt-4 mb-2" />
    <h1 class="text-xl font-bold">How does this work?</h1>
    <p class="text-left">Simply click the arrows to toggle between:</p>
    <p class="text-center font-bold">
      <br />1) Depositing funds to the table <br />
      OR <br />
      2) Withdrawing funds from the table <br /><br />
    </p>
    <p>
      Then enter your desired amount and confirm the transaction. Now you're
      good to go!
    </p>
  </div>
</template>

<script>
import { DialogTitle } from "@headlessui/vue";
import { mapActions, mapState } from "vuex";
import BalanceBox from "./BalanceBox.vue";

export default {
  name: "FundsMenu",
  data() {
    return {
      mode: "Deposit",
      confirmButtonEnabled: true,
    };
  },
  components: {
    DialogTitle,
    BalanceBox,
  },
  methods: {
    ...mapActions(["refreshBalance"]),
    async transfer() {
      var ref;
      if (this.mode === "Deposit") {
        ref = this.$refs.wallet;
      } else {
        ref = this.$refs.table;
      }

      const v = ref.inputValue;

      // TODO nicer error here
      if (v == null || v.lte(0n) || v.gte(ref.value)) {
        alert("Invalid amount!");
        return;
      }

      var tx;
      if (this.mode === "Deposit") {
        tx = await this.game.contract.deposit({ value: v });
      } else {
        tx = await this.game.contract.withdraw(v);
      }

      this.confirmButtonEnabled = false;

      await tx.wait();
      this.confirmButtonEnabled = true;
      this.refreshBalance();
    },
    flip() {
      if (this.mode === "Deposit") {
        this.mode = "Withdraw";
      } else {
        this.mode = "Deposit";
      }
    },
  },
  computed: {
    ...mapState(["balance", "game"]),
  },
};
</script>

<style scoped>
p {
  @apply text-sm;
}
</style>