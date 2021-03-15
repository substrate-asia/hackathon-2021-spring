<template>
    <div class="video" ref="videoPlay" v-loading="isLoading">
        <div
            class="video-player-container"
            :class="{ responsive: isResponsive }"
            ref="videoContainer"
        >
            <video
                :preload="preload"
                :src="source"
                ref="video"
                :class="{
                    'responsive-horizontal':
                        isResponsive && isResponsiveHorizontal,
                    'responsive-vertical':
                        isResponsive && !isResponsiveHorizontal,
                    horizontal: isHorizontal && !isResponsive,
                }"
                @canplay="canplay"
                :loop="isPlay"
                :muted="isMute"
            ></video>
        </div>
        <div class="video-control" v-if="isPlay">
            <div class="icon" @click="replay">
                <icon-svg icon-class="replay" />
            </div>
            <div class="icon" @click="mute">
                <icon-svg v-if="!isMute" icon-class="volume" class="volume" />
                <icon-svg v-else icon-class="mute" class="volume" />
            </div>
            <div class="icon" @click="fullscreen" v-if="!isFullscreen">
                <icon-svg icon-class="fullscreen" class="fullscreen" />
            </div>
            <div class="icon" @click="smallscreen" v-else>
                <icon-svg icon-class="smallscreen" class="fullscreen" />
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "video-player",
    props: {
        source: {
            type: String,
            required: true,
            default: "",
        },
        preload: {
            type: String,
            default: "metadata",
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
            isMute: true,
            isFullscreen: false,
            isLoading: true,
            isResponsiveHorizontal: false,
        };
    },
    methods: {
        canplay() {
            if (!this.isResponsive) {
                let width = this.$refs.video.width;
                let height = this.$refs.video.height;
                this.isHorizontal = width > height ? true : false;
                this.isLoading = false;
                this.isPlay ? this.$refs.video.play() : "";
            } else {
                let obj = this.$refs.video;
                let width = obj ? obj.width : "100%";
                let height = obj ? obj.height : "230px";
                let boxWidth = this.width;
                let boxHeight = this.height;
                boxWidth = this.$refs.videoContainer
                    ? this.$refs.videoContainer.offsetWidth
                    : 0;
                boxHeight = this.$refs.videoContainer
                    ? this.$refs.videoContainer.offsetHeight
                    : 0;
                if (width < height) {
                    this.isResponsiveHorizontal =
                        height < boxHeight ? false : true;
                } else {
                    this.isResponsiveHorizontal =
                        width < boxWidth ? true : false;
                }
                this.isLoading = false;
            }
        },
        replay() {
            this.$refs.video.currentTime = 0;
        },
        mute() {
            this.isMute = !this.isMute;
        },
        fullscreen() {
            this.$refs.videoPlay.requestFullscreen();
            this.isFullscreen = true;
        },
        smallscreen() {
            document.exitFullscreen();
            this.isFullscreen = false;
        },
    },
};
</script>
<style lang="scss" scoped>
.video {
    width: 100%;
    height: 100%;
    position: relative;
}
.video-player-container {
    width: 100%;
    height: 100%;
    video {
        height: 100%;
        width: auto;
    }
    video.horizontal {
        height: auto;
        width: 100%;
    }
}
.video-player-container.responsive {
    video {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateY(-50%) translateX(-50%);
        transition: opacity 0.3s ease;
        opacity: 1;
    }

    video.responsive-horizontal {
        width: 100%;
        height: auto;
    }

    video.responsive-vertical {
        height: 100%;
        width: auto;
    }
}
.video-control {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    padding-right: 10px;
    background: linear-gradient(
        180deg,
        transparent 0,
        rgb(0, 0, 0, 0.02) 10%,
        rgb(0, 0, 0, 0.1) 30%,
        rgba(0, 0, 0, 0.3) 90%
    );
    .icon {
        font-size: 22px;
        color: white;
        margin: 0 5px;
        cursor: pointer;
    }
}

.video:hover .video-control {
    opacity: 1;
}
</style>
