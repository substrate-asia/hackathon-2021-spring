<template>
    <div class="qrcode" ref="qrcode" :class="{ 'no-flex': noflex }"></div>
</template>

<script>
import QrCode from "@/plugins/qrcode";
export default {
    props: ["data", "scale", "typeNumber", "errorCorrectionLevel", "noflex"],
    mounted() {
        this.init();
    },
    watch: {
        data() {
            this.init();
        },
    },
    methods: {
        init() {
            var typeNumber = this.typeNumber ? this.typeNumber : 5;
            var errorCorrectionLevel = this.errorCorrectionLevel
                ? this.errorCorrectionLevel
                : "M";
            var qr = QrCode(typeNumber, errorCorrectionLevel);
            qr.addData(this.data ? this.data : "No Data");
            qr.make();
            this.$refs.qrcode.innerHTML = qr.createSvgTag(
                this.scale ? this.scale : 4,
                this.typeNumber
            );
        },
    },
};
</script>

<style lang="scss" scoped>
.qrcode {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.no-flex {
    display: block;
}
</style>
