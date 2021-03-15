<template>
    <div class="artist">
        <div class="profile">
            <div class="avatar">
                <router-link
                    :to="`/artist-detail/${member.id}`"
                    class="avatar-img"
                >
                    <AdaptiveImage
                        :url="member.avatar.url ? member.avatar.url : yin_2x"
                    />
                </router-link>
                <div class="info">
                    <span class="name">{{
                        member.display_name || "Anonymous"
                    }}</span>
                    <RowText
                        class="desc"
                        :textLength="70"
                        :text="member.desc || member.address"
                    />
                </div>
            </div>
            <div class="works">
                <i class="zp"></i>
                <span>{{ art_count }} works</span>
            </div>
        </div>
        <Thumbnail class="thumbnail" :list="list"></Thumbnail>
    </div>
</template>
<script>
import Thumbnail from "@/components/Thumbnail";
import AdaptiveImage from "@/components/AdaptiveImage";
import RowText from "@/components/RowText";
import yin_2x from "@/assets/images/yin@2x.png";
export default {
    name: "artist",
    components: { Thumbnail, AdaptiveImage, RowText },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        member: {
            type: Object,
            default: () => {},
        },
        art_count: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            yin_2x,
        };
    },
    methods: {
        goDetail(id) {
            this.$router.push("/artist-detail/" + id);
        },
    },
};
</script>
<style lang="scss" scoped>
.profile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 97px;
    .avatar-img {
        width: 95px;
        height: 95px;
        overflow: hidden;
        border: 4px solid #020202;
        border-radius: 50%;
        cursor: pointer;
    }
    .avatar-img.empty {
        border-color: transparent;
    }
}
.avatar {
    display: flex;
    align-items: center;
}
.info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 32px;
    .name {
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0px;
        margin-bottom: 10px;
        text-align: left;
    }
    .desc {
        font-size: 16px;
        font-weight: 400;
        text-align: left;
        letter-spacing: 1px;
        width: 800px;
        line-height: 20px;
    }
}
.works {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 400;
    text-align: left;
    letter-spacing: 0px;
    .zp {
        margin-right: 12px;
        display: block;
        width: 27px;
        height: 25px;
        background: url("~@/assets/images/zuopin@2x.png") no-repeat;
        background-size: 100% auto;
    }
}
.thumbnail {
    margin-bottom: 130px;
}
</style>
