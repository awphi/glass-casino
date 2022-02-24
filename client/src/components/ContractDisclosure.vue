<template>
  <div class="bg-steel-700 rounded-l-md p-2">
    <h1 class="font-bold text-sm">Contract Info</h1>
    <hr class="opacity-30 my-1 w-full" />
    <Disclosure v-slot="{ open }">
      <DisclosureButton class="disc-btn"
        >Game
        <div class="flex-1"></div>
        <img
          src="@/assets/right-thin-chevron-svgrepo-com.svg"
          width="12"
          class="transform rotate-90"
          :class="{ '-rotate-90': open }"
      /></DisclosureButton>
      <DisclosurePanel class="p-1">
        <p class="whitespace-nowrap overflow-hidden overflow-ellipsis">
          Address:
          <a
            target="_blank"
            class="underline"
            :href="`${this.chain.blockExplorerUrls[0]}/address/${currentGameAddress}`"
          >
            {{ currentGameAddress }}
          </a>
        </p>
        <div class="flex mt-1">
          <p>Balance:</p>
          <div class="flex-1"></div>
          <p class="flex">
            {{ formatEther(linkBalance) }}
            <img src="@/assets/LINK-blue.svg" class="ml-0.5" width="12" />
          </p>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <Disclosure v-slot="{ open }">
      <DisclosureButton class="disc-btn"
        >Bank
        <div class="flex-1"></div>
        <img
          src="@/assets/right-thin-chevron-svgrepo-com.svg"
          width="12"
          class="transform rotate-90"
          :class="{ '-rotate-90': open }"
      /></DisclosureButton>

      <DisclosurePanel class="p-1">
        <p class="whitespace-nowrap overflow-hidden overflow-ellipsis">
          Address:
          <a
            target="_blank"
            class="underline"
            :href="`${this.chain.blockExplorerUrls[0]}/address/${this.bankContract.address}`"
          >
            {{ bankContract.address }}
          </a>
        </p>
        <div class="flex mt-1">
          <p>Balance:</p>
          <div class="flex-1"></div>
          <p class="flex">
            {{ formatEther(bankTotalBalance) }}
            <img
              src="@/assets/matic-token-icon.svg"
              class="ml-0.5"
              width="12"
            />
          </p>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import linkJson from "../../../build/contracts/LinkTokenInterface.json";
import { markRaw } from "@vue/reactivity";
import { ethers, BigNumber } from "ethers";
import { mapState } from "vuex";

export default {
  name: "ContractDisclosure",
  components: {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
  },
  data() {
    return {
      linkBalance: BigNumber.from(0n),
      bankTotalBalance: BigNumber.from(0n),
      linkContract: null,
    };
  },
  computed: {
    ...mapState(["signer", "provider", "chain", "game", "bankContract"]),
    currentGameAddress() {
      if (this.game.contract) {
        return this.game.contract.address;
      }
      return null;
    },
  },
  methods: {
    formatEther(val) {
      return ethers.utils.formatEther(val);
    },
    updateBalances() {
      this.linkContract
        .balanceOf(this.currentGameAddress)
        .then((v) => (this.linkBalance = v));

      this.provider.getBalance(this.bankContract.address).then((v) => {
        this.bankTotalBalance = v;
      });
    },
  },
  mounted() {
    this.linkContract = markRaw(
      new ethers.Contract(this.chain.linkAddress, linkJson.abi, this.provider)
    );

    this.provider.on("block", (n) => {
      if (this.currentGameAddress == null || n % 10 !== 0) {
        return;
      }

      this.updateBalances();
    });
  },
  watch: {
    game: {
      deep: true,
      handler() {
        this.linkBalance = BigNumber.from(0n);
        this.updateBalances();
      },
    },
  },
};
</script>

<style scoped>
.disc-btn {
  @apply text-sm text-left bg-steel-800 rounded-md p-1 px-2 w-full hover:bg-steel-900 flex items-center;
}
.disc-btn + .disc-btn {
  @apply mt-1;
}

p {
  @apply text-xs;
}
</style>