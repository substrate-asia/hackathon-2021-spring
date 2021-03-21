<template>
    <el-dialog
        class="dialog"
        :class="{
            medium: type == 'medium',
            small: type == 'small',
            fullscreen: type == 'fullscreen',
            message: displayType == 'PluginError',
        }"
        :modal="false"
        :visible="dialogVisible"
        :append-to-body="true"
        :lock-scroll="true"
        :close-on-click-modal="clickModel"
        :close-on-press-escape="false"
        :show-close="showClose"
        top="0"
        :before-close="handleClose"
        @closed="closed"
    >
        <slot></slot>
    </el-dialog>
</template>
<script>
import { Dialog } from "element-ui";

export default {
    components: { [Dialog.name]: Dialog },
    name: "uni-dialog",
    props: {
        visible: {
            type: Boolean,
            default: true,
        },
        close: {
            type: Function,
            default: function () {
                this.$emit("update:visible", false);
                this.dialogVisible = false;
            },
        },
        displayType: {
            type: String,
            default: "dialog",
        },
        type: {
            type: String,
            default: "medium",
        },
        clickModel: {
            type: Boolean,
            default: false,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
    },
    watch: {
        visible(value) {
            this.dialogVisible = value;
            if (value) {
                this.$el.addEventListener("wheel", this.lockScreen);
            } else {
                this.$el.removeEventListener("wheel", this.lockScreen);
            }
        },
    },
    data() {
        return {
            dialogVisible: false,
        };
    },
    mounted() {
        if (this.visible) {
            this.$el.addEventListener("wheel", this.lockScreen);
        }
    },
    methods: {
        handleClose() {
            this.close();
        },
        lockScreen(e) {
            e.preventDefault();
        },
        closed() {
            this.$emit("closed");
        },
    },
};
</script>
<style lang="scss" scoped>
.dialog {
    ::v-deep .el-dialog {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        width: 780px;
        height: 586px;
        background: #ffffff;
        box-shadow: 0px 5px 31px 0px rgba(135, 135, 135, 0.73);
        padding: 10px 100px 66px;
    }
    ::v-deep .el-dialog .el-dialog__header {
        padding: 0;
    }
    ::v-deep .el-dialog .el-dialog__close {
        font-size: 24px;
    }
    ::v-deep .el-dialog .el-dialog__headerbtn:hover .el-dialog__close {
        color: #020202;
    }
    ::v-deep .el-dialog .el-dialog__close:hover {
        color: #020202;
    }
}

.dialog {
    ::v-deep .el-dialog {
        display: inline-block;
        width: auto;
        height: auto;
    }
}

.dialog.medium {
    ::v-deep .el-dialog {
        width: 780px;
        min-height: 506px;
    }
}

.dialog.small {
    ::v-deep .el-dialog {
        width: 500px;
        min-height: 300px;
    }
}

.dialog.fullscreen {
    width: 100%;
    height: 100%;
    ::v-deep .el-dialog,
    ::v-deep .el-dialog__body {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        transform: none;
        padding: 0;
        margin: 0;
    }
    ::v-deep .el-dialog .el-dialog__close {
        position: relative;
        z-index: 1;
    }
    ::v-deep .el-dialog .el-dialog__headerbtn:hover .el-dialog__close {
        color: #999;
    }
    ::v-deep .el-dialog .el-dialog__close:hover {
        color: #999;
    }
}

.dialog.message {
    ::v-deep .el-dialog {
        width: 400px;
        height: 200px;
        display: flex;
        align-items: center;
        padding: 20px 20px;
    }
}
</style>
