//我的持仓
<template>
  <div class="di">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="我的持仓" name="0" style="width: 100%">
        <div style="height: 36px; background: #edeef4">
          <div class="font0">合约</div>
          <div class="font0">开仓均价</div>
          <div class="font0">当前价格</div>
          <div class="font0">持仓量</div>
          <div class="font0">持仓额</div>
          <div class="font0">累计资金费</div>
          <div class="font0">未实现盈亏</div>
          <div class="font0">占用保证金</div>
          <div class="font0">保证金率</div>
          <div class="font0">预估强平价</div>
          <div class="font0">持仓挖矿收益</div>
          <div class="font0">操作</div>
        </div>

        <div style="height: 44px; display: flex; align-items: center">
          <div class="font0">BTC / USDT</div>
          <div class="font0">18,638.32</div>
          <div class="font0">18,938.32</div>
          <div class="font0">1.23 BTC</div>
          <div class="font0">23,445.34</div>
          <div class="font0">2.34</div>
          <div class="font0">2,232.34</div>
          <div class="font0">2,562.48</div>
          <div class="font0">14.78%</div>
          <div class="font0">16,338.45</div>
          <div class="font0">2.234826 USDT</div>
          <div class="font0">
            <div><el-button class="btn0"> 平仓 </el-button></div>
            <div><el-button class="btn0"> 增加保证金 </el-button></div>
            <div><el-button class="btn0"> 提取保证金 </el-button></div>
          </div>
        </div>
        <!-- <my_location_list
          v-for="(item, index) in people"
          :key="index"
          :index="index"
          :itemC="item"
          @deleteIndex="del"
        ></my_location_list> -->
      </el-tab-pane>
      <el-tab-pane label="成交记录" name="1" style="width: 100%">
        <div class="font1">
          合约：
          <el-dropdown>
            <el-button type="primary"
              >全部<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>全部</el-dropdown-item>
              <el-dropdown-item>全部</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="font1">
          类型：
          <el-dropdown>
            <el-button type="primary"
              >全部<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>全部</el-dropdown-item>
              <el-dropdown-item>全部</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="font1">
          方向：
          <el-dropdown>
            <el-button type="primary"
              >全部<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>全部</el-dropdown-item>
              <el-dropdown-item>全部</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="font1" style="float: none">
          时间：
          <el-dropdown>
            <el-button type="primary"
              >全部<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>全部</el-dropdown-item>
              <el-dropdown-item>全部</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <div style="height: 36px; background: #edeef4; margin-top: 10px">
          <div class="font0">合约</div>
          <div class="font0">交易类型</div>
          <div class="font0">成交价格</div>
          <div class="font0">成交数量</div>
          <div class="font0">成交金额</div>
          <div class="font0">手续费</div>
          <div class="font0">已实现盈亏</div>
          <div class="font0">分摊补偿</div>
          <div class="font0">成交时间</div>
        </div>

        <div style="height: 44px; display: flex; align-items: center">
          <div class="font0">BTC / USDT</div>
          <div class="font0">开仓</div>
          <div class="font0">18,938.32</div>
          <div class="font0">1.23 BTC</div>
          <div class="font0">23,445.34</div>
          <div class="font0">14.34</div>
          <div class="font0">--</div>
          <div class="font0">--</div>
          <div class="font0">2020/11/23 12:26:40</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  <!-- <el-row class="di">
    <el-col :xs="6" :sm="12">
      <span style="color: #3a7ffc">我的持仓</span>
    </el-col>
    <el-col :xs="6" :sm="12">
      <span style="color: #828bba">成交记录</span>
    </el-col>

    <button @click="add()">添加</button>
    <button @click="del()">删除</button>
    <button @click="clean()">清空</button>
    <my_location_list
      v-for="(item, index) in people"
      :key="index"
      :index="index"
      :itemC="item"
      @deleteIndex="del"
    ></my_location_list>
  </el-row> -->
</template>
<script>
import my_location_list from "./my_location_list.vue";
export default {
  name: "my_location",
  components: { my_location_list },
  data() {
    return {
      activeName: "0",
      people: [
        {
          name: "",
          phone: "",
          sex: "",
          compensation: "--",
          time: "2020/11/23 12:26:40",
        },
      ],
    };
  },
  methods: {
    handleClick() {},
    add() {
      this.people.push({
        name: "",
        phone: "",
        sex: "",
        compensation: "--",
        time: "2020/11/23 12:26:40",
      });
    },
    del(val) {
      if (val !== 0) {
        this.people.splice(val, 1);
      }
    },
    clean() {
      this.people = [];
    },
  },
  props: {},
};
</script>
<style scoped>
/* .di {
  background: rgb(249, 249, 251);
  width: 95%;
  border-radius: 8px;
  margin: 20px auto;
  padding-top: 10px;
  padding-bottom: 10px;
} */
.di {
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  margin: 20px 8px 8px;
  padding-left: 10px;
  padding-right: 10px;
  min-height: 100px;
}
.font0 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #828bba;
  line-height: 32px;
  float: left;
  min-width: 90px;
  display: flex;
  justify-content: center;
}
.font1 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #828bba;
  line-height: 32px;
  float: left;
  min-width: 90px;
  padding-left: 30px;
  padding-right: 30px;
}
.btn0 {
  background: linear-gradient(90deg, #3457fd, #3fa2fc);
  border-radius: 12px;
  height: 24px;

  font-size: 12px;
  font-family: PingFang SC;
  font-weight: bold;
  color: #ffffff;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>