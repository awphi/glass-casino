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
export default {
  name: "Dice",
  data() {
    return {
      faces: [
        [false, false, false, false, true, false, false, false, false],
        [true, false, false, false, false, false, false, false, true],
        [true, false, false, false, true, false, false, false, true],
        [true, false, true, false, false, false, true, false, true],
        [true, false, true, false, true, false, true, false, true],
        [true, false, true, true, false, true, true, false, true],
      ],
    };
  },
  computed: {
    face() {
      return this.faces[this.number - 1];
    },
  },
  props: {
    number: {
      type: Number,
      default: 3,
    },
  },
};
</script>