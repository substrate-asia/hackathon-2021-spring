<template>
  <div id="app">
    <Donut/>
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import TipMessage from "./components/ToolsComponents/TipMessage";
import Donut from "./components/Donut"

export default {
  data() {
    return {
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
    };
  },
  components: {
    TipMessage,
    Donut
  },
  async mounted() {
  },
};
</script>

<style lang="scss">
$blue: #ffdb1b;
:root {
  --yellow-background: #f5ecd8;
  --primary: #ffdb1b;
  --primary-text: #242629;
  --secondary-text: #717376;
  --disable: #bdbfc2;
  --dividers: #e3e5e8;
  --background: #f6f7f9;
  --error: #ff5040;
  --success: #50bf00;
  --link: #408fff;
  --warning: #ff9500;
  --backgroud-state: #b37012;
}

@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";
html,
body {
  height: 100%;
  margin: 0;
}
#app {
  font-family: PingFangSC-Medium, PingFang SC, -apple-system, BlinkMacSystemFont,
    "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--primary-text);
  height: 100%;
  min-height: 700px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  justify-items: center;
  background-color: var(--background);
}
h3 {
  margin-top: 56px;
  text-align: left;
  display: block;
  width: 100%;
  height: 36px;
  font-size: 36px;
  font-weight: 500;
  line-height: 36px;
}
.spinner-grow {
  margin-bottom: 2px;
  margin-right: 8px;
}
input {
  border: none;
  outline: none;
}
input::-webkit-input-placeholder {
  color: var(--disable);
}
.mask {
  z-index: 2000;
  overflow: hidden;
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.btn-primary {
  font-size: 16px;
  border-radius: 16px !important;
  box-shadow: 0px 8px 12px -4px #ffec88;
  border: 0px !important;
  padding: 12px 24px;
  font-weight: 600;
  color: var(--primary-text) !important;
}

.btn-primary:hover {
  background: #ffeb75 !important;
}

.logo {
  margin-bottom: 30px;
}
</style>
