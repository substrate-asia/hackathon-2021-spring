import DialogComponent from "./Dialog";
import Vue from "vue";

const DialogComponentConstructor = Vue.extend(DialogComponent);

function show(collectionId, itemId, itemHash, blockHeight, blockTimestamp) {
    let instance = new DialogComponentConstructor({
        el: document.createElement("div"),
        data: {
            collectionId: collectionId,
            itemId: itemId,
        },
    });
    instance.itemHash = itemHash;
    instance.blockHeight = blockHeight;
    instance.blockTimestamp = blockTimestamp;
    instance.dialogVisible = true;
    instance.$on("closed", close);
    window.document.body.appendChild(instance.$el);
}

function close(visible) {
    if (!visible) {
        let el = document.querySelector(
            `.el-dialog__wrapper.dialog[${DialogComponent._scopeId}]`
        );
        if (el) {
            window.document.body.removeChild(el);
        }
    }
}

export default {
    show,
    close,
};
