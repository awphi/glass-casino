<template>
  <div class="container flex flex-row justify-center" ref="container">
    <div class="marker" ref="marker"></div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

const ROULETTE_ORDER = [
  0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23,
  8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32,
];

const SPIN_STATE = {
  SPINNING: 0,
  SPINNING_TO: 1,
  STOPPED: 2,
};

function neg_mod(op, n) {
  return ((op % n) + n) % n;
}

export default {
  name: "RouletteWheel",
  mounted() {
    // Spin stage 1 needs to know length of background to create a perfect loop
    const bgUrl = window
      .getComputedStyle(this.$refs.container)
      .backgroundImage.split('"')[1];

    const bgImg = new Image();
    bgImg.onload = () => {
      this.maxWidth = bgImg.width;
      this.setTo(this.current);
    };
    bgImg.src = bgUrl;

    window.addEventListener("resize", this.resized);
  },
  unmounted() {
    window.removeEventListener("resize", this.resized);
  },
  computed: {
    isSpinning() {
      return (
        this.spinState === SPIN_STATE.SPINNING ||
        this.spinState === SPIN_STATE.SPINNING_TO
      );
    },
  },
  data() {
    return {
      current: 0,
      spinningAnimation: null,
      offset: 0,
      spinState: SPIN_STATE.STOPPED,
      maxWidth: 0,
    };
  },
  methods: {
    ...mapActions(["refreshBalance"]),
    // DEBUG METHOD
    toggle() {
      if (this.spinState === SPIN_STATE.SPINNING) {
        this.stopSpinningOn(0);
      } else if (this.spinState === SPIN_STATE.STOPPED) {
        this.startSpinning();
      }
    },
    resolveOffsetTo(n) {
      // Trivial
      const cellWidth = this.$refs.container.clientHeight;
      const idx = ROULETTE_ORDER.indexOf(n);

      // Offset to zero i.e. half the displayed container width
      const offset = this.$refs.container.clientWidth / 2;

      var f = offset - idx * cellWidth - cellWidth / 2;

      return neg_mod(f, this.maxWidth);
    },
    setTo(n) {
      const off = this.resolveOffsetTo(n);
      this.$refs.container.style.backgroundPositionX = `${off}px`;
    },
    startSpinning() {
      // If spinning stage 1 -> return as we're already spinning,
      // if stage 2 -> cancel it and start this new spin,
      // if stopped just start
      if (this.spinState === SPIN_STATE.SPINNING) {
        return;
      } else if (this.spinState === SPIN_STATE.SPINNING_TO) {
        this.spinningAnimation.cancel();
      }

      this.spinState = SPIN_STATE.SPINNING;

      this.spinningAnimation = this.$refs.container.animate(
        [
          {
            backgroundPositionX: `${this.currentOffset() + this.maxWidth}px`,
          },
          { backgroundPositionX: `${this.currentOffset()}px` },
        ],
        {
          duration: 3000,
          iterations: Infinity,
        }
      );
    },
    currentOffset() {
      return Number(
        this.$refs.container.style.backgroundPositionX.slice(0, -2)
      );
    },
    stopSpinningOn(n) {
      if (this.isSpinning) {
        this.spinningAnimation.commitStyles();
        this.spinningAnimation.cancel();
      }

      this.spinState = SPIN_STATE.SPINNING_TO;

      // Subtract max width to put it in range -maxWidth -> 0 so it's always strictly less than current wheel pos
      // and therefore the roll will always continue rightwards
      const goal = this.resolveOffsetTo(n) - this.maxWidth;
      const current = this.currentOffset();

      //console.log(goal, current);

      this.spinningAnimation = this.$refs.container.animate(
        [
          { backgroundPositionX: `${current}px` },
          { backgroundPositionX: `${goal}px` },
        ],
        {
          duration: 3000,
          fill: "forwards",
          easing: "ease-out",
        }
      );

      this.spinningAnimation.oncancel = () => {
        this.spinningAnimation = null;
        this.current = n;
        this.spinState = SPIN_STATE.STOPPED;
        this.refreshBalance();
        console.log("Ending...");
      };

      this.spinningAnimation.onfinish = () => {
        this.spinningAnimation.commitStyles();
        this.spinningAnimation.oncancel();
      };

      return this.spinningAnimation.finished;
    },
    resized() {
      if (this.spinState === SPIN_STATE.SPINNING) {
        return;
      }

      if (this.spinState === SPIN_STATE.SPINNING_TO) {
        this.spinningAnimation.cancel();
      }

      this.setTo(this.current);
    },
  },
};
</script>

<style scoped>
.container {
  background-size: cover;
  background-image: url("../assets/RouletteWheel.svg");
  @apply rounded-md shadow-md h-full;
}

.marker {
  @apply h-full w-1 bg-gray-200;
}
</style>