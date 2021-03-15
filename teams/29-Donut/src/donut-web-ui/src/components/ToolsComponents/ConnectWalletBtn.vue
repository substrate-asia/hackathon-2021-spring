<template>
  <div class="connect-wallet">
    <b-button
      class="login-btn"
      variant="primary"
      @click="unlock"
      :disabled="isConnecting"
      v-if="
        type == 'STEEM'
          ? !steemAccount || steemAccount.length === 0
          : !tronAddress || tronAddress.length === 0
      "
    >
    <b-spinner small type="grow" v-show="isConnecting"></b-spinner>
      <!-- <b-button variant="primary" @click="unlock"> -->
      {{
        type == "STEEM" ? $t("wallet.connectSteem") : $t("wallet.connectTron")
      }}
    </b-button>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { sleep } from '../../utils/helper'

export default {
  name: "ConnectWalletBtn",
  data() {
    return {
      isConnecting:false
    };
  },
  props: {
    type: {
      type: String,
      default: "STEEM",
    },
  },
  computed: {
    ...mapState(["steemAccount", "tronAddress"]),
  },
  methods: {
    async unlock() {
      if (this.type === "STEEM") {
        this.$emit("steemLogin");
      } else {
        // loading
        this.$emit("tronLogin");
        this.isConnecting = true;
        await sleep(4);
        this.isConnecting= false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.connect-wallet {
  z-index: 999;
}
button {
  margin-top: 24px;
  width: 272px;
  height: 48px;
}
</style>