//成交记录
<template>
  <el-row class="di">
    <el-col :xs="6" :sm="12">
      <span style="color: #828bba">我的持仓</span>
    </el-col>
    <el-col :xs="6" :sm="12">
      <span style="color: #3a7ffc">成交记录</span>
    </el-col>
    <el-col :xs="24" :sm="6">
      <el-dropdown>
        <el-button type="primary"
          >全部合约<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>全部合约</el-dropdown-item>
          <el-dropdown-item>全部合约</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
    <el-col :xs="24" :sm="6">
      <el-dropdown>
        <el-button type="primary"
          >全部类型<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>全部类型</el-dropdown-item>
          <el-dropdown-item>全部类型</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
    <el-col :xs="24" :sm="6">
      <el-dropdown>
        <el-button type="primary"
          >全部方向<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>全部方向</el-dropdown-item>
          <el-dropdown-item>全部方向</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
    <el-col :xs="24" :sm="6">
      <el-dropdown>
        <el-button type="primary"
          >全部时间<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>全部时间</el-dropdown-item>
          <el-dropdown-item>全部时间</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>

    <!-- <button @click="add()">添加</button>
    <button @click="del()">删除</button>
    <button @click="clean()">清空</button> -->
    <deal_record_list
      v-for="(item, index) in people"
      :key="index"
      :index="index"
      :itemC="item"
      @deleteIndex="del"
    ></deal_record_list>
  </el-row>
</template>

<script>
import deal_record_list from "./deal_record_list.vue";
export default {
  name: "deal_record",
  components: {
    deal_record_list,
  },
  data() {
    return {
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
.di {
  background: rgb(249, 249, 251);
  width: 95%;
  border-radius: 8px;
  margin: 20px auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>