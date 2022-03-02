<template>
  <div class="bg-steel-700" ref="diceWrapper">
    <div class="dice w-full h-full" ref="dice"></div>
  </div>
</template>

<script>
export default {
  name: "Dice",
  data() {
    return {
      current: this.initialNumber,
    };
  },
  mounted() {
    this.resized();

    window.addEventListener("resize", this.resized);
  },
  unmounted() {
    window.removeEventListener("resize", this.resized);
  },
  methods: {
    setTo(num) {
      this.current = num;
      this.$refs.dice.style = `background-position-x: ${
        (1 - num) * this.$refs.dice.clientHeight
      }px`;
    },
    rollTo(num, time = 200, iters = 10) {
      const dice = this.$refs.diceWrapper;
      const anim = dice.animate(
        [
          { transform: `translateY(0px)` },
          { transform: `translateY(-20px)` },
          { transform: `translateY(0px)` },
          { transform: `translateY(20px)` },
          { transform: `translateY(0px)` },
        ],
        {
          duration: time,
          iterations: iters,
        }
      );
      const roller = setInterval(() => {
        this.setTo(Math.floor(Math.random() * 6) + 1);
      }, time / 2);

      anim.onfinish = () => {
        clearInterval(roller);
        this.setTo(num);
      };

      return anim.finished;
    },
    resized() {
      this.setTo(this.current);
    },
  },
  props: {
    initialNumber: {
      type: Number,
      default: 3,
    },
  },
};
</script>

<style scoped>
.dice {
  background-image: url("../assets/Dice.svg");
  background-size: cover;
}
</style>