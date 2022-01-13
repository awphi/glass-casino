<template>
  <div class="m-0 h-full flex flex-col">
    <Header />
    <div class="flex-1 flex flex-row">
      <!-- TODO merge vue-router into this -->
      <div
        class="
          h-full
          w-40
          bg-gray-800 bg-opacity-60
          shadow-md
          p-4
          pb-16
          pr-0
          flex flex-col
        "
      >
        <!-- TODO attribute https://www.svgrepo.com/svg/384232/casino-leisure-roulette-game -->
        <div class="bg-bop-25 menu-item">
          <img src="@/assets/roulette-icon.svg" width="20" />
          <h1 class="menu-text">Roulette</h1>
        </div>
        <div class="menu-item">
          <img src="@/assets/roulette-icon.svg" width="20" />
          <h1 class="menu-text">Game 2</h1>
        </div>
        <div class="menu-item">
          <img src="@/assets/roulette-icon.svg" width="20" />
          <h1 class="menu-text">Game 3</h1>
        </div>
        <div class="flex-1"></div>
        <!-- TODO attribute https://www.svgrepo.com/svg/60892/info -->
        <div class="menu-item">
          <img src="@/assets/info-svgrepo-com.svg" width="20" />
          <h1 class="menu-text">Info</h1>
        </div>
      </div>
      <Roulette class="p-6 flex-1" />
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

<style scoped>
.menu-item {
  @apply p-2 rounded-l-md flex flex-row items-center cursor-pointer;
}

.menu-item + .menu-item {
  @apply mt-2;
}

.menu-item:hover {
  @apply bg-black bg-opacity-30;
}

.menu-text {
  @apply text-xl font-bold ml-2 flex-1 text-left;
}
</style>