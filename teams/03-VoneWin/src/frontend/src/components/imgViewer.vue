<!--
 * @Description: 二维码预览
 * @Author: 吴迪
 * @Date: 2020-06-11 16:21:58
-->
<template>
  <div class="img-viewer-container"
       v-if="showImg">
    <img :src="imgUrl"
         v-if="!isVideo">
    <video :src="imgUrl"
           ref="videoObj"
           autoplay
           v-else
           controls="controls">
      您的浏览器不支持 video 标签。
    </video>
    <i class="el-icon-circle-close"
       @click="showImg = false"></i>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imgUrl: '/img/qrcode_wallet.0ca25cd5.png',
      showImg: false,
      isVideo: false,
      play: false
    };
  },
  methods: {
    viewImg(imgUrl, isVideo = false) {
      this.showImg = true;
      this.isVideo = isVideo;
      if (this.isVideo) {
        this.imgUrl = '/img/' + imgUrl;
      } else {
        this.imgUrl = imgUrl;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.img-viewer-container {
  position: fixed;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  img,
  video {
    max-width: 50%;
    max-height: 88%;
  }
  video {
    display: block;
    width: 800px;
  }
  .el-icon-circle-close {
    font-size: 40px;
    position: absolute;
    top: 50px;
    right: 50px;
    color: #fff;
    cursor: pointer;
  }
}
</style>
