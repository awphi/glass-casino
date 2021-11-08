<template>
  <div></div>
</template>

<script>
import rouletteJson from "../../build/contracts/Roulette.json";

export default {
  name: "App",
  mounted() {
    console.log(rouletteJson);
    console.log(this.provider);
    /*     const Roulette = new ethers.Contract(
      rouletteJson.networks[NETWORK].address,
      rouletteJson.abi,
      provider
    ).connect(signer); */
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
