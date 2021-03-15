<template>
    <div class="carousel container">
        <el-carousel arrow="never" height="500px" :autoplay="false">
            <el-carousel-item v-for="(item, index) in list" :key="index">
                <router-link :to="`/auction/${item.id}`" class="item-container">
                    <AdaptiveImage
                        width="100%"
                        height="100%"
                        :url="item.img_file.url"
                    />
                    <div class="bg"></div>
                    <div class="info-body">
                        <div class="topic">{{ item.topic }}</div>
                        <div class="time" v-if="status != 'end'">
                            {{
                                status == "waiting"
                                    ? "START AFTER"
                                    : status == "auctioning"
                                    ? "END AFTER"
                                    : ""
                            }}
                            <div class="time-parse">
                                <div class="day">{{ item.countdown.day }}d</div>
                                :
                                <div class="hour">
                                    {{ item.countdown.hour }}
                                </div>
                                :
                                <div class="minute">
                                    {{ item.countdown.minute }}
                                </div>
                                :
                                <div class="second">
                                    {{ item.countdown.second }}
                                </div>
                            </div>
                        </div>
                        <div class="date">
                            <img src="@/assets/images/time@2x.png" />
                            {{ timeLimit(item.start_at) }}
                            -
                            {{ timeLimit(item.end_at) }}
                        </div>
                        <div class="enter">
                            ENTER <img src="@/assets/images/pmjt@2x.png" />
                        </div>
                    </div>
                </router-link>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>
import { Carousel, CarouselItem } from "element-ui";
import AdaptiveImage from "@/components/AdaptiveImage";
export default {
    name: "carousel",
    components: {
        [Carousel.name]: Carousel,
        [CarouselItem.name]: CarouselItem,
        AdaptiveImage,
    },
    data() {
        return {
            list: [],
            total_count: 0,
            timeWorkIdList: [],
            status: "waiting",
        };
    },
    created() {
        this.requestData();
    },
    beforeDestroy() {
        this.timeWorkIdList.length > 0
            ? this.timeWorkIdList.forEach((v) => clearInterval(v.timeWorkId))
            : "";
        this.timeWorkIdList = [];
    },
    methods: {
        requestData() {
            this.$http.globalGetAuctionList({}).then((res) => {
                this.list = res.list.map((v) => {
                    v.countdown = "";
                    return v;
                });
                this.total_count = res.total_count;
                this.list.forEach((v) => {
                    this.initTimeWork(v);
                });
            });
        },
        countdownFormat(time) {
            time = parseInt(time) * 1000;
            let jetLag = Math.abs(new Date().getTime() - time) / 1000;
            let second = parseInt(jetLag % 60),
                minute = parseInt((jetLag / 60) % 60),
                hour = parseInt((jetLag / 3600) % 24),
                day = parseInt(jetLag / 3600 / 24);
            if (second == 0 && minute == 0 && hour == 0 && day == 0) {
                return;
            } else {
                return {
                    day: day < 10 ? `0${day}` : day,
                    hour: hour < 10 ? `0${hour}` : hour,
                    minute: minute < 10 ? `0${minute}` : minute,
                    second: second < 10 ? `0${second}` : second,
                };
            }
        },
        timeLimit(inputTime) {
            if (!inputTime) return "";
            var date = new Date(inputTime * 1000);
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? "0" + m : m;
            var d = date.getDate();
            d = d < 10 ? "0" + d : d;
            return y + "." + m + "." + d;
        },
        initTimeWork(item) {
            let obj = {
                id: item.id,
                timeWorkId: "",
            };
            let curTime = new Date().getTime() / 1000;
            let time = "";
            if (curTime < parseInt(item.start_at)) {
                time = item.start_at;
                obj.timeWorkId = setInterval(() => {
                    let result = this.countdownFormat(time);
                    if (result == -1) {
                        this.resetTimeWork(item.id);
                    } else {
                        item.countdown = result;
                    }
                }, 1000);
                this.timeWorkIdList.push(obj);
            } else if (
                curTime >= parseInt(item.start_at) &&
                curTime <= parseInt(item.end_at)
            ) {
                time = item.end_at;
                obj.timeWorkId = setInterval(() => {
                    let result = this.countdownFormat(time);
                    if (result == -1) {
                        this.resetTimeWork(item.id);
                    } else {
                        item.countdown = result;
                    }
                }, 1000);
                this.timeWorkIdList.push(obj);
            }
        },
        resetTimeWork(id) {
            let index = this.timeWorkIdList.findIndex((v) => v.id == id);
            if (index >= 0) {
                clearInterval(this.timeWorkIdList[index].timeWorkId);
                this.timeWorkIdList.splice(index, 1);
                let result = this.list.find((v) => v.id == id);
                if (result) {
                    this.initTimeWork(result);
                }
            }
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
    .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background: #000;
        opacity: 0.4;
    }
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
        > div {
            font-family: "Broadway";
            font-size: 30px;
            font-weight: 400;
            text-align: left;
            color: #ffffff;
            letter-spacing: 2px;
        }

        .topic {
            font-size: 24px;
            font-family: "Broadway";
            font-weight: 400;
            text-align: center;
            color: #ffffff;
            line-height: 63px;
            letter-spacing: 1px;
            width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-bottom: 15px;
        }

        .time {
            color: white;
            font-size: 22px;
            font-family: "Broadway";
            font-weight: 400;
            line-height: 63px;
            letter-spacing: 2px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 30px;
        }
        .time-parse {
            font-family: "Broadway";
            display: flex;
            align-items: center;
            margin-left: 13px;
            .day,
            .hour,
            .minute,
            .second {
                width: 54px;
                height: 37px;
                font-size: 22px;
                line-height: 37px;
                font-family: "Broadway";
                color: white;
                border-radius: 13px;
                padding: 0 5px;
                text-align: center;
                margin: 0 10px;
                background-color: #c61e1e;
            }
            .day {
                width: auto;
                min-width: 76px;
                display: inline-block;
            }
        }
        .date {
            font-size: 18px;
            font-weight: 400;
            font-family: "PingFang SC Regular, PingFang SC Regular-Regular";
            text-align: center;
            color: #ffffff;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 70px;
            > img {
                width: 17px;
                height: 17px;
                margin-right: 10px;
            }
        }
        .enter {
            font-size: 18px;
            font-family: PingFang SC Semibold, PingFang SC Semibold-Semibold;
            font-weight: 600;
            text-align: center;
            color: #ffffff;
            letter-spacing: 1px;
            > img {
                width: 17px;
            }
        }
    }
}
</style>
