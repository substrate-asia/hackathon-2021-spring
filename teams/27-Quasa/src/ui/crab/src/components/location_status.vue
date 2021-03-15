//仓位状态
<template>
  <div class="di">
    <div class="font0">仓位状态</div>
    <div style="height: 1px; width: 100%; background: #454354"></div>
    <div>
      <span class="font1">总持仓额(USDT)</span>
      <span class="font2">342,340.34 USDT</span>
    </div>
    <div>
      <span class="font1">裸头寸额(USDT)</span>
      <span class="font2">2,340.34 USDT</span>
    </div>
    <div>
      <span class="font1">流动资金池(USDT)</span>
      <span class="font2">342,340.34 USDT</span>
    </div>
    <div style="display: flex; justify-content: center; align-items: center">
      <span class="font3">多</span>
      <div class="progress">
        <div class="progress_L" :style="'width:' + progress_num + '%'">
          <span class="font5">{{ progress_num }}%</span>
        </div>
        <div class="pool-percent-split"></div>
        <div class="progress_R" :style="'width:' + (100 - progress_num) + '%'">
          <span class="font6">{{ 100 - progress_num }}%</span>
        </div>
      </div>
      <div class="font4">空</div>
    </div>
    <div>
      <div class="font3">1,242,47,32</div>
      <div class="font4">1,242,47,32</div>
    </div>
  </div>
  <!-- <el-row class="di">
    <el-col :xs="6" :sm="12">
      <span style="color: #3a7ffc">仓位状态</span>
    </el-col>
    <el-col :xs="6" :sm="12">
      <span style="color: #828bba">我的账户</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb1">
      <span>总持仓额(USDT)</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb2">
      <span>0 USDT</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb1">
      <span>裸头寸额(USDT)</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb2">
      <span>0 USDT</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb1">
      <span>流动资金池(USDT)</span>
    </el-col>
    <el-col :xs="24" :sm="12" class="list_lb2">
      <span>0 USDT</span>
    </el-col>
    <el-col :xs="24" :sm="4" style="color: #21d797">
      <span>多</span>
    </el-col>
    <el-col :xs="24" :sm="16">
      <el-progress
        :text-inside="true"
        :stroke-width="26"
        :percentage="50"
      ></el-progress>
    </el-col>
    <el-col :xs="24" :sm="4" style="color: #eb3463">
      <span>空</span>
    </el-col>
    <el-col :xs="24" :sm="4"> </el-col>
    <el-col :xs="24" :sm="8" style="font-size: 28px; color: #21d797">
      <span>0</span>
    </el-col>
    <el-col
      :xs="24"
      :sm="12"
      style="font-size: 28px; text-align: right; color: #eb3463"
    >
      <span>0</span>
    </el-col> 
  </el-row>-->
</template>
<script>
export default {
  name: "location_status",
  components: {},
  data() {
    return {
      progress_num: 50,
    };
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
.font3 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #21d797;
  line-height: 32px;
  float: left;
  padding-left: 19px;
  /* padding-right: 19px; */
}
.font4 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #eb3463;
  line-height: 32px;
  display: flex;
  justify-content: flex-end;
  /* padding-left: 19px; */
  padding-right: 19px;
}
.font5 {
  font-size: 14px;
  font-family: DINPro;
  font-weight: 500;
  color: #ffffff;
  padding-left: 9px;
}
.font6 {
  font-size: 14px;
  font-family: DINPro;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  justify-content: flex-end;
  padding-right: 9px;
}
.progress {
  display: flex;
  float: left;
  width: 98%;
  height: 20px;
  border-radius: 4px;
  padding-left: 9px;
  padding-right: 9px;
}
.progress_L {
  background: #21d797;
  border-radius: 10px 0px 0px 10px;
}
.progress_R {
  background: #eb3463;
  border-radius: 0px 10px 10px 0px;
}

/* .di {
  background: rgb(249, 249, 251);
  width: 95%;
  border-radius: 8px;
  margin: 20px auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
.list_lb1 {
  padding-left: 29px;
  color: #828bba;
  text-align: left;
}
.list_lb2 {
  padding-right: 29px;
  color: #302f74;
  text-align: right; 
}*/
</style>