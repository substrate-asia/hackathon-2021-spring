<template>
  <div>
    <div style="display: flex">
      <top />
    </div>
    <div class="home-header-desc">
      <span class="logo">CRAB</span>
      <span>CRAB是一个彻底革新现有交易模式的去中心化</span>
      <span>衍生品交易协议，让交易者、LP和套利者都可以拥有</span>
      <span>更公平、更安全、收益更高的交易环境</span>
    </div>
    <el-image
      :src="require('../assets/img/banner_bg.png')"
      class="logo"
    ></el-image>
  </div>
</template>
<script>
import top from "../components/top.vue";
export default {
  name: "home",
  components: {
    top,
  },
  created() {
    this.$store.commit("setState", {
      menu: "0",
    });
  },
  methods: {},
};
</script>
<style scoped>
.logo {
  font-size: 50px;
  display: flex;
  justify-content: center;
  float: none;
}
.home-header-desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 32px;
  letter-spacing: 0;
  text-align: center;
  line-height: 48px;
  margin-bottom: 60px;
  margin-top: 100px;
}
</style>