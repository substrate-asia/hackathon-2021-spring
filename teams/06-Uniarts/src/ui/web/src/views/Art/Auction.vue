<template>
    <div class="auction">
        <div class="title" v-if="isAuctioning && isOwner">
            {{
                isStarted || isWaiting
                    ? "CANCEL AUCTION"
                    : isFinished
                    ? "FINISH AUCTION"
                    : "CANCEL AUCTION"
            }}
        </div>
        <div class="title" v-else>FIRM AUCTION</div>
        <div class="create-auction" v-if="isOwner">
            <div class="price">
                Current Price:
                <span class="number">{{ art.price || 0 }} UART</span>
            </div>
            <el-form
                v-if="!isAuctioning"
                ref="form"
                :model="form"
                label-width="140px"
                :rules="rules"
                label-position="left"
            >
                <el-form-item label="Price" prop="start_price">
                    <Input
                        class="input-start-price"
                        v-model="form.start_price"
                        type="number"
                        :append="chainInfo.tokenSymbol"
                    />
                </el-form-item>
                <el-form-item label="Markup" prop="increment">
                    <Input
                        class="input-start-price"
                        v-model="form.increment"
                        type="number"
                        :append="chainInfo.tokenSymbol"
                    />
                </el-form-item>
                <el-form-item label="Starting Time" prop="start_time">
                    <DatePicker
                        type="datetime"
                        v-model="form.start_time"
                        placeholder="Select"
                    />
                </el-form-item>
                <el-form-item label="End Time" prop="end_time">
                    <DatePicker
                        type="datetime"
                        v-model="form.end_time"
                        placeholder="Select"
                    />
                </el-form-item>
            </el-form>
            <button
                v-if="isAuctioning && (isStarted || isWaiting)"
                @click="cancelAuction"
                v-loading="isSubmiting"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
            >
                CANCEL AUCTION
            </button>
            <button
                v-if="isAuctioning && isFinished"
                @click="finishAuction"
                v-loading="isSubmiting"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
            >
                FINISH AUCTION
            </button>
            <button
                v-if="!isAuctioning"
                @click="submit"
                v-loading="isSubmiting"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
            >
                CREATE AUCTION
            </button>
        </div>
        <div class="send-auction" v-else>
            <div class="price">
                Current Price:
                <span class="number"
                    >{{
                        auction.current_price ||
                        auction.start_price | priceFormat
                    }}
                    UART</span
                >
            </div>
            <div class="desc">
                You have bid
                <span
                    >{{
                        auction.current_price ||
                        auction.start_price | priceFormat
                    }}
                    {{ chainInfo.tokenSymbol }}</span
                >, at least you need to increase the price by
                <span
                    >{{ auction.increment | priceFormat }}
                    {{ chainInfo.tokenSymbol }}</span
                >.
            </div>
            <div class="input-body">
                <input
                    disabled
                    type="number"
                    :value="currentPrice | priceFormat"
                />
                <span class="code">{{ chainInfo.tokenSymbol }}</span>
            </div>
            <div class="note">
                If the auction is not successful, the bid amount will be
                returned after the auction
            </div>
            <button
                @click="bidAuction"
                v-loading="isSubmiting"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
            >
                BID NOW
            </button>
        </div>
    </div>
</template>
<script>
import Input from "@/components/Input";
import DatePicker from "@/components/DatePicker";
import { BigNumber } from "bignumber.js";
import { ComputeBlockNumber } from "@/utils";
import { Form, FormItem } from "element-ui";
export default {
    name: "auction",
    components: {
        Input,
        DatePicker,
        [Form.name]: Form,
        [FormItem.name]: FormItem,
    },
    props: {
        isStarted: {
            type: Boolean,
            default: false,
        },
        isFinished: {
            type: Boolean,
            default: false,
        },
        isWaiting: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            form: {
                start_price: "",
                increment: "",
                start_time: "",
                end_time: "",
            },
            rules: {
                start_price: [
                    {
                        required: true,
                        message: "Please enter the price",
                        trigger: "blur",
                    },
                ],
                increment: [
                    {
                        required: true,
                        message: "Please enter the price increase",
                        trigger: "blur",
                    },
                ],
                start_time: [
                    {
                        required: true,
                        message: "Please select the auction start time",
                        trigger: "blur",
                    },
                ],
                end_time: [
                    {
                        required: true,
                        message: "Please select the end time of the auction",
                        trigger: "blur",
                    },
                ],
            },
            isSubmiting: false,
        };
    },
    computed: {
        art() {
            return this.$store.state.art.art;
        },
        chainInfo() {
            return this.$store.state.global.chain;
        },
        auction() {
            return this.$store.state.art.auctionInfo;
        },
        isOwner() {
            return (
                this.art.member &&
                this.art.member.address == this.$store.state.user.info.address
            );
        },
        currentPrice() {
            return new BigNumber(
                this.auction.current_price || this.auction.start_price
            )
                .plus(this.auction.increment)
                .toString();
        },
        isAuctioning() {
            return (
                this.$store.getters["art/artStatus"] ==
                    this.$store.state.art.ART_ON_AUCTION ||
                this.$store.getters["art/artStatus"] ==
                    this.$store.state.art.ART_WAITING_AUCTION
            );
        },
    },
    methods: {
        submit() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.createAuction();
                }
            });
        },
        async finishAuction() {
            await this.$rpc.api.isReady;
            if (this.isSubmiting) {
                return;
            }
            this.isSubmiting = true;
            let extrinsic = this.$rpc.api.tx.nft.finishAuction(
                this.art.collection_id,
                this.art.item_id
            );

            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.$emit("finishAuction");
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
        async bidAuction() {
            await this.$rpc.api.isReady;
            if (this.isSubmiting) {
                return;
            }
            this.isSubmiting = true;
            let extrinsic = this.$rpc.api.tx.nft.bid(
                this.art.collection_id,
                this.art.item_id
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.$emit("finishAuction");
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
        async cancelAuction() {
            if (this.isSubmiting) {
                return;
            }
            this.isSubmiting = true;
            let extrinsic = this.$rpc.api.tx.nft.cancelAuction(
                this.art.collection_id,
                this.art.item_id
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.$emit("cancelAuction");
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
        async createAuction() {
            await this.$rpc.api.isReady;
            if (this.isSubmiting) {
                return;
            }
            this.isSubmiting = true;
            let currentBlockHeight = this.$store.state.global.chain.blockHeight;
            let currentTimestamp = this.$store.state.global.chain.timestamp;
            let start_time = parseInt(this.form.start_time.getTime());
            let end_time = parseInt(this.form.end_time.getTime());
            start_time = ComputeBlockNumber(
                start_time,
                currentTimestamp,
                currentBlockHeight
            );
            end_time = ComputeBlockNumber(
                end_time,
                currentTimestamp,
                currentBlockHeight
            );
            let extrinsic = this.$rpc.api.tx.nft.createAuction(
                this.art.collection_id,
                this.art.item_id,
                0,
                new BigNumber(10)
                    .pow(this.$store.state.global.chain.tokenDecimals)
                    .times(this.form.start_price)
                    .toNumber(),
                new BigNumber(10)
                    .pow(this.$store.state.global.chain.tokenDecimals)
                    .times(this.form.increment)
                    .toNumber(),
                start_time,
                end_time
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.$refs["form"].resetFields();
                    this.$emit("finishAuction");
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.auction {
    font-size: 26px;
    letter-spacing: 0px;
    text-align: center;
    color: #020202;
    .title {
        font-weight: 600;
        margin-bottom: 30px;
    }
    .price {
        font-size: 20px;
        font-weight: 400;
        min-height: 30px;
        margin-bottom: 35px;
    }
    .number {
        font-size: 24px;
        color: #c61e1e;
    }
    .note {
        font-size: 20px;
        margin-bottom: 25px;
    }
    .desc {
        font-size: 20px;
        font-weight: 400;
        margin-bottom: 37px;
        min-height: 30px;
    }
    button {
        background: #020202;
        width: 307px;
        height: 75px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        color: #ffffff;
        letter-spacing: 0px;
        cursor: pointer;
    }
    .input-body {
        position: relative;
        margin-bottom: 37px;
        height: 77px;
        input {
            width: 100%;
            height: 75px;
            font-size: 26px;
            border: 2px solid #020202;
            padding: 14px 34px;
            text-align: center;
        }
        .code {
            font-size: 26px;
            font-weight: 600;
            text-align: left;
            letter-spacing: 0px;
            position: absolute;
            right: 34px;
            top: 19px;
        }
    }
    .el-form {
        width: 460px;
        margin: 0 auto;
        margin-bottom: 60px;
    }
    .el-form-item {
        margin-bottom: 30px;
        ::v-deep .el-form-item__content {
            text-align: left;
        }
        ::v-deep .el-form-item__label {
            font-size: 17px;
            font-weight: 400;
            line-height: 45px;
        }
    }
    .el-date-editor,
    .input-box {
        width: 100%;
    }
}
</style>
