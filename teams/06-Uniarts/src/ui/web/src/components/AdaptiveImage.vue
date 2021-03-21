<template>
    <div
        class="adaptive-image"
        ref="imgBox"
        :class="{ 'img-loading': isLoading && !isVideo }"
        :style="`${width ? `width:${width};` : ``}${
            height ? `height:${height};` : ``
        }`"
    >
        <img
            v-if="!isVideo"
            ref="img"
            :class="{
                'img-horizontal': !isOrigin && isHorizontal,
                'img-vertical': !isOrigin && !isHorizontal,
                'img-origin': isOrigin,
            }"
            @load="imgOnLoad"
            :src="url"
        />
        <Video
            v-else
            :source="url"
            :isPlay="isPlay"
            :isResponsive="isResponsive"
            @load="imgOnLoad"
        />
        <icon-svg
            v-if="!isPlay && isVideo"
            class="video-label"
            icon-class="video"
        />
    </div>
</template>
<script>
import Video from "@/components/Video";
export default {
    name: "adaptive-image",
    components: {
        Video,
    },
    props: {
        url: {
            type: String,
            required: true,
        },
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "100%",
        },
        isOrigin: {
            type: Boolean,
            default: false,
        },
        isPlay: {
            type: Boolean,
            default: false,
        },
        isResponsive: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isHorizontal: false,
            isLoading: true,
        };
    },
    computed: {
        isVideo() {
            return (
                /\.mp4$/.test(this.url) || /^data:video\/mp4;/.test(this.url)
            );
        },
    },
    methods: {
        imgOnLoad() {
            if (this.isVideo) {
                return;
            }
            if (this.isOrigin) {
                this.isLoading = false;
                return;
            }

            let obj = this.$refs.img;
            let width = obj ? obj.width : "100%";
            let height = obj ? obj.height : "230px";
            let boxWidth = this.width;
            let boxHeight = this.height;
            boxWidth = boxWidth.includes("px")
                ? boxWidth.split("px")[0]
                : boxWidth;
            boxWidth = boxWidth.includes("%")
                ? this.$refs.imgBox
                    ? this.$refs.imgBox.offsetWidth
                    : 0
                : boxWidth;
            boxHeight = boxHeight.includes("px")
                ? boxHeight.split("px")[0]
                : boxHeight;
            boxHeight = boxHeight.includes("%")
                ? this.$refs.imgBox
                    ? this.$refs.imgBox.offsetHeight
                    : 0
                : boxHeight;
            if (width < height) {
                this.isHorizontal = height < boxHeight ? false : true;
            } else {
                this.isHorizontal = width < boxWidth ? true : false;
            }
            this.isLoading = false;
        },
    },
};
</script>
<style lang="scss" scoped>
.adaptive-image {
    display: block;
    width: 100%;
    height: 230px;
    overflow: hidden;
    border-radius: 4px;
    position: relative;
    > img {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateY(-50%) translateX(-50%);
        transition: opacity 0.3s ease;
        opacity: 1;
    }

    > img.img-horizontal {
        width: 100%;
        height: auto;
    }

    > img.img-vertical {
        height: 100%;
        width: auto;
    }

    > img.img-origin {
        max-height: 100%;
        max-width: 100%;
    }
    .video-label {
        font-size: 28px;
        position: absolute;
        top: 3px;
        right: 7px;
        color: white;
    }
}
.img-loading {
    > img {
        opacity: 0;
    }
}
</style>
