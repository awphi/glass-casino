import { ethers } from "ethers";

export default {
  methods: {
    formatEther(value, decimals = 2, unit = "ether") {
      const split = ethers.utils.formatUnits(value, unit).split(".");
      return `${split[0]}.${split[1].slice(0, decimals)}`;
    },
  },
};
