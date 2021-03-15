<template>
    <el-input
        type="textarea"
        :autosize="{ minRows: minRows, maxRows: maxRows }"
        :rows="rows"
        :placeholder="placeholder"
        v-model="inputData"
    >
    </el-input>
</template>
<script>
import { Input } from "element-ui";
export default {
    name: "uni-textarea",
    components: {
        [Input.name]: Input,
    },
    model: {
        prop: "value",
        event: "change",
    },
    props: {
        value: {
            default: "",
        },
        minRows: {
            type: Number,
            default: 2,
        },
        maxRows: {
            type: Number,
            default: 8,
        },
        rows: {
            type: Number,
            default: 4,
        },
        placeholder: {
            type: String,
            dafault: "请输入相关内容",
        },
    },
    watch: {
        inputData() {
            this.$emit("change", this.inputData);
        },
        value(value) {
            this.inputData = value;
        },
    },
    data() {
        return {
            inputData: "",
        };
    },
};
</script>
<style lang="scss" scoped>
::v-deep {
    textarea,
    textarea:hover {
        border: 2px solid #020202;
        border-radius: 0px;
        font-size: 17px;
        color: #020202;
        max-height: 100%;
    }
}
</style>
