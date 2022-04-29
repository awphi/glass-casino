export default {
  state: () => ({}),
  mutations: {
    setGameData(state, payload) {
      const { address, data } = payload;
      state[address] = data;
    },
  },
};
