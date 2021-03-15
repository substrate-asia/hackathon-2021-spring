//买卖
<template>
  <div class="di">
    <!-- <div class="di2">
      <div class="btn1">买入/做多</div>
      <div class="btn2">卖出/做空</div>
    </div> -->
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 16px;
      "
    >
      <el-button class="font0">买入/做多</el-button>
      <el-button class="font0">卖出/做空</el-button>
      <el-button class="font0">对冲/多空</el-button>
    </div>
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 16px;

        background: #d6d9ee;
        border-radius: 22px;
        height: 44px;
        width: auto;
      "
    >
      <span class="font0">数量</span>
      <input v-model="sum_input" placeholder="请输入数量" class="input0" />
      <span style="justify-content: center; align-items: center" class="font0">
        USDT
      </span>
    </div>
    <div style="margin-top: 10px">≈ 0 BTC</div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 16px;
      "
    >
      <el-button class="btn0">25%</el-button>
      <el-button class="btn0">50%</el-button>
      <el-button class="btn0">75%</el-button>
      <el-button class="btn0">100%</el-button>
    </div>
    <div style="margin-top: 10px">
      <span class="font1" style="float: left; display: flex">杠杆</span>
      <span class="font1" style="display: flex; justify-content: flex-end"
        >10X</span
      >
    </div>
    <div>
      <el-slider :step="1" show-stops :max="10" :min="0"></el-slider>
    </div>
    <div style="margin-top: 10px">
      <span class="font0" style="float: left; display: flex">保证金</span>
      <span style="display: flex; justify-content: flex-end">0 USDT</span>
    </div>
    <div style="margin-top: 10px">
      <span class="font0" style="float: left; display: flex">预计开仓价</span>
      <span style="display: flex; justify-content: flex-end">18,736.32</span>
    </div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
      "
    >
      <el-button class="btn0">开仓</el-button>
    </div>
  </div>
  <!-- <div class="transaction">
    <el-row class="di">
      <el-col
        :xs="24"
        :sm="13"
        style="
          background: rgb(249, 249, 251);
          padding-top: 40px;
          padding-bottom: 40px;
          padding-left: 20px;
          padding-right: 20px;
          border-radius: 8px;
        "
      >
        <el-col style="text-align: center" :xs="24">
          <el-button>买入</el-button>
          <el-button>卖出</el-button>
          <el-button>对冲</el-button>
        </el-col>
        <el-col :xs="24" style="text-align: left">
          <span>数量</span>
          <el-input
            size="mini"
            v-model="sum_input"
            placeholder="请输入数量"
            style="width: 200px"
          ></el-input>
          <span style="float: right; right: 20px">USDT</span>
        </el-col>
        <el-col :xs="24" style="text-align: left">
          <span>≈ 0 BTC</span>
        </el-col>
        <el-col :xs="24" style="text-align: center">
          <el-button style="text-align: center; max-width: 261%" size="small"
            >25%</el-button
          >
          <el-button size="small">50%</el-button>
          <el-button size="small">75%</el-button>
          <el-button size="small">100%</el-button>
        </el-col>
        <el-col :xs="24" :sm="24" style="text-align: left">
          <span>杠杆</span>
        </el-col>
        <el-col :xs="24" :sm="24">
          <el-slider :step="1" show-stops :max="10" :min="0"></el-slider>
        </el-col>
        <el-col :xs="24" :sm="12" style="text-align: left">
          <span>保证金</span>
        </el-col>
        <el-col :xs="24" :sm="12" style="text-align: right">
          <span>0 USDT</span>
        </el-col>
        <el-col :xs="24" :sm="12" style="text-align: left">
          <span>预计开仓价</span>
        </el-col>
        <el-col :xs="24" :sm="12" style="text-align: right">
          <span>18,736.32</span>
        </el-col>
        <el-col style="text-align: center">
          <el-button style="text-align: center">开仓</el-button>
        </el-col>
      </el-col> -->
  <!-- <el-col
        :offset="1"
        :xs="24"
        :sm="10"
        style="
          background: rgb(249, 249, 251);
          padding-left: 20px;
          padding-right: 20px;
          padding-top: 10px;
          padding-bottom: 10px;
          border-radius: 8px;
        "
      >
        <el-row>
          <el-col :xs="24">
            <span style="float: left">价格</span>
            <span style="float: right">数量</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(238, 80, 47); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(238, 80, 47); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(238, 80, 47); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(238, 80, 47); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(238, 80, 47); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <el-row>
              <el-col style="float: left" :xs="24">
                <span style="float: left">0</span>
              </el-col>
              <el-col :xs="24">
                <span style="float: left">≈ $0</span>
              </el-col>
            </el-row>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(49, 173, 93); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(49, 173, 93); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(49, 173, 93); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(49, 173, 93); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
          <el-col :xs="24">
            <span style="color: rgb(49, 173, 93); float: left">0</span>
            <span style="float: right">0</span>
          </el-col>
        </el-row> -->
  <!-- </el-col>
    </el-row>
  </div> -->
</template>
<script>
export default {
  name: "transaction",
  data() {
    return {
      price: 250,
      value1: 0,
      value2: 0,
      sum_input: 0,
    };
  },
  components: {},
  computed: {},
  methods: {},
};
</script>
<style scoped>
.di {
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  height: 400px;
  margin: 8px;
  padding-left: 19px;
  padding-right: 19px;
}
.btn0 {
  float: left;
  width: 64px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(90deg, #3457fd, #3fa2fc);

  font-size: 14px;
  font-family: DINPro;
  font-weight: 500;
  color: #ffffff;
  border-radius: 16px;
}
.font0 {
  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 800;
  color: #b2b6d7;

  white-space: nowrap;
}
.font1 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #21274b;
}
.input0 {
  width: 200px;
  margin: 0px 10px;
  background-color: #fff0;
  height: 80%;
  border-width: 0px;
}
.di2 {
  width: 282px;
  height: 40px;
  background: #edeef4;
  border-radius: 20px;
}
.btn1 {
  width: 92px;
  height: 40px;
  background: linear-gradient(
    0deg,
    rgba(33, 215, 151, 0.2),
    rgba(33, 215, 151, 0)
  );
  border: 2px solid #21d797;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 800;
  color: #21d797;
  line-height: 32px;
  float: left;
}
.btn2 {
  width: 92px;
  height: 40px;
  background: linear-gradient(
    0deg,
    rgba(235, 52, 99, 0.2),
    rgba(235, 52, 99, 0)
  );
  border: 2px solid #eb3463;
  border-radius: 20px;

  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 800;
  color: #eb3463;
  line-height: 32px;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>