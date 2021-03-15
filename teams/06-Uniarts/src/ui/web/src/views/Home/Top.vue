<template>
    <div class="carousel">
        <el-carousel arrow="never" height="760px" :autoplay="false">
            <el-carousel-item>
                <router-link to="/" class="item-container">
                    <AdaptiveImage width="100%" height="100%" :url="bg1" />
                    <div class="info-body">
                        <div class="container">
                            <h1 style="padding-left: 200px">Link Credit</h1>
                            <h1 style="text-align: right; padding-right: 200px">
                                Assist <span class="tip">Originality</span>
                            </h1>
                            <div class="input-body">
                                <div class="input-box">
                                    View Gallery
                                    <img src="@/assets/images/pmjt@2x.png" />
                                </div>
                            </div>
                        </div>
                    </div>
                </router-link>
            </el-carousel-item>
            <el-carousel-item v-for="(item, index) in list" :key="index">
                <a :href="item.url" target="_blank" class="item-container">
                    <AdaptiveImage
                        width="100%"
                        height="100%"
                        :url="item.img_middle"
                    />
                    <div class="info-body">
                        <div class="container">
                            <h1 style="text-align: center">Link Credit</h1>
                            <div
                                class="input-body"
                                style="justify-content: center; margin-right: 0"
                            >
                                <div class="input-box">Enter</div>
                            </div>
                        </div>
                    </div>
                </a>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>
<script>
import { Carousel, CarouselItem } from "element-ui";
import AdaptiveImage from "@/components/AdaptiveImage";
import bg1 from "@/assets/images/temp/home-page1.jpg";
export default {
    name: "top",
    components: {
        [Carousel.name]: Carousel,
        [CarouselItem.name]: CarouselItem,
        AdaptiveImage,
    },
    data() {
        return {
            list: [],
            bg1,
        };
    },
    created() {
        this.requestData();
    },
    methods: {
        requestData() {
            this.$http
                .globalGetBannerList({
                    platform: 0,
                })
                .then((res) => {
                    this.list = res;
                })
                .catch(() => {
                    this.isSubmiting = false;
                    this.$notify.error("Unknow Error");
                });
        },
    },
};
</script>
<style lang="scss" scoped>
.el-carousel {
    width: 100%;
    ::v-deep .el-carousel__indicators .el-carousel__button {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        margin-left: 6px;
        margin-right: 6px;
    }
    ::v-deep .el-carousel__indicators--horizontal {
        bottom: 10px;
    }
}

.item-container {
    width: 100%;
    height: 100%;
    display: block;
    position: relative;
}

.el-carousel__item {
    height: 100%;
    width: 100%;
    .info-body {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        h1 {
            width: 100%;
            font-size: 65px;
            font-family: "Broadway";
            font-weight: 400;
            text-align: left;
            line-height: 60px;
            color: white;
            letter-spacing: 1px;
            margin-bottom: 90px;
        }
        .tip {
            color: #fbd02c;
            font-size: 65px;
            font-weight: 400;
            font-family: "Broadway";
            letter-spacing: 1px;
        }
        .input-box {
            width: 238px;
            height: 52px;
            overflow: hidden;
            right: 0;
            opacity: 1;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.8);
            font-size: 20px;
            font-family: PingFang SC Semibold, PingFang SC Semibold-Semibold;
            font-weight: 600;
            text-align: center;
            color: #ffffff;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 0;
            img {
                width: 20px;
                margin-left: 10px;
            }
        }
        .input-body {
            display: flex;
            justify-content: flex-end;
            margin-right: 150px;
        }
    }
}
</style>
