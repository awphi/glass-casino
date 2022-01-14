<template>
  <div class="box flex flex-col">
    <div class="flex flex-row justify-center">
      <button class="mr-2 bg-bop-20 rounded-md p-2">-0.01</button>
      <div class="h-full flex relative items-center">
        <input class="bet-input bg-bop-20" type="number" v-model="betInput" />
        <div class="token-bg bg-bop-10">
          <img src="@/assets/matic-token-icon.svg" width="20" />
        </div>
      </div>
      <button class="ml-2 bg-bop-20 rounded-md p-2">+0.01</button>
    </div>
    <hr class="w-full opacity-30 mb-8 mt-8" />
    <div class="flex flex-row flex-1">
      <div class="flex flex-col w-full">
        <!-- TODO hovers clicky clicky -->
        <button class="bg-red-700 bet-btn">Red</button>
        <button class="bg-gray-800 bet-btn">Black</button>
        <button class="bg-blue-400 bet-btn">Even</button>
        <button class="bg-green-400 bet-btn">Odd</button>
      </div>
      <div class="flex flex-col w-full"></div>
      <div class="flex flex-col w-full"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RouletteBetControls",
  data() {
    return {
      betInput: 0.01,
    };
  },
  props: ["contract"],
};
</script>

<style scoped>
.bet-input {
  @apply h-full text-center pl-12 pr-12 w-48 text-white rounded-md;
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