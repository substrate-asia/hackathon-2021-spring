<template>
    <div class="login">
        <div class="container">
            <h2 class="title">Connect a account to get started</h2>
            <div class="wallet-list">
                <div class="polkadot">
                    <div class="wallet-chain">
                        <icon-svg icon-class="polkadot"></icon-svg>
                        <span class="text">polkadot{.js}</span>
                    </div>
                    <button
                        class="wallet-button"
                        @click="showList('polkadot-js')"
                    >
                        <span class="wallet-name">Browser Extension</span>
                    </button>
                </div>
                <div class="math">
                    <div class="wallet-chain">
                        <img
                            class="wallet-logo"
                            src="@/assets/images/math.jpg"
                        />
                        <span class="text">Math Wallet</span>
                    </div>
                    <button
                        class="wallet-button"
                        @click="showList('mathwallet')"
                    >
                        <span class="wallet-name">Browser Extension</span>
                    </button>
                </div>
            </div>
        </div>
        <Dialog
            class="address-dialog"
            :type="''"
            :visible.sync="isShow"
            :clickModel="true"
            :showClose="false"
        >
            <div v-if="!needReset">
                <h2 class="dialog-title">Choose different account</h2>
                <ul class="address-list" v-if="list.length > 0">
                    <li
                        class="address-item"
                        v-for="(v, i) in list"
                        :key="i"
                        @click="selectAccount(v)"
                    >
                        <Identicon
                            class="icon"
                            :size="50"
                            :theme="'polkadot'"
                            :value="v.address"
                        />
                        <div class="address-content">
                            <div class="address-name">
                                <span class="name">{{ v.meta.name }}</span>
                                <span class="source">{{
                                    v.meta.source ? v.meta.source : "unkown"
                                }}</span>
                            </div>
                            <div class="address-value">{{ v.address }}</div>
                        </div>
                    </li>
                </ul>
                <ul class="address-list" v-else>
                    <li
                        style="
                            height: 90px;
                            text-align: center;
                            line-height: 90px;
                            font-size: 18px;
                        "
                    >
                        Please add an available account
                    </li>
                </ul>
            </div>
            <div
                v-else
                style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                "
            >
                <h2 class="dialog-title">
                    Please restart your browser and authorize the polkadot.js
                    extension again
                </h2>
            </div>
        </Dialog>
    </div>
</template>
<script>
import Dialog from "@/components/Dialog/Dialog";
import Identicon from "@polkadot/vue-identicon";
import store from "@/store";
export default {
    name: "login",
    components: {
        Dialog,
        Identicon,
    },
    data() {
        return {
            isShow: false,
            needReset: false,
            accountList: [],
            currentWallet: "polkadot-js",
        };
    },
    created() {
        // this.getAccounts();
    },
    computed: {
        list() {
            return this.accountList.filter((v) => {
                return v.meta.source == this.currentWallet;
            });
        },
    },
    beforeRouteEnter(to, from, next) {
        if (store.state.user.info.token) {
            next({
                path: "/account",
            });
        } else {
            next();
        }
    },
    methods: {
        async showList(text) {
            if (!this.$extension.isConnect) {
                this.needReset = true;
            }
            this.currentWallet = text;
            this.isShow = true;
            this.getAccounts();
        },
        getAccounts() {
            this.$extension.accounts().then((res) => {
                this.accountList = res.length ? res : [];
            });
        },
        selectAccount(account) {
            this.isShow = false;
            this.register(account);
        },
        async register(account) {
            let message = "login";
            let signature = await this.$extension.sign(account, message);
            console.log(signature);
            this.$http
                .userLogin({
                    message: message,
                    address: account.address,
                    signature: signature,
                })
                .then((res) => {
                    this.$notify.success("Login Successful");
                    this.$store.dispatch("user/SetInfo", res);
                    this.$router.push("/account");
                })
                .catch((err) => {
                    this.$notify.error(err.head.msg || "Failed Login");
                });
        },
    },
};
</script>
<style lang="scss" scoped>
.container {
    padding-top: 15vh;
}

.title {
    font-weight: 500;
    color: rgb(33, 33, 33);
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
}

.wallet-list {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 70px;
}

.polkadot,
.math {
    padding: 0 12px;
    margin-left: 50px;
    margin-right: 50px;
    /* max-width: 268px; */
    .wallet-chain {
        font-size: 26px;
        font-weight: 400;
        margin-bottom: 20px;
        line-height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .wallet-button {
        border: 2px solid #020202;
        padding: 7px 15px;
        font-size: 18px;
        font-weight: 400;
        text-align: center;
        letter-spacing: 0px;
        background-color: transparent;
        min-width: 230px;
        min-height: 54px;
        margin-bottom: 35px;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 10px 20px;
    }
    .wallet-logo {
        width: 35px;
        height: 35px;
        margin-right: 15px;
    }
    .svg-icon {
        font-size: 35px;
        margin-right: 15px;
    }
    .wallet-name {
        font-size: 18px;
        width: 100%;
        text-align: center;
    }
}

.address-dialog {
    ::v-deep .el-dialog {
        padding: 0;
        margin: 0;
        min-width: 200px;
        min-height: 200px;
    }
    ::v-deep .el-dialog__body {
        padding: 0;
        margin: 0;
    }
}

.address-list {
    margin: 0 30px;
    width: 550px;
    border: solid 1px rgba(194, 96, 96, 0.537);
    margin-top: 15px;
    margin-bottom: 35px;
    .address-item {
        display: flex;
        align-items: center;
        padding-left: 15px;
        padding-right: 15px;
        transition: background 0.3s ease;
        .icon {
            margin-right: 15px;
        }
        .address-content {
            width: calc(100% - 50px);
            padding-top: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(194, 96, 96, 0.237);
        }
        .address-name {
            font-size: 18px;
            color: black;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 5px;
            .source {
                font-size: 12px;
                color: #c61e1e;
                border: solid 1px rgba(194, 96, 96, 0.537);
                border-radius: 15px;
                padding: 1px 5px;
            }
        }
        .address-value {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .address-item:last-child .address-value {
        border-bottom: none;
    }
    .address-item:hover {
        background-color: rgba(194, 96, 96, 0.057);
        cursor: pointer;
    }
}
.dialog-title {
    color: #3c3d61;
    font-size: 1.5rem;
    font-weight: normal;
    padding: 20px 30px;
    text-align: left;
}
</style>
