import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import "./index.css";

const app = createApp(App).use(store);
app.config.globalProperties.window = window;
app.mount("#app");
