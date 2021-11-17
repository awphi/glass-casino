<template>
  <div>
    <h1>Balance: {{ balance }}</h1>
    <Roulette />
    <button @click="metamaskConnect">Connect to MetaMask</button>
    <button @click="window.console.log(hasSigner)">Has signer?</button>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import Roulette from "./components/Roulette.vue";
import store from "./store/index";

export default {
  name: "App",
  components: { Roulette },
  computed: {
    ...mapState(["balance", "signer"]),
    ...mapGetters(["hasSigner"]),
  },
  methods: {
    metamaskConnect() {
      store.dispatch("connectWithMetamask");
    },
  },
  created() {
    store.dispatch("connect");
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
