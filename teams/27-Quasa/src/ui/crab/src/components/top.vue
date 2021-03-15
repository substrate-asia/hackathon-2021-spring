//导航
<template>
  <div class="top_di">
    <div style="display: flex; align-items: center; float: left">
      <el-image
        width:212px
        height:36px
        :src="require('../assets/img/logo.png')"
        class="logo"
      >
      </el-image>

      <el-menu
        :default-active="$store.state.menu"
        mode="horizontal"
        @select="on_btn"
        text-color="#95A6FF"
        active-text-color="#FFFFFF"
        background-color="rgb(48, 47, 116)"
      >
        <el-menu-item index="0">首页</el-menu-item>
        <el-menu-item index="1">交易</el-menu-item>
        <el-menu-item index="2">经纪商</el-menu-item>
        <el-menu-item index="3">收益</el-menu-item>
        <el-menu-item index="4">更多</el-menu-item>
      </el-menu>
    </div>
    <div
      style="
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 100%;
      "
    >
      <el-select
        v-model="language"
        placeholder="中文"
        style="width: 100px; margin-right: 13px"
      >
        <el-option label="中文" value="cn"> </el-option>
        <el-option label="English" value="en"> </el-option>
      </el-select>
      <el-button class="btn0">连接钱包</el-button>
    </div>
    <!-- <el-row class="top_di">
      <el-col :xs="12" :sm="12">
        <el-image
          style="float: left; margin-top: 10px; margin-left: 20px"
          :src="require('../assets/img/logo.png')"
          fit="cover"
        ></el-image>
      </el-col>
      <el-col :xs="12" :sm="12">
        <el-image
          v-on:click="on_menu()"
          style="float: right; margin-right: 20px; margin-top: 20px"
          :src="require('../assets/img/menu.png')"
          fit="cover"
        ></el-image>
      </el-col>
    </el-row>

    <el-row
      v-show="show_top_nv"
      style="
        position: absolute;
        left: 85%;
        top: 6%;
        width: 140px;
        text-align: center;
        background: rgb(255, 255, 255);
        box-shadow: rgba(48, 47, 116, 0.3) 0px 6px 16px 0px;
        border-radius: 3px;
        z-index: 100;
      "
    >
      <el-col :xs="24">
        <router-link to="home">
          <span style="height: 20px; width: 100px">首页</span>
        </router-link>
      </el-col>
      <el-col :xs="24">
        <router-link to="transaction">
          <span style="height: 20px; width: 100px">交易</span>
        </router-link>
      </el-col>
      <el-col :xs="24">
        <span style="height: 20px; width: 100px">经纪商</span>
      </el-col>
      <el-col :xs="24">
        <span style="height: 20px; width: 100px">收益</span>
      </el-col>
      <el-col :xs="24">
        <span style="height: 20px; width: 100px">白皮书</span>
      </el-col>
      <el-col :xs="24">
        <span style="height: 20px; width: 100px">帮助</span>
      </el-col>
      <el-col :xs="24">
        <el-divider></el-divider>
      </el-col>
      <el-col :xs="24">
        <el-image
          style="float: left"
          :src="require('../assets/img/icon_telegram_phone.png')"
          fit="cover"
        ></el-image>
        <span style="height: 20px; width: 100px">Telegram</span>
      </el-col>
      <el-col :xs="24">
        <el-image
          style="float: left"
          :src="require('../assets/img/icon_discord_phone.png')"
          fit="cover"
        ></el-image>
        <span style="height: 20px; width: 100px">Discord</span>
      </el-col>
      <el-col :xs="24">
        <el-divider></el-divider>
      </el-col>
      <el-col :xs="24">
        <el-image
          style="float: left"
          :src="require('../assets/img/language_english.png')"
          fit="cover"
        ></el-image>
        <span style="height: 20px; width: 100px">English</span>
      </el-col>
      <el-col :xs="24">
        <el-image
          style="float: left"
          :src="require('../assets/img/language_chinese.png')"
          fit="cover"
        ></el-image>
        <span style="height: 20px; width: 100px">简体中文</span>
      </el-col>
      <el-col :xs="24">
        <el-divider></el-divider>
      </el-col>
      <el-col :xs="24">
        <el-button type="primary" round>连接钱包</el-button>
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
export default {
  name: "top",
  components: {},
  data() {
    return {
      show_top_nv: false,
      activeIndex: "0",
      language: "cn",
    };
  },
  methods: {
    on_menu() {
      this.show_top_nv = !this.show_top_nv;
    },
    on_btn(key) {
      console.log(key);
      if (this.$store.state.menu == key) {
        return;
      }
      if (key == "0") {
        this.$router.push({ name: "home" });
      } else if (key == "1") {
        this.$router.push({ name: "deal" });
      } else if (key == "2") {
        this.$router.push({ name: "broker" });
      } else {
        return this.$message("敬请期待");
      }
      this.$store.commit("setState", {
        menu: key,
      });
    },
  },
};
</script>

<style scoped>
/* .el-divider--horizontal {
  margin: 10px 0;
} */
.top_di {
  background-color: rgb(48, 47, 116);
  width: 100%;
  height: 60px;
}
.logo {
  padding-left: 19px;
  padding-right: 115px;
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
.btn1 {
}
</style>