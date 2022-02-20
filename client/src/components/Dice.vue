<template>
  <div
    class="
      rounded-md
      inline-grid
      grid-cols-3
      bg-steel-700
      grid-rows-3
      gap-2
      p-3
    "
    ref="dice"
  >
    <div
      v-for="i in [0, 1, 2, 3, 4, 5, 6, 7, 8]"
      :key="i"
      class="w-4 h-4 bg-gray-100 rounded-full"
      :class="{ 'opacity-0': !face[i] }"
    ></div>
  </div>
</template>

<script>
const FACES = [
  [false, false, false, false, true, false, false, false, false],
  [true, false, false, false, false, false, false, false, true],
  [true, false, false, false, true, false, false, false, true],
  [true, false, true, false, false, false, true, false, true],
  [true, false, true, false, true, false, true, false, true],
  [true, false, true, true, false, true, true, false, true],
];

export default {
  name: "Dice",
  data() {
    return {
      number: this.initialNumber,
    };
  },
  computed: {
    face() {
      return FACES[this.number - 1];
    },
  },
  methods: {
    rollTo(num, time = 200, iters = 10) {
      const dice = this.$refs.dice;
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
        this.number = Math.floor(Math.random() * 6) + 1;
      }, time / 2);

      anim.onfinish = () => {
        clearInterval(roller);
        this.number = num;
      };

      return anim.finished;
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