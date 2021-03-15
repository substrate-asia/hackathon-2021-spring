<template>
    <div class="uni-upload" @click="selectFile">
        <div class="box-boder selected" v-if="fileDataList.length > 0">
            <AdaptiveImage width="100%" height="100%" :url="fileDataList[2]" />
        </div>
        <div class="box-boder" v-if="fileDataList.length <= 0">
            <div class="bg">
                <div class="plus"></div>
                <div class="text">choose a picture</div>
            </div>
        </div>
    </div>
</template>
<script>
import AdaptiveImage from "@/components/AdaptiveImage";
export default {
    name: "uni-upload",
    model: {
        prop: "value",
        event: "change",
    },
    props: ["value", "limit"],
    components: {
        AdaptiveImage,
    },
    data() {
        return {
            fileDataList: [],
        };
    },
    watch: {
        fileDataList(value) {
            if (value.length > 0) {
                this.$emit("change", value);
                this.dispatch(
                    "ElFormItem",
                    "el.form.change",
                    this.fileDataList
                );
            }
        },
        value(value) {
            this.fileDataList = value ? value : [];
        },
    },
    methods: {
        selectFile() {
            this.getTheFile();
        },
        async getTheFile() {
            const pickerOpts = {
                types: [
                    {
                        description: "Image Or Video",
                        accept: {
                            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
                            "video/*": [".mp4"],
                        },
                    },
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            };

            let [fileHandle] = await window.showOpenFilePicker(pickerOpts);

            let fileData = await fileHandle.getFile();
            let reader = new FileReader();
            let fileDataURL = await new Promise((resolve) => {
                reader.onload = (event) => {
                    resolve(event.target.result);
                };
                reader.readAsDataURL(fileData);
            });
            this.fileDataList = [fileData, fileData.name, fileDataURL];
        },
        dispatch(componentName, eventName, params) {
            var parent = this.$parent || this.$root;
            var name = parent.$options.componentName;

            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.componentName;
                }
            }
            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.uni-upload {
    display: flex;
    width: 360px;
    .box-boder {
        width: 360px;
        max-width: 100%;
        max-height: 100%;
        height: 270px;
        cursor: pointer;
        position: relative;
        margin-right: 30px;
    }
    .box-boder.selected::after {
        content: "";
        width: 32px;
        height: 32px;
        right: -16px;
        top: -16px;
        position: absolute;
        background: url(~@/assets/images/refresh@2x.png) no-repeat;
        background-size: 32px;
        z-index: 1px;
    }
    .bg {
        width: 100%;
        height: 100%;
        background: #eee;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .plus {
        width: 52px;
        height: 52px;
        position: relative;
        margin-bottom: 30px;
    }
    .plus::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 6px;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 5px;
        background-color: #c5c5c5;
    }
    .plus::after {
        content: "";
        position: absolute;
        width: 6px;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 5px;
        background-color: #c5c5c5;
    }
    .text {
        font-size: 20px;
        font-weight: 400;
        text-align: center;
        color: #666666;
        letter-spacing: 0px;
    }
}
</style>
