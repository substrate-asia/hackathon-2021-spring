<template>
  <transition name="fade">
    <div class="mask" @click="hideMask">
      <div class="mask-box">
        <div class="mask-info" :style="iconStyle">
          <p class="title" v-if="title && title.trim().length > 0">{{ title }}</p>
          <p class="mask-info-text">
            {{ showMessage }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  methods: {
    hideMask () {
      if (!this.canDiss) {
        return
      }
      this.$emit('hideMask')
    }
  },
  computed: {
    iconStyle() {
      const url = require('../../static/images/'+ this.type +'.svg')
      return "background-image: url('"+ url +"');"
    }
  },
  props: {
    title: {
      type: String
    },
    showMessage: {
      type: String,
      default: 'error'
    },
    canDiss: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: "error", // tip error message
    }
  }
}
</script>

<style lang="less" scoped>

.mask-box {
  position: relative;
  width: 420px;
  background: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 3px 30px, rgba(0, 0, 0, 0.04) 0px 4px 8px,
    rgba(0, 0, 0, 0.04) 3px 16px 24px, rgba(0, 0, 0, 0.01) 3px 24px 32px;
  border-radius: 28px;
  padding: 24px 36px;
  display: block;
  z-index: 100;
  box-sizing: border-box;
  margin-top: -50vh;
}

.mask-info {
  align-content: center;
  padding-left: 40px;
  background-repeat: no-repeat;
  background-position: top left;
  // background-image: url('../../static/images/error.svg');
  p {
    width: 100%;
    word-wrap: break-word;
    margin-bottom: 0;
  }
}

.mask-info-text {
  text-align: left;
  color: var(--secondary-text);
  margin-top: 16px;
  line-height:16px;
  font-size:16px;
}

.title{
  font-size: 20px;
  line-height: 24px;
  color: var(--primary-text);
  text-align: left;
}
</style>
