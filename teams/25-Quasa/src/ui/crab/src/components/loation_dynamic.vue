//仓位动态
<template>
  <div class="di">
    <div class="font0">仓位动态</div>
    <div style="height: 1px; width: 100%; background: #454354"></div>
    <div style="padding-left: 19px; padding-right: 19px">
      <el-row :gutter="24">
        <el-col :span="8" class="font1">价格(USDT)</el-col>
        <el-col :span="8" class="font1">数量(BTC)</el-col>
        <el-col :span="8" class="font1">时间</el-col>
      </el-row>
      <el-row :gutter="24" style="overflow: auto; height: 280px">
        <el-col :span="24" :key="index" v-for="(item, index) in 20">
          <el-col :span="8" class="font2">18,323,32</el-col>
          <el-col :span="8" class="font2">+1.12</el-col>
          <el-col :span="8" class="font2">13:40:48</el-col>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
export default {
  name: "loation_dynamic",
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
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  margin: 8px;
  height: 370px;
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
  justify-content: center;
}
.font2 {
  font-size: 12px;
  font-family: DINPro;
  font-weight: 500;
  color: #21274b;
  line-height: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>