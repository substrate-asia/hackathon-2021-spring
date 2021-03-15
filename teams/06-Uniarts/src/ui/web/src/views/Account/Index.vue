<template>
    <div class="index">
        <div class="container">
            <div class="body">
                <div class="profile">
                    <div class="avatar">
                        <AdaptiveImage
                            :url="
                                user.avatar && user.avatar.url
                                    ? user.avatar.url
                                    : yin_2x
                            "
                        />
                    </div>
                    <div class="profile-info">
                        <span class="name">{{ user.display_name }}</span>

                        <el-tooltip
                            popper-class="balance"
                            :content="
                                balance.free +
                                ' ' +
                                $store.state.global.chain.tokenSymbol
                            "
                            placement="top"
                        >
                            <div class="balance">
                                Balance: {{ balance.free }}
                            </div>
                        </el-tooltip>

                        <div class="score">
                            Score:
                            <span class="score-number">0</span>
                            <span class="help">?</span>
                            <div class="quit" @click="quit">
                                <icon-svg icon-class="quit"></icon-svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="menu-container">
                    <ul class="menu">
                        <li>
                            <router-link to="/account/profile"
                                >Personal account</router-link
                            >
                        </li>
                        <li>
                            <router-link to="/account/following"
                                >Following</router-link
                            >
                        </li>
                        <li>
                            <router-link to="/account/followers"
                                >Followers</router-link
                            >
                        </li>
                        <li>
                            <router-link to="/account/collection"
                                >Collection</router-link
                            >
                        </li>
                        <li>
                            <router-link to="/account/purchase"
                                >Purchase Order</router-link
                            >
                        </li>
                        <li>
                            <router-link to="/account/sold"
                                >Sold Order</router-link
                            >
                        </li>
                    </ul>
                    <ul
                        class="menu"
                        style="padding-top: 25px; margin-bottom: 70px"
                    >
                        <li>
                            <router-link to="/account"
                                >Receiving Address</router-link
                            >
                        </li>
                        <li>
                            <router-link to="/certificate/apply"
                                >Certificate Authority</router-link
                            >
                        </li>
                        <li
                            style="
                                border-radius: 25px;
                                background-color: black;
                                color: white;
                                padding: 12px 25px;
                            "
                        >
                            <router-link to="/account/upload">
                                Upload Works
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="header">
                <div class="option">
                    <router-link
                        to="/account/sale"
                        class="option-title"
                        :class="{ active: optionActive == '3' }"
                    >
                        For sale
                    </router-link>
                    <router-link
                        to="/account"
                        class="option-title"
                        :class="{ active: optionActive == '1' }"
                    >
                        Stock
                    </router-link>
                    <router-link
                        to="/account/sign"
                        class="option-title"
                        :class="{ active: optionActive == '2' }"
                    >
                        Add signs
                    </router-link>
                </div>
                <div class="content">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import store from "@/store";
import AdaptiveImage from "@/components/AdaptiveImage";
import { BigNumber } from "bignumber.js";
import { Tooltip } from "element-ui";
import yin_2x from "@/assets/images/yin@2x.png";
export default {
    name: "index",
    components: {
        AdaptiveImage,
        [Tooltip.name]: Tooltip,
    },
    data() {
        return {
            yin_2x,
            menuActive: "0",
            list: [],
            balance: {},
        };
    },
    computed: {
        user() {
            return this.$store.state.user.info;
        },
        optionActive() {
            let index = "";
            switch (this.$route.path) {
                case "/account":
                case "/account/":
                    index = "1";
                    break;
                case "/account/sale":
                    index = "3";
                    break;
                case "/account/sign":
                    index = "2";
                    break;
            }
            return index;
        },
    },
    beforeRouteEnter(to, from, next) {
        if (!store.state.user.info.token) {
            next({
                path: "/login",
            });
        } else {
            next();
        }
    },
    created() {
        this.requestBalance();
    },
    watch: {
        user() {
            this.requestBalance();
        },
    },
    methods: {
        quit() {
            this.$store.dispatch("user/Quit");
            this.$router.push("/");
        },
        async requestBalance() {
            if (!this.user.address) return;
            await this.$rpc.api.isReady;
            let result = await this.$rpc.api.query.system.account(
                this.user.address
            );
            result = result.data.toJSON();
            this.balance = {
                feeFrozen: new BigNumber(result.feeFrozen)
                    .div(
                        new BigNumber(10).pow(
                            this.$store.state.global.chain.tokenDecimals || 12
                        )
                    )
                    .toFixed(4),
                free: new BigNumber(result.free)
                    .div(
                        new BigNumber(10).pow(
                            this.$store.state.global.chain.tokenDecimals || 12
                        )
                    )
                    .toFixed(4),
                miscFrozen: new BigNumber(result.miscFrozen)
                    .div(
                        new BigNumber(10).pow(
                            this.$store.state.global.chain.tokenDecimals || 12
                        )
                    )
                    .toFixed(4),
                reserved: new BigNumber(result.reserved)
                    .div(
                        new BigNumber(10).pow(
                            this.$store.state.global.chain.tokenDecimals || 12
                        )
                    )
                    .toFixed(4),
            };
        },
    },
};
</script>
<style lang="scss" scoped>
.index {
    padding-top: 80px;
    padding-bottom: 80px;
}
.container {
    display: flex;
    justify-content: space-between;
}
.header {
    display: flex;
    flex-direction: column;
    width: calc(100% - 230px);
    .option {
        display: flex;
        align-items: center;
        justify-content: center;
        .option-title {
            font-size: 20px;
            font-weight: 400;
            letter-spacing: 0px;
            color: #999999;
            margin: 0 45px;
            cursor: pointer;
            position: relative;
        }
        .option-title.active {
            color: #020202;
        }
        .option-title.active::after {
            content: "";
            position: absolute;
            height: 4px;
            background: #020202;
            width: 83px;
            bottom: -13px;
            left: 50%;
            transform: translateX(-50%);
        }
    }
    .content {
        width: 100%;
        .homepage {
            padding-top: 78px;
            font-size: 18px;
            font-weight: 400;
            letter-spacing: 0px;
            .update {
                display: inline-block;
                width: 20px;
                height: 20px;
                background: url("~@/assets/images/xie@2x.png") no-repeat;
                background-size: 20px;
                cursor: pointer;
            }
            .more-button {
                display: block;
                padding: 17px 80px;
                margin: 0 auto;
                color: black;
                font-size: 22px;
                font-weight: 600;
                background: transparent;
                border: 3px solid black;
                text-transform: uppercase;
                margin-top: 93px;
                cursor: pointer;
            }
        }
    }
}

.body {
    width: 230px;
    display: flex;
    flex-direction: column;
    .menu {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding-top: 73px;
        li {
            font-size: 18px;
            font-weight: 400;
            letter-spacing: 0px;
            margin-bottom: 51px;
        }
    }
    .profile {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        > .avatar {
            overflow: hidden;
            border-radius: 50%;
            border: 4px solid #020202;
            width: 109px;
            height: 109px;
            margin-right: 40px;
            margin-left: 30px;
            margin-bottom: 41px;
        }
        .profile-info {
            display: flex;
            flex-direction: column;
            .name {
                font-size: 22px;
                font-weight: 600;
                letter-spacing: 0px;
                margin-bottom: 20px;
                max-width: 200px;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .score {
                font-size: 22px;
                font-weight: 400;
                letter-spacing: 0px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .balance {
                font-size: 20px;
                font-weight: 400;
                letter-spacing: 0px;
                margin-bottom: 13px;
                white-space: nowrap;
                width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .score-number {
                margin-left: 15px;
                font-weight: 600;
            }
            .help {
                display: block;
                margin-left: 15px;
                width: 19px;
                height: 19px;
                font-size: 16px;
                line-height: 18px;
                color: #1a7fc6;
                border: 1px solid #1a7fc6;
                border-radius: 50%;
                cursor: pointer;
            }
            .quit {
                margin-left: 15px;
                display: flex;
                font-size: 20px;
                cursor: pointer;
            }
        }
    }
}
</style>
