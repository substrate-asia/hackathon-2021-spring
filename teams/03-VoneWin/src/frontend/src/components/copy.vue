<!--
 * @Description:复制组件
 * @Author: 龙春雨
 * @Date: 2020-08-07 15:57:41
-->
<template>
  <el-tooltip class="item"
              effect="dark"
              v-if="text"
              :content="tips"
              placement="top">
    <i @click="copyLink"
       class="el-icon-document-copy copy-btn"></i>
  </el-tooltip>
</template>

<script>
import Clipboard from 'clipboard';
export default {
  name: 'copy',
  data() {
    return {};
  },
  props: {
    // 要复制的内容
    text: {
      type: String
    },
    // 提示语句
    tips: {
      type: String,
      default: () => {
        return '直接复制';
      }
    }
  },
  methods: {
    copyLink() {
      let _this = this;
      let clipboard = new Clipboard('.copy-btn', {
        text: function() {
          return _this.text;
        }
      });
      clipboard.on('success', () => {
        this.$message({
          message: '复制成功',
          showClose: true,
          type: 'success'
        });
        // 释放内存
        clipboard.destroy();
      });
      clipboard.on('error', () => {
        this.$message({ message: '复制失败,', showClose: true, type: 'error' });
        clipboard.destroy();
      });
      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
.copy-btn {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: $primaryColor;
  }
}
</style>