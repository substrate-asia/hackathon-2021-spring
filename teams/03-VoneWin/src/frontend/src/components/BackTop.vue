<!--
 * @Description:
 * @Author: 龙春雨
 * @Date: 2019-12-04 16:23:09
-->
<template>
  <!-- 封装返回顶部组件 -->
  <div class="back"
       @click="top">
    <div class="back_top">

    </div>
  </div>
</template>

<script>
export default {
  name: 'backTop',
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {},
    top() {
      this.$emit('click');
    }
  }
};
</script>
<style lang="scss">
.back {
  position: fixed;
  bottom: 20%;
  right: 3.125rem;
  width: 44px;
  height: 44px;
  border-radius: 100%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0px 2px 16px 0px rgba(74, 118, 254, 0.38);
  z-index: 12;
  transition: all 0.3s ease;
  .back_top {
    width: 14px;
    margin: 17px auto 0 auto;
    &:before {
      content: '';
      width: 100%;
      height: 2px;
      background-color: $primaryColor;
      display: block;
      border-radius: 2px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    &:after {
      content: '';
      height: 8px;
      width: 8px;
      border-width: 2px 0 0 2px;
      border-color: $primaryColor;
      border-style: solid;
      transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
      display: block;
      margin: 0 auto;
      margin-top: 3px;
      transition: all 0.3s ease;
    }
  }
  &:hover {
    background-color: $primaryColor;
    .back_top {
      &:before {
        background-color: white;
      }
      &:after {
        border-color: white;
      }
    }
  }
}
</style>
