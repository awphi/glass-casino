<template>
  <div class="m-0">
    <div class="w-100 flex flex-row items-center p-3 bg-gray-700 shadow-lg">
      <h1 class="text-4xl flex-1 text-left font-bold">GlassCasino</h1>
      <h1 class="text-xl" v-if="hasSigner">Balance: {{ balance }}</h1>
      <button
        @click="metamaskConnect"
        class="p-1 pr-2 pl-2 bg-green-400 bg-opacity-40 rounded-md shadow-sm"
        v-else
      >
        Sign-in
      </button>
    </div>
    <div class="p-6">
      <Roulette />
    </div>
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
  created() {
    // Connects to RPC + WebSocket
    store.dispatch("connect");
  },
};
</script>

<style>
body,
html,
#app {
  height: 100%;
}

body {
  margin: 0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-gray-600;
}
</style>
