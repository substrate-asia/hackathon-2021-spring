<template>
    <div
        class="index"
        @click="like"
        :style="`font-size: ${size}px;width: ${size}px;height: ${size}px`"
    >
        <div class="heart-container">
            <icon-svg
                v-if="isLike"
                class="heart active"
                icon-class="heart-active"
            />
            <icon-svg v-else icon-class="heart" class="heart" />
        </div>
        <div v-if="isShowCircle" class="circle-container">
            <svg
                class="circle"
                :width="size"
                :height="size"
                :style="`left:${(v.x / 100) * size}px;top:${
                    (v.y / 100) * size
                }px;`"
                :viewBox="`0 0 ${size} ${size}`"
                v-for="(v, i) in list"
                :key="i"
            >
                <circle
                    :cx="(v.r / 100) * size"
                    :cy="(v.r / 100) * size"
                    stroke="#ff5656"
                    fill="transparent"
                >
                    <animate
                        attributeName="r"
                        :values="`${v.radius}`"
                        :delay="`${v.delay / 1000}s`"
                        :dur="`${v.duration / 1000}s`"
                        repeatCount="1"
                    />
                    <animate
                        attributeName="stroke-width"
                        :delay="`${v.delay / 1000}s`"
                        :values="`${v.strokeWidth}`"
                        :dur="`${v.duration / 1000}s`"
                        repeatCount="1"
                    />
                </circle>
            </svg>
        </div>
    </div>
</template>
<script>
export default {
    name: "index",
    props: {
        size: {
            type: Number,
            default: 35,
        },
        number: {
            type: Number,
            default: 4,
        },
    },
    data() {
        return {
            isLike: false,
            list: [
                {
                    duration: 300,
                    delay: 100,
                    radius: `0;${(20 / 100) * this.size}`,
                    r: "20",
                    strokeWidth: `0;${(10 / 100) * this.size};0`,
                    opacity: 0.2,
                    x: 40,
                    y: -60,
                },
                {
                    duration: 500,
                    delay: 180,
                    radius: `0;${(10 / 100) * this.size}`,
                    r: "10",
                    strokeWidth: `0;${(10 / 100) * this.size};0`,
                    opacity: 0.5,
                    x: -10,
                    y: -80,
                },
                {
                    duration: 200,
                    delay: 240,
                    radius: `0;${(20 / 100) * this.size}`,
                    r: "20",
                    strokeWidth: `0;${(10 / 100) * this.size};0`,
                    opacity: 0.3,
                    x: -70,
                    y: -10,
                },
                {
                    duration: 700,
                    delay: 240,
                    type: "circle",
                    radius: `0;${(20 / 100) * this.size}`,
                    r: "20",
                    strokeWidth: `0;${(10 / 100) * this.size};0`,
                    opacity: 0.4,
                    x: 80,
                    y: -50,
                },
                {
                    duration: 1000,
                    delay: 300,
                    radius: `0;${(15 / 100) * this.size}`,
                    r: "15",
                    strokeWidth: `0;${(10 / 100) * this.size};0`,
                    opacity: 0.2,
                    x: 20,
                    y: -100,
                },
                {
                    duration: 600,
                    delay: 330,
                    radius: `0;${(25 / 100) * this.size}`,
                    r: "25",
                    strokeWidth: `0;${(10 / 100) * this.size};0`,
                    opacity: 0.4,
                    x: -40,
                    y: -90,
                },
            ],
            isShowCircle: false,
        };
    },
    methods: {
        like() {
            this.isShowCircle = !this.isLike ? true : false;
            this.isLike = !this.isLike;
        },
    },
};
</script>
<style lang="scss" scoped>
.index {
    cursor: pointer;
    font-size: 35px;
    position: relative;
}
.heart-container {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.circle-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
.active {
    color: #ff5656;
    animation: size 0.3s ease;
}
@keyframes size {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}
.circle {
    position: absolute;
}
</style>
