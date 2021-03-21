<template>
    <div class="index">
        <div class="container">
            <div class="header" v-if="topAuthor.id">
                <div class="bg"></div>
                <div class="profile">
                    <router-link
                        class="avatar-container"
                        :to="`/artist-detail/${topAuthor.id}`"
                    >
                        <div class="avatar">
                            <AdaptiveImage
                                width="325px"
                                height="430px"
                                :url="
                                    topAuthor.recommend_image.url
                                        ? topAuthor.recommend_image.url
                                        : yin_2x
                                "
                            />
                        </div>
                    </router-link>
                    <div class="info">
                        <div class="name">
                            {{ topAuthor.display_name || "Anonymous" }}
                        </div>
                        <div class="intro">
                            <i class="quote1"></i>
                            {{
                                topAuthor.artist_desc
                                    ? topAuthor.artist_desc
                                    : "No description"
                            }}
                            <i class="quote2"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="recommendations">
                <h4 class="title">Previous recommendations</h4>
                <div class="artist-list" v-loading="isLoading">
                    <Artist
                        :member="v.member"
                        :list="v.arts"
                        :art_count="v.member.art_size"
                        v-for="(v, i) in artList"
                        :key="i"
                    ></Artist>
                </div>
                <div class="pagenation" v-if="hasPrev || hasNext">
                    <div
                        class="prev"
                        :class="{ 'no-prev': !hasPrev }"
                        @click="prev"
                    ></div>
                    <div
                        class="next"
                        :class="{ 'no-next': !hasNext }"
                        @click="next"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Artist from "@/components/Artist";
import AdaptiveImage from "@/components/AdaptiveImage";
import yin_2x from "@/assets/images/yin@2x.png";
export default {
    name: "index",
    components: { Artist, AdaptiveImage },
    data() {
        return {
            list: [],
            artList: [],
            isLoading: false,
            total_pages: 0,
            per_page: 18,
            page: 1,
            topAuthor: {},
            yin_2x,
        };
    },
    created() {
        this.requestData();
        this.requestTopData();
    },
    computed: {
        hasPrev() {
            return this.page > 1;
        },
        hasNext() {
            return this.page < this.total_pages;
        },
    },
    methods: {
        requestData() {
            this.isLoading = true;
            this.$http
                .globalGetPreArtistTopic({
                    per_page: this.per_page,
                    page: this.page,
                })
                .then((res) => {
                    this.isLoading = false;
                    this.artList = res.list;
                    this.total_pages = Math.ceil(
                        res.total_count / this.per_page
                    );
                })
                .catch((err) => {
                    console.log(err);
                    this.isLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        requestTopData() {
            this.$http
                .globalGetTopArtist({
                    per_page: this.per_page,
                    page: this.page,
                })
                .then((res) => {
                    console.log(res);
                    this.topAuthor = res.length > 0 ? res[0] : {};
                })
                .catch((err) => {
                    console.log(err);
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        next() {
            if (this.hasNext) {
                this.page++;
                this.requestData();
            }
        },
        prev() {
            if (this.hasPrev) {
                this.page--;
                this.requestData();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.index {
    padding-top: 50px;
    padding-bottom: 50px;
}
.header {
    position: relative;
    margin-bottom: 135px;
    .bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 340px;
        background: url("~@/assets/images/ren-bg@2x.png") no-repeat;
        background-size: 100% auto;
    }
    .profile {
        padding-top: 94px;
        position: relative;
        display: flex;
        justify-content: flex-start;
        .avatar-container {
            position: relative;
            overflow: hidden;
            margin-left: 120px;
            width: 325px;
            height: 430px;
            cursor: pointer;
        }
        .avatar-container > img {
            position: absolute;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
        }
        .info {
            margin-top: 100px;
            margin-left: 76px;
            .name {
                font-size: 36px;
                font-family: "Broadway";
                font-weight: 400;
                text-align: left;
                color: #ffffff;
                letter-spacing: 0px;
                margin-bottom: 157px;
            }
            .intro {
                padding: 20px 78px 0px 78px;
                font-size: 28px;
                font-weight: 400;
                text-align: left;
                letter-spacing: 1px;
                position: relative;
                max-width: 607px;
            }
            i.quote1 {
                position: absolute;
                top: 0;
                left: 0;
                display: block;
                width: 34px;
                height: 21px;
                background: url("~@/assets/images/quote1@2x.png") no-repeat;
                background-size: 100%;
            }
            i.quote2 {
                position: absolute;
                right: 0;
                bottom: 0;
                display: block;
                width: 34px;
                height: 21px;
                background: url("~@/assets/images/quote1@2x.png") no-repeat;
                background-size: 100%;
            }
        }
    }
}

.recommendations {
    .title {
        text-transform: uppercase;
        font-size: 39px;
        font-family: "Broadway";
        font-weight: 400;
        letter-spacing: 2px;
        text-align: left;
        margin-bottom: 115px;
    }

    .pagenation {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 50px;
        .prev {
            width: 110px;
            height: 70px;
            background: url("~@/assets/images/zuo@2x.png") no-repeat;
            background-size: 100% auto;
            margin: 0 91px;
            cursor: pointer;
        }
        .prev.no-prev,
        .next.no-next {
            opacity: 0.3;
            cursor: not-allowed;
        }
        .next {
            width: 110px;
            height: 70px;
            background: url("~@/assets/images/you@2x.png") no-repeat;
            background-size: 100% auto;
            margin: 0 91px;
            cursor: pointer;
        }
    }
}
</style>
