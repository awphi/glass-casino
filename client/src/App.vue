<template>
  <div class="flex flex-col absolute w-full h-full">
    <Header class="h-20" />
    <div class="flex flex-row flex-1">
      <Sidebar class=""></Sidebar>
      <router-view class="p-6 flex-1"></router-view>
    </div>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";

export default {
  name: "App",
  components: { Header, Sidebar },
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  overflow: auto;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-steel-200;
}
</style>