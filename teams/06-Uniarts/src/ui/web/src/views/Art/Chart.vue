<template>
    <div class="box">
        <div class="myChart" ref="myChart"></div>
    </div>
</template>

<script>
import * as echarts from "echarts";
import { BigNumber } from "bignumber.js";
export default {
    name: "chart",
    props: ["list"],
    data() {
        return {
            limit: 10,
            myChart: {},
        };
    },
    watch: {
        list() {
            this.initChart();
        },
    },
    mounted() {
        this.initChart();
        window.addEventListener("resize", () => {
            this.myChart.resize();
        });
    },
    methods: {
        initChart() {
            let dataArray = this.list;
            dataArray =
                dataArray.length > 5
                    ? dataArray.splice(dataArray.length - 6, 5)
                    : dataArray.concat([]);
            dataArray.reverse();
            this.myChart = echarts.init(this.$refs.myChart);
            this.myChart.setOption({
                tooltip: {
                    backgroundColor: "rgba(2,2,2,0.8)",
                    formatter: (params) =>
                        `<div style="text-align: left;font-size: .85rem">Block Height: ${
                            params[0].name
                        }<br/>Price: ${new BigNumber(
                            params[0].data
                        ).toString()}</div>`,
                    trigger: "axis",
                    axisPointer: {
                        type: "line",
                        lineStyle: {
                            opacity: 0,
                        },
                    },
                },
                grid: {
                    top: "10%",
                    left: "19%",
                    right: "3%",
                    bottom: "15%",
                },
                xAxis: [
                    {
                        type: "category",
                        splitLine: {
                            show: false,
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            formatter: function (value) {
                                return value;
                            },
                        },
                        data: dataArray.map((v) => v.buy_time),
                        max: "dataMax",
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                        splitLine: {
                            show: false,
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        max: "dataMax",
                        min: "dataMin",
                    },
                ],
                series: [
                    {
                        type: "line",
                        smooth: true,
                        showSymbol: false,
                        itemStyle: {
                            color: "#020202",
                        },
                        areaStyle: {
                            color: {
                                type: "linear",
                                x: 1,
                                y: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: "rgba(2,2,2,0)", // 0% 处的颜色
                                    },
                                    {
                                        offset: 1,
                                        color: "rgba(2,2,2,0.6)", // 100% 处的颜色
                                    },
                                ],
                            },
                        },
                        symbol: "circle",
                        symbolSize: 3,
                        lineStyle: { color: "#020202", width: 2 },
                        data: dataArray.map((v) => {
                            return new BigNumber(v.price)
                                .div(
                                    new BigNumber(10).pow(
                                        this.$store.state.global.chain
                                            .tokenDecimals || 12
                                    )
                                )
                                .toNumber();
                        }),
                    },
                ],
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.box {
    height: 200px;
    /* width: 400px; */
    span {
        display: block;
        height: 15%;
        font-size: 16px;
        font-weight: 700;
        text-align: left;
        color: #666666;
        padding-left: 10%;
    }
    .myChart {
        width: 100%;
        height: 85%;
        overflow: hidden;
    }
}

@media (max-width: 375px) {
    .box {
        span,
        .myChart {
            padding-left: 0;
        }
    }
}
</style>
