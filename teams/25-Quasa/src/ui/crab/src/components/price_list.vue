//价格列表
<template>
  <div class="tb">
    <div class="rade-dashboard-currency">
      <el-dropdown>
        <el-button>
          BTC/USDT<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>BTC/USDT</el-dropdown-item>
          <el-dropdown-item>ETH/USDT</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div>
      <div class="font0">当前价格</div>
      <div class="font1">18,974.33</div>
    </div>
    <div>
      <div class="font0">指数价格</div>
      <div class="font1">18,974.13</div>
    </div>
    <div class="trade-dashboard-split"></div>
    <div>
      <div class="font0">持仓挖矿收益率（年化）</div>
      <div class="font3">
        <span class="font2">多：</span>245.34%
        <span class="font4">空：</span>398.23%
      </div>
    </div>
    <div>
      <div class="font0">资金费率 / 倒计时</div>
      <div class="font3">
        0.0034% /
        <el-image
          style="width: 12px; height: 12px"
          :src="require('../assets/img/icon_time.png')"
        >
        </el-image>
        00:56:40
      </div>
    </div>
    <div class="trade-dashboard-split"></div>
    <div>
      <div class="font0">24h涨跌额 / 涨跌幅</div>
      <div class="font3">445.34 / +2.34%</div>
    </div>
    <div>
      <div class="font0">24h最高价 / 最低价</div>
      <div class="font3">18,983.32 / 18,233.34</div>
    </div>
    <div class="trade-dashboard-split"></div>
    <div>
      <div class="font0">24h成交量(BTC) / 成交额(USDT)</div>
      <div class="font3">234.32 / 13,338,233.34</div>
    </div>
  </div>
  <!-- <el-row class="di">
    <el-col :xs="24" :sm="12">
      <el-col :xs="24" :sm="24">
        <el-dropdown>
          <el-button type="primary"
            >BTC/USDT<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>BTC/USDT</el-dropdown-item>
            <el-dropdown-item>BTC/USDT</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :xs="24" :sm="24">
        <span style="color: #302f74">18,974.33</span>
      </el-col>
      <el-col :xs="24" :sm="24">
        <span style="color: #828bba">涨跌幅+2.34%</span>
      </el-col>
    </el-col>
    <el-col :xs="24" :sm="12">
      <el-col :xs="24" :sm="12" class="l_lb">
        <span style="color: #828bba">高</span>
      </el-col>
      <el-col :xs="24" :sm="12" class="r_lb">
        <span style="color: #21d797">0</span>
      </el-col>

      <el-col :xs="24" :sm="12" class="l_lb">
        <span style="color: #828bba">低</span>
      </el-col>
      <el-col :xs="24" :sm="12" class="r_lb">
        <span style="color: #eb3463">0</span>
      </el-col>

      <el-col :xs="24" :sm="12" class="l_lb">
        <span style="color: #828bba">24H涨跌额</span>
      </el-col>
      <el-col :xs="24" :sm="12" class="r_lb">
        <span style="color: #eb3463">0</span>
      </el-col>

      <el-col :xs="24" :sm="12" class="l_lb">
        <span style="color: #828bba">24H成交量(BTC)</span>
      </el-col>
      <el-col :xs="24" :sm="12" class="r_lb">
        <span style="color: #302f74">0</span>
      </el-col>

      <el-col :xs="24" :sm="12" class="l_lb">
        <span style="color: #828bba">24H成交额(USDT)</span>
      </el-col>
      <el-col :xs="24" :sm="12" class="r_lb">
        <span style="color: #302f74">0</span>
      </el-col>
    </el-col>
  </el-row> -->
</template>

<script>
export default {
  name: "price_list",
  data() {
    return {};
  },
  methods: {},
  props: {},
};
</script>

<style scoped>
.tb {
  height: 80px;
  margin: 8px;
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 8px;
  padding-right: 8px;
}
button.el-button.el-button--default {
  background: #edeef4;
}
.float_left {
  float: left;
}
.trade-dashboard-currency {
  min-width: 180px;
}
.trade-dashboard-split {
  height: 52px;
  width: 1px;
  background: #454354;
}
.font0 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #828bba;
  line-height: 32px;
}
.font1 {
  font-size: 24px;
  font-family: DINPro;
  font-weight: 500;
  color: #302f74;
  line-height: 32px;
}
.font2 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #21d797;
  line-height: 32px;
}
.font3 {
  font-size: 14px;
  font-family: DINPro;
  font-weight: 500;
  color: #302f74;
  line-height: 32px;
}
.font4 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #eb3463;
  line-height: 32px;
}
/* .di {
  background: rgb(249, 249, 251);
  width: 95%;
  border-radius: 8px;
  margin: 20px auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
.l_lb {
  text-align: right;
  padding-right: 20px;
}
.r_lb {
  text-align: left;
  padding-left: 20px;
} */
</style>