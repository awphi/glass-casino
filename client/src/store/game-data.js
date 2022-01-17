export default {
  state: () => ({}),
  mutations: {
    setGameData(state, payload) {
      console.log(payload);
      const { address, data } = payload;
      state[address] = data;
    },
  },
};
