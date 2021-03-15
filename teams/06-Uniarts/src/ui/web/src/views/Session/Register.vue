<template>
    <div class="register">
        <div class="container">
            <h2 class="title">Connect a account to get started</h2>
            <div class="wallet-list">
                <div class="polkadot">
                    <div class="wallet-chain">Uniarts</div>
                    <button class="wallet-button" @click="showList">
                        <icon-svg icon-class="polkadot"></icon-svg>
                        <span class="wallet-name">Polkadot Extension</span>
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
            <h2 class="dialog-title">Choose different account</h2>
            <ul class="address-list">
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
        </Dialog>
    </div>
</template>
<script>
import Dialog from "@/components/Dialog/Dialog";
import Identicon from "@polkadot/vue-identicon";
export default {
    name: "register",
    components: {
        Dialog,
        Identicon,
    },
    data() {
        return {
            isShow: false,
            list: [],
        };
    },
    created() {
        this.getAccounts();
    },
    methods: {
        showList() {
            this.isShow = true;
        },
        async getAccounts() {
            // await extension.isReady();
            let res = this.$extension.accounts();
            this.list = res.length ? res : [];
        },
        selectAccount(account) {
            this.isShow = false;
            this.register(account);
        },
        async register(account) {
            let message = "register";
            let signature = await this.$extension.sign(account, message);
            this.$http
                .userRegister({
                    message: message,
                    address: account.address,
                    signature: signature,
                })
                .then(() => {
                    this.$notify.success("Register Successful");
                })
                .catch((err) => {
                    this.$notify.error(err.head.msg || "Failed Register");
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
    display: flex;
    justify-content: center;
}

.polkadot {
    padding: 0 12px;
    /* max-width: 268px; */
    .wallet-chain {
        font-family: "Broadway";
        font-size: 34px;
        font-weight: 400;
        margin-bottom: 20px;
        line-height: 50px;
    }
    .wallet-button {
        border: 2px solid #020202;
        padding: 7px 15px;
        font-size: 18px;
        font-weight: 400;
        text-align: center;
        letter-spacing: 0px;
        background-color: transparent;
        min-width: 150px;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 10px 20px;
    }
    .svg-icon {
        font-size: 22px;
        margin-right: 15px;
    }
    .wallet-name {
        font-size: 18px;
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
