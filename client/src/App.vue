<template>
  <div class="m-0 h-full">
    <Header />
    <div class="p-6">
      <Roulette />
    </div>
  </div>
</template>

<script>
import Roulette from "./components/Roulette.vue";
import Header from "./components/Header.vue";

export default {
  name: "App",
  components: { Roulette, Header },
};
</script>

<style>
body,
html,
#app {
  @apply h-full;
}

body {
  @apply m-0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-gray-600;
}
</style>
