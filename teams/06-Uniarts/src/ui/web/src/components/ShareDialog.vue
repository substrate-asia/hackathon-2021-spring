<template>
    <div class="share-dialog">
        <div class="title">SHARE</div>
        <div class="content">
            <div style="color: #5d96ff">
                Uniarts chain - Art encryption Tour
            </div>
            <div v-if="type == 'art'">Art：{{ art }}</div>
            <div v-else>Author：{{ author }}</div>
            <div style="margin-bottom: 0">
                View the homepage：<a :href="url" target="_blank">{{ url }}</a>
            </div>
        </div>
        <button @click="share">COPY AND SHARE</button>
    </div>
</template>
<script>
export default {
    name: "share-dialog",
    props: {
        type: {
            type: String,
            default: "art",
        },
        url: {
            type: String,
            default: "",
        },
        author: {
            type: String,
            default: "",
        },
        art: {
            type: String,
            default: "",
        },
        content: {
            type: String,
            default: "",
        },
    },
    data() {
        return {};
    },
    methods: {
        share() {
            this.$copy(this.content);
        },
    },
};
</script>
<style lang="scss" scoped>
.share-dialog {
    font-size: 26px;
    text-align: left;
    letter-spacing: 0px;
    text-align: center;
    color: #020202;
    .title {
        font-weight: 600;
        margin-bottom: 60px;
    }
    > button {
        background: #020202;
        width: 307px;
        height: 75px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        color: #ffffff;
        letter-spacing: 0px;
        cursor: pointer;
    }
    .content {
        width: 100%;
        min-height: 150px;
        margin: 0 auto;
        margin-bottom: 60px;
        background: #f2f2f2;
        padding: 25px 35px;
        border-radius: 10px;
        > div {
            font-size: 20px;
            font-weight: 400;
            text-align: left;
            color: #5d96ff;
            margin-bottom: 17px;
            color: #020202;
        }
        a:hover {
            text-decoration: underline;
        }
    }
}
</style>
