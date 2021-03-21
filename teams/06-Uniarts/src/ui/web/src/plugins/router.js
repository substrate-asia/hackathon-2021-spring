import Vue from "vue";
import VueRouter from "vue-router";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import routes from "@/router/index";
import { ROUTER_DEFAULT_CONFIG } from "@/config/index";
import { routeFrom, routeTo } from "@/interceptors/router";

nprogress.configure({
    easing: "ease",
    speed: 200,
    showSpinner: false,
});

Vue.use(VueRouter);

const router = new VueRouter({
    ...ROUTER_DEFAULT_CONFIG,
    routes: routes,
});

router.beforeEach((from, to, next) => {
    nprogress.set(0.0);
    nprogress.start();
    routeFrom(from, to);
    next();
});
router.afterEach((from, to) => {
    nprogress.set(1.0);
    nprogress.done();
    routeTo(from, to);
});

export default router;
