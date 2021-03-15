<template>
    <button class="main-btn" :style="'width:'+width+'px;'">
    </button>
</template>

<script>
    export default {
        name:"MainButton",
        props: {
            width: {
                type: Number,
                default: 30
            },
        },
    }
</script>

<style lang="scss" scoped>
.main-btn{
background-color: #FFDB1B;
color: #242629;
font-size: 16px;
font-family: PingFangSC-Semibold, PingFang SC;
font-weight: 600;
color: #242629;
line-height: 24px;
height: 48px;
box-shadow: 0px 8px 12px -4px #FFEC88;
border-radius: 16px;
}
</style>