import IconSvg from "@/components/IconSvg";
import Dialog from "@/components/Dialog";
import Certificate from "@/components/Certificate";
import Alert from "@/components/Alert";
import Notification from "@/components/Notification";

import detect from "@/plugins/detect";
import http from "@/plugins/http";
import extension from "@/plugins/extension";
import rpc from "@/plugins/rpc";
import element from "@/plugins/element";
import copy from "clipboard-copy";

const requireAll = (requireContext) =>
    requireContext.keys().map(requireContext);
const req = require.context("../assets/icons", false, /\.svg$/);
requireAll(req);

export default {
    install: async (vue) => {
        vue.component("icon-svg", IconSvg);
        vue.use(element);
        vue.use(Notification);
        vue.prototype.$browser = detect.browser;
        vue.prototype.$uniDialog = Dialog;
        vue.prototype.$uniCerDialog = Certificate;
        vue.prototype.$uniAlert = Alert;
        vue.prototype.$http = http;
        vue.prototype.$extension = extension;
        vue.prototype.$rpc = rpc;
        vue.prototype.$copy = copy;
    },
};
