<template>
    <div class="notification">
        <div class="logo">
            <icon-svg
                icon-class="success"
                class="success"
                v-if="noticeType == 'success'"
            />
            <icon-svg
                icon-class="loading"
                class="loading"
                v-if="noticeType == 'loading'"
            />
            <icon-svg
                icon-class="error"
                class="error"
                v-if="noticeType == 'error'"
            />
            <icon-svg
                icon-class="info"
                class="info"
                v-if="noticeType == 'info'"
            />
        </div>
        <div class="body">
            <h1 v-if="noticeTitle">{{ noticeTitle }}</h1>
            <p v-if="noticeMessage">{{ noticeMessage }}</p>
        </div>
    </div>
</template>
<script>
export default {
    name: "notification",
    props: {
        noticeType: {
            type: String,
            default: "info",
        },
        noticeTitle: {
            type: String,
            default: "",
        },
        noticeMessage: {
            type: String,
            default: "",
        },
    },
    created() {},
    data() {
        return {};
    },
};
</script>
<style lang="scss" scoped>
.notification {
    display: flex;
    align-items: center;
    .logo {
        display: flex;
        align-items: center;
        color: black;
        font-size: 23px;
        margin-right: 20px;
        .success {
            color: green;
        }
        .error {
            color: red;
        }
    }
    .body {
        > h1 {
            font-size: 20px;
            color: black;
            font-weight: 500;
        }
        > p {
            margin-top: 5px;
            font-size: 18px;
            color: black;
        }
    }
}
</style>
