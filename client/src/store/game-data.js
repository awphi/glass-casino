export default {
  state: () => ({}),
  mutations: {
    setGameData(state, payload) {
      const { address, data } = payload;
      var g = state.gameData;
      if (address in g) {
        state.gameData[address] = data;
      } else {
        const o = {};
        o[address] = data;
        state.gameData = { ...g, ...o };
      }
    },
  },
  actions: {},
  getters: {},
};
