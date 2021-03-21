import AlertComponent from "./Alert";
import Vue from "vue";

const AlertComponentConstructor = Vue.extend(AlertComponent);

function show(type, callback) {
    let instance = new AlertComponentConstructor({
        el: document.createElement("div"),
    });
    type ? (instance.noteType = type) : "";
    let currentEl = document.querySelector(
        `div.uni__alert[${AlertComponent._scopeId}]`
    );
    if (currentEl) {
        window.document.body.removeChild(currentEl);
    }
    window.document.body.insertBefore(
        instance.$el,
        window.document.body.children[0]
    );
    callback && callback();
}

function close(visible, callback) {
    if (!visible) {
        let el = document.querySelector(
            `div.uni__alert[${AlertComponent._scopeId}]`
        );
        if (el) {
            window.document.body.removeChild(el);
        }
        callback && callback();
    }
}

export default {
    show,
    close,
};
