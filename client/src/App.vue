<template>
  <div class="m-0 h-full flex flex-col">
    <Header />
    <div class="flex-1 flex flex-row">
      <div
        class="
          h-full
          w-40
          flex-shrink-0
          bg-steel-600
          shadow-md
          p-4
          pb-16
          pr-0
          flex flex-col
        "
      >
        <router-link to="roulette" class="menu-item">
          <img src="@/assets/roulette-icon.svg" width="20" />
          <h1 class="menu-text">Roulette</h1>
        </router-link>
        <router-link to="dice" class="menu-item">
          <img src="@/assets/dices-svgrepo-com.svg" width="20" />
          <h1 class="menu-text flex">Dice</h1>
        </router-link>
        <div class="flex-1"></div>

        <ContractDisclosure />
      </div>
      <router-view class="p-6 flex-1"></router-view>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import ContractDisclosure from "./components/ContractDisclosure.vue";

export default {
  name: "App",
  components: { Header, ContractDisclosure },
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
  @apply bg-steel-200;
}
</style>

<style scoped>
.menu-item {
  @apply p-2 rounded-l-md flex flex-row items-center cursor-pointer hover:bg-steel-700;
}

.menu-item + .menu-item {
  @apply mt-2;
}

.router-link-active {
  @apply bg-steel-800;
}

.menu-text {
  @apply text-xl ml-2 flex-1 text-left;
}
</style>