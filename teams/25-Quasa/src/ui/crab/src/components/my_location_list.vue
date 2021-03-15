<template>
  <el-row class="di">
    <el-col :xs="24" :sm="12" class="list_lb">
      <span>多 BTC / USDT</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb3">
      <el-dropdown>
        <el-button type="primary"
          >操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>平仓</el-dropdown-item>
          <el-dropdown-item>增加保证金</el-dropdown-item>
          <el-dropdown-item>提取保证金</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>开仓均价</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>当前价格</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>持仓量</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>持仓额</span>
    </el-col>

    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>

    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>累计资金费</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>未实现盈亏</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>占用保证金</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>保证金率</span>
    </el-col>

    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb1">
      <span>预估强平价</span>
    </el-col>
    <el-col :xs="24" :sm="18" class="list_lb1">
      <span>持仓挖矿收益</span>
    </el-col>
    <el-col :xs="24" :sm="6" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="18" class="list_lb2">
      <span>0</span>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "my_location_list",
  components: {},
  data() {
    return {};
  },
  methods: {},
  props: {},
};
</script>
<style scoped>
.di {
  background: rgb(249, 249, 251);
  /* width: 98%; */
  border-radius: 8px;
  margin: 20px auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
.list_lb {
  padding-left: 29px;
  color: #302f74;
  text-align: left;
}
.list_lb1 {
  padding-left: 29px;
  color: #828bba;
  text-align: left;
}
.list_lb2 {
  padding-left: 29px;
  color: #302f74;
  text-align: left;
}
.list_lb3 {
  padding-left: 29px;
  color: #302f74;
  text-align: right;
}
</style>