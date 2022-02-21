import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import Roulette from "../views/Roulette.vue";
import ChuckALuck from "../views/ChuckALuck.vue";

import chuckaluckJson from "../../../build/contracts/ChuckALuck.json";
import rouletteJson from "../../../build/contracts/Roulette.json";

const routes = [
  {
    path: "/",
    redirect: "/roulette",
  },
  {
    path: "/roulette",
    name: "Roulette",
    component: Roulette,
    meta: {
      contractJson: rouletteJson,
    },
  },
  {
    path: "/dice",
    name: "Chuck-a-Luck",
    component: ChuckALuck,
    meta: {
      contractJson: chuckaluckJson,
    },
  },
  {
    path: "/info",
    name: "Info",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/Info.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const contract = to.meta.contractJson;
  if (contract) {
    store.commit("setContract", {
      address: contract.networks[Number(store.state.chain.chainId)].address,
      abi: contract.abi,
    });
  } else {
    store.commit("clearContract");
  }
});

export default router;
