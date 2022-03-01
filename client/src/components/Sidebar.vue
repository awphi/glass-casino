<template>
  <div
    class="
      flex-col flex flex-shrink-0
      w-40
      bg-steel-600
      shadow-md
      p-4
      pb-16
      pr-0
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
</template>

<script>
import ContractDisclosure from "./ContractDisclosure.vue";

export default {
  name: "Sidebar",
  components: { ContractDisclosure },
};
</script>

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