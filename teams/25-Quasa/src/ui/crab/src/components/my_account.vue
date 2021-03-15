//仓位状态
<template>
  <div class="di">
    <div class="font0">仓位状态</div>
    <div style="height: 1px; width: 100%; background: #454354"></div>
    <div>
      <span class="font1">账户可用余额</span>
      <span class="font2">1000 USDT</span>
    </div>
    <div>
      <span class="font1">当前总持仓额</span>
      <span class="font2">0 USDT</span>
    </div>
    <div>
      <span class="font1">当前总保证金</span>
      <span class="font2">0 USDT</span>
    </div>
    <div>
      <span class="font1">持仓未实现盈亏</span>
      <span class="font2">0 USDT</span>
    </div>
  </div>

  <!-- <el-row class="di">
    <el-col :xs="6" :sm="12">
      <span style="color: #828bba">仓位状态</span>
    </el-col>
    <el-col :xs="6" :sm="12">
      <span style="color: #3a7ffc">我的账户</span>
    </el-col>
    <el-col :xs="6" :sm="12"></el-col>
    <el-row :xs="24" :sm="12">
      <el-col
        :xs="6"
        :sm="12"
        style="padding-left: 29px; color: #828bba; text-align: left"
        ><span>账户可用余额</span></el-col
      >
      <el-col :xs="6" :sm="12"></el-col>
      <el-col :xs="6" :sm="12"></el-col>
      <el-col
        :xs="6"
        :sm="12"
        style="padding-right: 29px; color: #302f74; text-align: right"
        ><span>0 USDT</span></el-col
      >
    </el-row>
    <el-row :xs="24" :sm="12">
      <el-col
        :xs="6"
        :sm="12"
        style="padding-left: 29px; color: #828bba; text-align: left"
        ><span>当前总持仓额</span></el-col
      >
      <el-col :xs="6" :sm="12"></el-col>
      <el-col :xs="6" :sm="12"></el-col>
      <el-col
        :xs="6"
        :sm="12"
        style="padding-right: 29px; color: #302f74; text-align: right"
        ><span>0 USDT</span></el-col
      >
    </el-row>
    <el-row :xs="24" :sm="12">
      <el-col
        :xs="6"
        :sm="12"
        style="padding-left: 29px; color: #828bba; text-align: left"
        ><span>当前总保证金</span></el-col
      >
      <el-col :xs="6" :sm="12"></el-col>
      <el-col :xs="6" :sm="12"></el-col>
      <el-col
        :xs="6"
        :sm="12"
        style="padding-right: 29px; color: #302f74; text-align: right"
        ><span>0 USDT</span></el-col
      >
    </el-row>
    <el-row :xs="24" :sm="12">
      <el-col
        :xs="6"
        :sm="12"
        style="padding-left: 29px; color: #828bba; text-align: left"
        ><span>持仓未实现盈亏</span></el-col
      >
      <el-col :xs="6" :sm="12"></el-col>
      <el-col :xs="6" :sm="12"></el-col>
      <el-col
        :xs="6"
        :sm="12"
        style="padding-right: 29px; color: #302f74; text-align: right"
        ><span>0 USDT</span></el-col
      >
    </el-row>
  </el-row> -->
</template>

<script>
export default {
  name: "my_account",
  data() {
    return {};
  },
  methods: {},
  props: {},
};
</script>

<style scoped>
.di {
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  margin: 8px;
}
.font0 {
  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 800;
  color: #21274b;
  line-height: 32px;
  height: 44px;
  padding-left: 19px;
  padding-right: 19px;
  display: flex;
  align-items: center;
}
.font1 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #828bba;
  line-height: 32px;
  display: flex;
  float: left;
  padding-left: 19px;
  padding-right: 19px;
}
.font2 {
  font-size: 12px;
  font-family: DINPro;
  font-weight: 500;
  color: #21274b;
  line-height: 32px;

  display: flex;
  justify-content: flex-end;
  padding-left: 19px;
  padding-right: 19px;
}
/* .di {
  background: rgb(249, 249, 251);
  width: 95%;
  border-radius: 8px;
  margin: 20px auto;
  padding-top: 10px;
  padding-bottom: 10px;
} */
</style>