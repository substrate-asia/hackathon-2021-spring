<template>
  <div class="swap-field">
    <div class="box">
      <div class="title-box">
        <p class="title">
          <span>{{ this.fromSteemToDnut ? "STEEM" : "DNUT" }}</span>
          <img
            style="margin: 0 8px 4px 8px"
            src="../static/images/left-arrow.svg"
            alt=""
          />
          <span>{{ this.fromSteemToDnut ? "DNUT" : "STEEM" }}</span>
        </p>
      </div>
    </div>
    <div class="line"></div>
    <div class="round-box">
      <div class="box-title-container">
        <span>from</span>
        <span>{{ $t("message.balance") + ": " + fromTokenBalance }} </span>
      </div>
      <div class="box-content-container">
        <input
          class="mb-2 mr-sm-2 mb-sm-0 user input"
          placeholder="0.0"
          v-model="transValue"
          @keyup="checkTransValue"
          inputmode="decimal"
          pattern="^[0-9]*[.,]?[0-9]*$"
          spellcheck="false"
          value
        />
        <div class="token-box">
          <button class="maxBtn" @click="fillMaxTrans">Max</button>
          <img
            class="coin-icon"
            src="../static/images/tokens/steem.png"
            alt=""
            v-if="fromSteemToDnut"
          />
          <img
            class="coin-icon"
            src="../static/images/tokens/donut.svg"
            alt=""
            v-else
          />
          <span>
            {{ fromSteemToDnut ? "STEEM" : "DNUT" }}
          </span>
        </div>
      </div>
    </div>

    <div class="icon-box">
      <span @click="changeTransOrder" class="exchange-icon" />
    </div>

    <div class="round-box">
      <div class="box-title-container">
        <span>to</span>
        <span>{{ $t("message.balance") + ": " + toTokenBalance }} </span>
      </div>
      <div class="box-content-container">
        <input
          class="mb-2 mr-sm-2 mb-sm-0 user input"
          placeholder="0.0"
          v-model="transValue"
          @keyup="checkTransValue"
          inputmode="decimal"
          pattern="^[0-9]*[.,]?[0-9]*$"
          spellcheck="false"
          value
        />
        <div class="token-box">
          <img
            class="coin-icon"
            src="../static/images/tokens/donut.svg"
            alt=""
            v-if="fromSteemToDnut"
          />
          <img
            class="coin-icon"
            src="../static/images/tokens/steem.png"
            alt=""
            v-else
          />
          <span>
            {{ fromSteemToDnut ? "DNUT" : "STEEM" }}
          </span>
        </div>
      </div>
    </div>

    <div class="confirm-box">
      <b-button
        variant="primary"
        class="confirm-btn"
        v-if="isLogin"
        @click="trans"
        :disabled="!canTransFlag"
      >
        <b-spinner small type="grow" v-show="isLoading"></b-spinner>
        {{ $t("message.confirmconvert") }}
      </b-button>
      <b-button
        variant="primary"
        class="connectSteem"
        v-else
        @click="showSteemLogin = true"
      >
        {{ $t("wallet.connectSteem") }}
      </b-button>

      <!--手续费-->
      <div class="tip">
        <p v-show="fromSteemToDnut">
          {{ $t("message.servicecharge") }}：
          {{ parseFloat(transferRatio * 100).toFixed(2) }}%，{{
            $t("message.atleastcharge")
          }}
          {{ transferFee }} STEEM
        </p>
        <!-- 兑换率 -->
        <p v-if="fromSteemToDnut">
          {{ $t("message.convertrate") }}： 1 STEEM = 1 DNUT
        </p>
        <p v-else>{{ $t("message.convertrate") }}： 1 DNUT = 1 STEEM<br /></p>
      </div>
    </div>

    <Login v-if="showSteemLogin" @hideMask="showSteemLogin = false" />
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
  </div>
</template>

<script>
import TipMessage from "./ToolsComponents/TipMessage";
import Login from "./Login";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import {
  DNUT_TRANSFER_FEE,
  TRANSFER_FEE_RATIO,
  STEEM_DONUT_ACCOUNT,
  DONUT_PRECISION,
} from "../config";
import { steemWrap } from "../utils/chain/steem";
import sleep, { formatBalance } from "../utils/helper";
import { connect, loadAccounts } from "../utils/chain/polkadot";
import BN from "bn.js";
import { web3FromSource } from "@polkadot/extension-dapp";

export default {
  name: "Donut",
  components: {
    TipMessage,
    Login,
  },
  data() {
    return {
      canTransFlag: false,
      isLoading: false,
      transValue: "",
      tipMessage: "",
      tipTitle: "",
      transferFee: DNUT_TRANSFER_FEE,
      transferRatio: TRANSFER_FEE_RATIO,
      showMessage: false,
      showSteemLogin: false,
      fromSteemToDnut: true,
      nonce: 0,
    };
  },
  computed: {
    ...mapState([
      "steemBalance",
      "steemAccount",
      "donutAccount",
      "dnutBalance",
      "api",
    ]),
    fromTokenBalance() {
      if (this.fromSteemToDnut) {
        return formatBalance(this.steemBalance) + " STEEM";
      } else {
        return formatBalance(this.dnutBalance) + " DNUT";
      }
    },
    toTokenBalance() {
      if (!this.fromSteemToDnut) {
        return formatBalance(this.steemBalance) + " STEEM";
      } else {
        return formatBalance(this.dnutBalance) + " DNUT";
      }
    },
    isLogin() {
      return this.steemAccount && this.steemAccount.length > 0;
    },
    transFee() {
      if (this.fromSteemToDnut) {
        const f = parseFloat(this.transValue) * TRANSFER_FEE_RATIO;
        return f > DNUT_TRANSFER_FEE ? f : DNUT_TRANSFER_FEE;
      }
      return 0;
    },
  },

  methods: {
    ...mapActions(["getSteem"]),
    ...mapMutations(["saveSteemBalance", "saveDnutBalance"]),

    checkTransValue() {
      this.isLoading = false;
      const reg = /^\d+(\.\d+)?$/;
      const res = reg.test(this.transValue);
      let res1 = false;
      if (parseFloat(this.transValue) > 0) {
        res1 = true;
      }
      if (this.fromSteemToDnut) {
        const res2 =
          parseFloat(this.transValue) <=
          parseFloat(parseFloat(this.steemBalance) - this.transFee).toFixed(3);

        this.canTransFlag = res1 && res && res2;
      } else {
        const res3 =
          parseFloat(this.transValue) <= parseFloat(this.dnutBalance);
        this.canTransFlag = res1 && res && res3;
      }
    },

    fillMaxTrans() {
      if (this.fromSteemToDnut) {
        this.transValue = this.steemBalance;
        this.transValue = parseFloat(this.steemBalance - this.transFee);
      } else {
        this.transValue = parseFloat(this.dnutBalance);
      }
      this.checkTransValue();
    },

    trans() {
      this.isLoading = true;
      this.canTransFlag = false;
      if (this.fromSteemToDnut) {
        this.steemToDnut();
      } else {
        this.dnutToSteem();
      }
    },

    changeTransOrder() {
      this.fromSteemToDnut = !this.fromSteemToDnut;
      this.transValue = "";
      this.checkTransValue();
    },

    async steemToDnut() {
      try {
        const amount = parseFloat(this.transValue).toFixed(3);
        const res = await steemWrap(
          this.steemAccount,
          STEEM_DONUT_ACCOUNT,
          amount,
          this.donutAccount.address + " +" + amount + " DNUT",
          "STEEM",
          this.donutAccount.address,
          this.transFee
        );
        if (res.success === true) {
          const dnutBalance = parseFloat(this.dnutBalance);
          const steemBalance = parseFloat(this.steemBalance);
          this.saveSteemBalance(steemBalance - parseFloat(amount));
          this.saveDnutBalance(dnutBalance + parseFloat(amount));
        } else {
          this.tipTitle = this.$t("error.error");
          this.tipMessage = res.message;
          this.showMessage = true;
        }
      } catch (e) {
        this.tipTitle = this.$t("error.error");
        this.tipMessage = e.message;
        this.showMessage = true;
      } finally {
        this.isLoading = false;
        this.transValue = "";
        this.checkTransValue();
      }
    },

    async dnutToSteem() {
      try {
        if (this.api) {
          // Retrieve the chain & node information information via rpc calls
          const [nodeName, nodeVersion] = await Promise.all([
            this.api.rpc.system.name(),
            this.api.rpc.system.version(),
          ]);

          const bridge_sig =
            "0x" + Buffer.from("dummy signature").toString("hex");
          console.log(`We have connected to ${nodeName}-v${nodeVersion}`);
          if (this.nonce === 0) {
            this.nonce = (
              await this.api.query.system.account(this.donutAccount.address)
            ).nonce.toNumber();
          }

          const burn = this.api.tx.donutCore.burnDonut(
            this.steemAccount,
            new BN(this.transValue * DONUT_PRECISION)
          );
          // TODO: let user choose which injected user they use rather than default accounts[0]
          const injected = await web3FromSource(this.donutAccount.meta.source);
          this.api.setSigner(injected.signer);
          var that = this;
          const unsub = await burn
            .signAndSend(
              this.donutAccount.address,
              { nonce: this.nonce, era: 0 },
              (result) => {
                console.log(`Current status is ${result.status}`);
                if (result.status.isInBlock) {
                  console.log(
                    `Transaction included at blockHash ${result.status.asInBlock}`
                  );
                } else if (result.status.isFinalized) {
                  console.log(
                    `Transaction finalized at blockHash ${result.status.asFinalized}`
                  );
                  unsub();
                  const dnutBalance = parseFloat(that.dnutBalance);
                  const steemBalance = parseFloat(that.steemBalance);
                  that.saveSteemBalance(steemBalance + parseFloat(that.transValue));
                  that.saveDnutBalance(dnutBalance - parseFloat(that.transValue));
                  that.isLoading = false;
                  that.transValue = "";
                  that.checkTransValue();
                  return result.status.asFinalized;
                }
              }
            )
            .catch((err) => console.error(err));
        } else {
          console.log("no api");
        }
      } catch (e) {
        console.error("transfer err", e);
      }
    },
  },
  async mounted() {
    if (this.steemAccount && this.steemAccount.length > 0) {
      this.getSteem();
    }
    connect(this.$store.state, this.$store.commit, async () => {
      await loadAccounts(this.$store.dispatch);
      const { nonce, data: balance } = await this.api.query.system.account(
        this.donutAccount.address
      );
      this.saveDnutBalance(balance.free / DONUT_PRECISION);
    });
  },
};
</script>

<style lang="less" scoped>
@import "../static/css/swap.less";
</style>
