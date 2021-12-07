<template>
  <div>
    <h1>Balance: {{ balance }}</h1>
    <Roulette />
    <button @click="metamaskConnect">Connect to MetaMask</button>
    <button v-if="hasSigner" @click="window.console.log(hasSigner)">
      Has signer?
    </button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
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
    ...mapMutations(["setGameData"]),
  },
  async mounted() {
    // WebSocket for timing data
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (data) => {
      const json = JSON.parse(data.data);
      console.log(json);
      if (json.game && json.address) {
        this.setGameData(json);
      }
    };
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
