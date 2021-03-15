<template>
    <el-date-picker
        v-model="inputData"
        :type="type ? type : 'date'"
        :placeholder="placeholder"
        popper-class="uni-date-picker"
        @blur="onBlur"
    >
    </el-date-picker>
</template>
<script>
import { DatePicker } from "element-ui";
export default {
    name: "uni-data-picker",
    components: {
        [DatePicker.name]: DatePicker,
    },
    props: ["value", "placeholder", "type"],
    model: {
        prop: "value",
        event: "change",
    },
    data() {
        return {
            inputData: "",
        };
    },
    watch: {
        inputData() {
            this.$emit("change", this.inputData);
        },
        value(value) {
            this.inputData = value;
        },
    },
    methods: {
        onBlur() {
            this.$emit("blur", this.inputData);
            this.dispatch("ElFormItem", "el.form.blur", this.inputData);
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
::v-deep .el-input__inner {
    border-width: 2px;
    border-radius: 0px;
    border-color: black;
    position: relative;
    height: 45px;
    color: #020202;
}
</style>
<style lang="scss">
.el-date-picker.uni-date-picker {
    border-radius: 0px;
    border-color: black;
    border-width: 2px;
}

.el-date-picker[x-placement^="bottom"] .popper__arrow {
    border-left-width: 10px;
    border-right-width: 10px;
    border-bottom-color: black;
}
.el-date-picker[x-placement^="bottom"] .popper__arrow::after {
    top: 2px;
    margin-left: -10px;
    border-left-width: 10px;
    border-right-width: 10px;
    border-bottom-color: white;
}
</style>
