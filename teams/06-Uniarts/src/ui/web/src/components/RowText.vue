<template>
    <div class="row-text">
        {{ cropText(content) }}
    </div>
</template>
<script>
export default {
    name: "row-text",
    props: ["text", "textLength"],
    watch: {
        text(value) {
            this.content = value;
        },
    },
    data() {
        return {
            content: "",
            defaultLength: 69,
        };
    },
    created() {
        this.content = this.text;
    },
    methods: {
        cropText(text) {
            if (!text) return "";
            let length = this.textLength ? this.textLength : this.defaultLength;
            if (text.length <= length) return text;
            let result = (text + "").substr(0, length) + "....";
            return result;
        },
    },
};
</script>
<style lang="scss" scoped>
.row-text {
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    width: 100%;
    display: block;
    word-wrap: break-word;
    text-transform: uppercase;
    max-width: 100%;
    overflow: hidden;
}
</style>
