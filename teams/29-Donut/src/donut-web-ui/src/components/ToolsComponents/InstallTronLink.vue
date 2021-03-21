<template>
  <transition name="fade">
    <div class="mask" @click="hideMask">
      <div class="mask-box">
        <p>
          {{ $t("error.needtronlink") }}
        </p>
        <div class="install">
          <b-button variant="primary" @click="install">
            {{ $t("wallet.install") }}
          </b-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "InstallTronLink",
  methods: {
    install() {
      window.open("https://www.tronlink.org", "_blank");
      this.$emit("hideMask");
    },
    hideMask() {
      this.$emit("hideMask");
    },
  },
};
</script>

<style lang="scss" scoped>
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
  p {
    font-size: 20px;
    font-weight: 600;
    border-bottom: 1px solid var(--background);
    padding-bottom: 24px;
  }
}
.install {
  margin-top: 23px;
  display: flex;
  flex-direction: row-reverse;
  background-repeat: no-repeat;
  background-position: 12px 10px;
  background-image: url("../../static/images/tron-link.png");
  background-color: var(--background);
  height: 60px;
  padding: 10px 16px;
  border-radius: 16px;
  .btn-primary{
      padding: 8px 24px;
  }
}
</style>