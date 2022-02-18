import { createRouter, createWebHistory } from "vue-router";
import Roulette from "../views/Roulette.vue";
import ChuckALuck from "../views/ChuckALuck.vue";

const routes = [
  {
    path: "/",
    redirect: "/roulette",
  },
  {
    path: "/roulette",
    name: "Roulette",
    component: Roulette,
  },
  {
    path: "/dice",
    name: "Chuck-a-Luck",
    component: ChuckALuck,
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

export default router;
