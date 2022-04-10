<template>
  <div
    class="
      flex
      h-full
      fixed
      z-20
      w-full
      p-8
      flex-col-reverse
      pointer-events-none
    "
  >
    <div
      v-for="(alert, index) in alertsList"
      :key="index"
      class="
        pointer-events-auto
        flex flex-col
        justify-center
        bg-yellow-600
        rounded-md
        relative
        p-3
        max-w-max
        fadein
        ml-auto
        mt-4
      "
    >
      <h1 class="text-xl mr-4">{{ alert.title }}</h1>
      <h2 v-if="alert.subtitle">
        {{ alert.subtitle }}
      </h2>

      <hr class="w-full opacity-30 border-white my-2" />

      <p>
        {{ alert.content }}
      </p>

      <button
        class="rounded-md absolute right-3 top-1.5 hover:opacity-70"
        @click="removeAlert(index)"
      >
        X
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  name: "AlertCenter",
  computed: {
    ...mapState(["alerts"]),
    alertsList() {
      return this.alerts.alerts;
    },
  },
  methods: {
    ...mapMutations(["removeAlert"]),
  },
};
</script>

<style>
.fadein {
  animation-duration: 0.5s;
  animation-name: animate-fade;
  animation-fill-mode: backwards;
}

@keyframes animate-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>