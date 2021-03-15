<template>
  <transition name="fade">
    <div class="mask" @click.self="hideMask">
      <div class="login">
        <p>{{ this.$t("message.userlogin") }}</p>
        <div class="account-box">
          <span class="keychain" @click="getKeychain"/>
          <b-input
            class="mb-2 mr-sm-2 mb-sm-0 input"
            :placeholder="$t('message.steemAccoutPlaceHolder')"
            v-model="steemAccount"
          ></b-input>
        </div>
        <b-button variant="primary" class="login-btn" @click="login" :disabled="isLoging">
          <b-spinner
            small
            type="grow"
            v-show="isLoging"
          ></b-spinner>
          {{ this.loginBtnText }}
        </b-button>
      </div>
      <TipMessage
        :showMessage="tipMessage"
        :title="tipTitle"
        v-if="showMessage"
        @hideMask="showMessage = false"
        :canDiss="canDismissTip"
      />
    </div>
  </transition>
</template>

<script>
import TipMessage from "./ToolsComponents/TipMessage";

export default {
  name: "Login",
  data() {
    return {
      loginBtnText: "",
      isLoging: false,
      steemAccount: "",
      tipTitle: "",
      tipMessage: "",
      showMessage: false,
      canDismissTip: true,
    };
  },
  components: {
    TipMessage,
  },
  methods: {
    getKeychain() {
      window.open('https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm','_blank')
    },
    login() {
      if (this.steemAccount.length === 0){
        return;
      }
      const message = `nutbox_login-${Math.floor(
        100000000 + Math.random() * 900000000
      )}`;
      this.isLoging = true;
      const that = this;
      steem_keychain.requestSignBuffer(
        this.steemAccount,
        message,
        "Active",
        async function (res) {
          if (res.success === true) {
            const ress = await that.$store.dispatch(
              "initializeSteemAccount",
              res.data.username
            );
            if (!ress) {
              that.tipTitle = that.$t("error.error");
              that.tipMessage = that.$t("error.steemLoginFail");
              that.showMessage = true;
              that.isLoging = false;
              return;
            }
            that.$emit("hideMask");
          } else {
            if (res.error === "user_cancel") {
              that.tipTitle = that.$t("error.error");
              that.tipMessage = that.$t("error.unlockKeychain");
              that.showMessage = true;
            } else {
              that.tipTitle = that.$t("error.error");
              that.tipMessage = that.$t("error.steemLoginFail");
              that.showMessage = true;
            }
          }
          that.isLoging = false;
        }
      );
    },
    hideMask() {
      if (this.isLoging) return;
      this.$emit("hideMask");
    },
  },
  async mounted() {
    this.loginBtnText = this.$t("message.login");
  },
};
</script>

<style lang="less" scoped>
.login {
  margin-top: -15%;
  width: 492px;
  height: 252px;
  background: white;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.05);
  border-radius: 28px;
  padding: 24px;
  p{
  font-size: 20px;
  }
}
.account-box {
  display: flex;
  margin-top: 40px;
.keychain{
  width: 180px;
  height: 48px;
  background-color: var(--background);
  margin-right: 2px;
  border-radius:16px 0 0 16px;
  background-image: url('../static/images/keychain.png');
  background-repeat: no-repeat;
  background-position: center;
}
.keychain:hover {
  background-color:var(--dividers);
  cursor: pointer;
}
.input {
  height: 48px;
  flex: 1;
  background: var(--background);
  border-radius: 0 16px 16px 0;
  border: none;
}
}
.login-btn{
  width: 100%;margin-top: 24px;
}
</style>
