export default {
  methods: {
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      const s = date.getSeconds().toString().padStart(2, "0");
      return `${h}:${m}:${s}`;
    },
  },
};
