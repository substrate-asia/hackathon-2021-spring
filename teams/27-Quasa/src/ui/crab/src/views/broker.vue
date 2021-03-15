//经纪商
<template>
  <div style="min-width: 1660px">
    <top />
    <div class="tab0">
      <div class="tab0_text">
        <div class="font0">经纪商信息</div>
      </div>
      <div class="xian"></div>
      <div
        class="tab1"
        style="
          margin-left: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
          margin-right: 8px;
        "
      >
        <div style="float: left">
          <div class="font1" style="padding-top: 40px">
            所有用户都可以成为平台的经纪商参与平台的推广并共同瓜分平台的手续费。
          </div>
          <div class="font1">
            团队业绩越好、持有CRAB平台币越多，能瓜分的手续费就越多。
          </div>
        </div>
        <div
          style="
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <div class="btn0">点击查看</div>
        </div>
      </div>

      <div class="tab2" style="margin: 8px">
        <div class="font2">团队地址数</div>
        <div class="font3">2,344</div>
      </div>
      <div class="tab2" style="margin-right: 8px; margin-top: 8px">
        <div class="font2">团队业绩贡献值(USDT)</div>
        <div class="font3">112,344</div>
      </div>
      <div
        class="tab3"
        style="
          margin-left: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
          margin-right: 8px;
        "
      >
        <div
          style="width: 100%; display: flex; align-items: center; height: 44px"
        >
          <el-image
            style="padding-left: 20px; padding-right: 13px"
            :src="require('../assets/img/icon_qrcode.png')"
          ></el-image>
          <span class="font4">我的推广二维码</span>
        </div>
        <div class="xian"></div>
        <div
          style="
            height: 204px;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <el-image :src="require('../assets/img/ewm.png')"></el-image>
        </div>
      </div>

      <div class="tab3" style="margin-top: 8px; margin-right: 8px">
        <div
          style="width: 100%; display: flex; align-items: center; height: 44px"
        >
          <el-image
            style="padding-left: 20px; padding-right: 13px"
            :src="require('../assets/img/icon_link.png')"
          ></el-image>
          <span class="font4">我的推广链接</span>
        </div>
        <div class="xian"></div>
        <div
          style="
            padding-bottom: 45px;
            padding-top: 59px;
            display: flex;
            justify-content: center;
          "
        >
          <span class="font5">http://XXXXXXXXXXXXX.com</span>
        </div>
        <div style="display: flex; justify-content: center">
          <div class="btn1">复制</div>
        </div>
      </div>

      <div
        class="tab2"
        style="margin-left: 8px; margin-right: 8px; margin-top: 8px"
      >
        <div class="font2">奖励权重</div>
        <div class="font3">10%</div>
      </div>

      <div class="tab2" style="margin-right: 8px; margin-top: 8px">
        <div class="font2">手续费瓜分比例</div>
        <div class="font3">0.23%</div>
      </div>

      <div
        class="tab4"
        style="margin-left: 8px; margin-right: 8px; margin-top: 8px"
      >
        <div style="float: left">
          <div class="font2">质押数量(CRAB)</div>
          <div class="font3">100,000.254</div>
        </div>
        <div style="float: right; padding-top: 24px; padding-right: 20px">
          <div class="btn2" style="margin-bottom: 8px">抵押</div>
          <div class="btn2">赎回</div>
        </div>
      </div>
    </div>

    <div class="tab5">
      <div class="tab1_text">
        <div class="font0">经纪商收入排行</div>
      </div>
      <div class="xian"></div>
      <div class="di0">
        <div class="font6" style="float: left; padding-left: 31px">
          经纪商地址
        </div>
        <div class="font6" style="float: right; padding-right: 31px">
          累计收益(USDT)
        </div>
      </div>
    </div>
    <div class="tab6">
      <div class="tab0_text">
        <div class="font0">团队信息</div>
      </div>
      <div class="xian"></div>
    </div>
  </div>
</template>
<script>
import top from "../components/top.vue";
export default {
  name: "broker",
  components: {
    top,
  },
  data() {
    return {};
  },
  created() {
    this.$store.commit("setState", {
      menu: "2",
    });
  },
  methods: {},
};
</script>
<style scoped>
.tab0 {
  width: 68%;
  height: 460px;
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  margin: 8px;
  float: left;
}
.tab1 {
  width: 60%;
  height: 120px;
  background: linear-gradient(90deg, #3457fd, #3fa2fc);
  border-radius: 4px;
  float: left;
}
.tab2 {
  width: 17.5%;
  height: 120px;
  background: #edeef4;
  border-radius: 4px;
  float: left;
}
.tab3 {
  height: 248px;
  width: 29.7%;
  background: #edeef4;
  border-radius: 4px;
  float: left;
}
.tab4 {
  width: 35.6%;
  height: 120px;
  background: #edeef4;
  border-radius: 4px;
  float: left;
}
.tab5 {
  width: 30.5%;
  height: 1004px;
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  margin-top: 8px;
  margin-right: 8px;
  float: right;
}
.tab6 {
  width: 68%;
  height: 536px;
  background: #f9f9fb;
  box-shadow: 0px 3px 6px 0px #cacde1;
  border-radius: 8px;
  margin-left: 8px;
  float: left;
}
.tab0_text {
  width: 90px;
  height: 44px;
  background: linear-gradient(
    0deg,
    rgba(58, 127, 252, 0.2),
    rgba(58, 127, 252, 0)
  );
  box-shadow: 0px 3px 0px 0px #3a7ffc;
  margin-left: 20px;
}
.tab1_text {
  width: 120px;
  height: 44px;
  background: linear-gradient(
    0deg,
    rgba(58, 127, 252, 0.2),
    rgba(58, 127, 252, 0)
  );
  box-shadow: 0px 3px 0px 0px #3a7ffc;
  margin-left: 20px;
}
.font0 {
  width: 100%;
  height: 100%;
  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 800;
  color: #3a7ffc;
  line-height: 44px;
  display: flex;
  justify-content: center;
  align-content: center;
}
.font1 {
  font-size: 14px;
  font-family: PingFang SC;
  font-weight: bold;
  color: #ffffff;

  padding-left: 29px;
}
.font2 {
  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #828bba;
  /* line-height: 32px; */

  padding-left: 30px;
  padding-top: 30px;
}
.font3 {
  font-size: 24px;
  font-family: DINPro;
  font-weight: 500;
  color: #302f74;
  /* line-height: 32px; */

  padding-left: 30px;
  padding-top: 10px;
}
.font4 {
  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 800;
  color: #302f74;
}
.font5 {
  font-size: 16px;
  font-family: DINPro;
  font-weight: 500;
  color: #302f74;
}
.font6 {
  font-size: 12px;
  font-family: PingFang SC;
  font-weight: 400;
  color: #828bba;
  line-height: 32px;
}
.btn0 {
  width: 80px;
  height: 32px;
  border: 1px solid #ffffff;
  border-radius: 16px;

  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 500;
  color: #ffffff;
  line-height: 32px;

  display: flex;
  justify-content: center;
}
.btn1 {
  width: 280px;
  height: 44px;
  background: linear-gradient(90deg, #3457fd, #3fa2fc);
  border-radius: 22px;

  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 500;
  color: #ffffff;

  display: flex;
  justify-content: center;
  align-items: center;
}
.btn2 {
  width: 72px;
  height: 32px;
  background: linear-gradient(90deg, #3457fd, #3fa2fc);
  border-radius: 16px;

  font-size: 14px;
  font-family: PingFang SC;
  font-weight: 500;
  color: #ffffff;

  display: flex;
  justify-content: center;
  align-items: center;
}
.xian {
  height: 1px;
  width: 100%;
  background: #e1e3ee;
}
.di0 {
  width: 100%;
  height: 36px;
  background: #edeef4;
}
</style>