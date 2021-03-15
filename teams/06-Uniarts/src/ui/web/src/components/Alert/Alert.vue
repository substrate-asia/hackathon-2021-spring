<template>
    <div class="uni__alert">
        <div v-if="noteType === 'NeedBrowser'" class="alert-content">
            For a better experience, please use
            <span>Chrome</span> or
            <span>Firefox</span>
        </div>
        <div v-else-if="noteType === 'NeedPlugin'" class="need-plugin">
            <div>
                Please authorize the application or install
                <a target="_blank" :href="pluginUrl()">browser extension</a>
            </div>
        </div>
        <div v-else class="alert-content" v-html="message"></div>
    </div>
</template>
<script>
import Detect from "@/plugins/detect";
export default {
    name: "alert",
    props: {
        message: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            noteType: "",
        };
    },
    created() {
        console.log(Detect.browser.name);
    },
    methods: {
        pluginUrl() {
            let url = "";
            switch (Detect.browser.name) {
                case "Chrome":
                case "Edge":
                    url =
                        "https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd";
                    break;
                case "Firefox":
                    url =
                        "https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/";
                    break;
            }
            return url;
        },
    },
};
</script>
<style lang="scss" scoped>
.alert-content {
    width: 100%;
    padding: 12px 16px;
    margin: 0;
    box-sizing: border-box;
    position: relative;
    background-color: #fff;
    overflow: hidden;
    opacity: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
    /* border-bottom: 1px solid #ddd; */
    ::v-deep > span {
        color: #c61e1e;
        padding: 0 6px;
    }
}
.need-plugin,
.need-auth {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    > div > a,
    .text {
        cursor: pointer;
        font-size: 18px;
        color: #fa8903;
    }
}
</style>
