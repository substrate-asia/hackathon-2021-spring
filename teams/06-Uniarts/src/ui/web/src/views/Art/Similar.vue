<template>
    <div class="similar">
        <div class="title">Recommend Arts</div>
        <div class="content">
            <Thumbnail :list="list"></Thumbnail>
        </div>
    </div>
</template>
<script>
import Thumbnail from "@/components/Thumbnail";
export default {
    name: "similar",
    components: {
        Thumbnail,
    },
    data() {
        return {};
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
    },
};
</script>
<style lang="scss" scoped>
.similar {
    margin-bottom: 180px;
    > .title {
        font-size: 48px;
        font-family: "Broadway";
        font-weight: 400;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 110px;
    }
}
</style>
