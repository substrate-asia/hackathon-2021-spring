//交易记录列表
<template>
  <el-row>
    <el-col :xs="24" :sm="24" class="list_lb">
      <span>BTC / USDT</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>交易类型</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>成交价格</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>成交数量</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>开仓</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>0BTC</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>成交金额</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>手续费</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>已实现盈亏</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>0</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>--</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb1">
      <span>分摊补偿</span>
    </el-col>
    <el-col :xs="24" :sm="16" class="list_lb1">
      <span>成交时间</span>
    </el-col>
    <el-col :xs="24" :sm="8" class="list_lb2">
      <span>{{ itemC.compensation }}</span>
    </el-col>
    <el-col :xs="24" :sm="16" class="list_lb2">
      <span>{{ itemC.time }}</span>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "deal_record_list",
  data() {
    return {};
  },
  methods: {},
  props: {
    itemC: {
      type: Object,
      default() {
        return {};
      },
    },
    index: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
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
</style>