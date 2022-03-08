<template>
  <div class="flex flex-col absolute w-full h-full">
    <Header class="h-20" />
    <div class="flex flex-row flex-1 min-h-0">
      <Sidebar class="hidden lg:flex"></Sidebar>
      <router-view
        class="p-6 w-full flex-wrap overflow-auto bg-steel-200"
      ></router-view>
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
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>