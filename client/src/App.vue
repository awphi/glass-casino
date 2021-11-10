<template>
  <div>
    <h1>Balance: {{ balance }}</h1>
  </div>
</template>

<script>
//import rouletteJson from "../../build/contracts/Roulette.json";
import { mapState } from "vuex";
import store from "./store/index";

//import { ethers } from "ethers";

export default {
  name: "App",
  computed: {
    ...mapState(["provider", "signer", "balance"]),
  },
  created() {
    store.dispatch("connect");
  },
  watch: {
    provider(v) {
      console.log("Provider: " + v);
    },
    async signer(v) {
      v.sendTransaction({
        to: "0x167760318aa9d7889085b9A472EF8460B4c7B20C",
        value: 1000000000000000000n,
      })
        .then(console.log)
        .catch(console.error);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
