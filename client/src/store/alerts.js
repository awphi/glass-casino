export default {
  state: () => ({
    alerts: [],
  }),
  mutations: {
    addAlert(state, payload) {
      state.alerts.push({ ...payload, isOpen: true });
    },
    removeAlert(state, payload) {
      state.alerts.splice(payload, 1);
    },
  },
};
