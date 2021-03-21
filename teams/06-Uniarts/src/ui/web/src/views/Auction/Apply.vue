<template>
    <div class="apply container">
        <div class="title">Auction Apply</div>
        <div class="content">
            <div class="thumbnail" v-loading="isLoading">
                <div class="no-data" v-if="list.length == 0">No artworks</div>
                <div class="item" v-for="(v, i) in list" :key="i">
                    <router-link :to="`/art/${v.id}`" class="img-container">
                        <AdaptiveImage
                            :url="v.img_main_file1.url"
                        ></AdaptiveImage>
                    </router-link>
                    <h5 class="title">{{ v.name }}</h5>
                    <div class="desc">{{ materialType(v.material_id) }}</div>
                    <div class="address-label">
                        Certificate Address:
                        <span class="address">{{ v.item_hash }}</span>
                    </div>
                    <div class="price">{{ v.price }} UART</div>
                    <div
                        class="status"
                        v-if="
                            v.join_status == 'applying' ||
                            v.join_status == 'done'
                        "
                    >
                        {{ v.join_status }}
                    </div>
                    <button
                        class="action"
                        :disabled="
                            v.join_status == 'applying' ||
                            v.join_status == 'done'
                        "
                        v-else
                        @click="selectArt(v)"
                    >
                        Launch an auction
                    </button>
                </div>
            </div>
            <div class="pagenation" v-if="hasPrev || hasNext">
                <div
                    class="prev"
                    @click="prev"
                    :class="{ 'no-prev': !hasPrev }"
                ></div>
                <div
                    class="next"
                    @click="next"
                    :class="{ 'no-next': !hasNext }"
                ></div>
            </div>
        </div>

        <Dialog
            :visible.sync="dialogVisible"
            :close="handleClose"
            @closed="handleClosed"
        >
            <div class="auction">
                <div class="title">FIRM AUCTION</div>
                <div class="price">
                    Current Price:
                    <span class="number">{{ art.price || 0 }} UART</span>
                </div>
                <el-form
                    ref="form"
                    :model="form"
                    label-width="130px"
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
                    <el-form-item label="开始时间" prop="start_time">
                        <DatePicker
                            type="datetime"
                            v-model="form.start_time"
                            placeholder="选择日期"
                        />
                    </el-form-item>
                    <el-form-item label="结束时间" prop="end_time">
                        <DatePicker
                            type="datetime"
                            v-model="form.end_time"
                            placeholder="选择日期"
                        />
                    </el-form-item>
                </el-form>
                <button
                    @click="submitAuction"
                    v-loading="isSubmiting"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    CREATE AUCTION
                </button>
            </div>
        </Dialog>
    </div>
</template>
<script>
import AdaptiveImage from "@/components/AdaptiveImage";
import Dialog from "@/components/Dialog/Dialog";
import Input from "@/components/Input";
import DatePicker from "@/components/DatePicker";
import { Form, FormItem } from "element-ui";
import { ComputeBlockTimestamp, ComputeBlockNumber } from "@/utils";
import { BigNumber } from "bignumber.js";
export default {
    name: "apply",
    components: {
        AdaptiveImage,
        Dialog,
        Input,
        DatePicker,
        [Form.name]: Form,
        [FormItem.name]: FormItem,
    },
    data() {
        return {
            id: this.$route.params.id,
            list: [],
            total_count: 0,
            page: 1,
            isLoading: false,
            isSubmiting: false,
            per_page: 18,
            total_pages: 0,
            dialogVisible: false,
            art: {},
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
        };
    },
    computed: {
        hasPrev() {
            return this.page > 1;
        },
        hasNext() {
            return this.page < this.total_pages;
        },
        chainInfo() {
            return this.$store.state.global.chain;
        },
    },
    created() {
        this.requestData();
    },
    methods: {
        requestData() {
            if (!this.$store.state.user.info.address) {
                this.$router.push("/login");
                return;
            }
            this.isLoading = true;
            this.$http
                .userGetAvailableSubmitList(
                    {
                        page: this.page,
                        per_page: this.per_page,
                    },
                    { id: this.id }
                )
                .then((res) => {
                    this.isLoading = false;
                    this.list = res.list;
                    this.total_count = res.total_count;
                    this.total_pages = Math.ceil(
                        res.total_count / this.per_page
                    );
                })
                .catch((err) => {
                    console.log(err);
                    this.isLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        materialType(id) {
            let item = this.$store.state.art.materials.find(
                (v) => v.code == id + ""
            );
            return item ? item.title : "";
        },
        computeBlockTimestamp(blockNumber) {
            return ComputeBlockTimestamp(
                blockNumber,
                this.$store.state.global.chain.timestamp,
                this.$store.state.global.chain.blockHeight
            );
        },
        next() {
            if (this.hasNext) {
                this.page++;
                this.requestData();
            }
        },
        prev() {
            if (this.hasPrev) {
                this.page--;
                this.requestData();
            }
        },
        async submitAuction() {
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
            this.$http
                .userPostAuctionApply(
                    {
                        art_id: this.art.id,
                        start_price: new BigNumber(
                            this.form.start_price
                        ).toNumber(),
                        price_increment: new BigNumber(
                            this.form.increment
                        ).toNumber(),
                        start_time: start_time,
                        end_time: end_time,
                    },
                    { id: this.id }
                )
                .then((res) => {
                    this.isSubmiting = false;
                    this.dialogVisible = false;
                    this.$notify.success("Submitted");
                    let item = this.list.find((v) => v.id == res.art.id);
                    item ? (item.isApply = true) : "";
                })
                .catch(() => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                });
        },
        selectArt(item) {
            this.art = item;
            this.dialogVisible = true;
        },
        handleClose() {
            this.dialogVisible = false;
        },
        handleClosed() {
            this.$refs["form"].resetFields();
            this.art = {};
        },
    },
};
</script>
<style lang="scss" scoped>
.apply {
    padding: 60px 0;
    > .title {
        margin-top: 70px;
        font-size: 48px;
        font-family: "Broadway";
        font-weight: 400;
        line-height: 40px;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 103px;
    }
}

.thumbnail {
    overflow: hidden;
    .title {
        text-transform: uppercase;
        font-size: 22px;
        font-weight: 600;
        text-align: left;
        letter-spacing: 0px;
    }
    .item {
        float: left;
        width: 30%;
        margin-right: 5%;
        margin-bottom: 40px;
    }
    .item:nth-child(3n) {
        margin-right: 0;
    }

    .img-container {
        display: block;
        width: 100%;
        height: 270px;
        overflow: hidden;
        border-radius: 4px;
        margin-bottom: 35px;
        position: relative;
        .aution-view {
            width: 100%;
            line-height: 35px;
            position: absolute;
            bottom: 0;
            color: white;
            background-color: rgba(0, 0, 0, 0.7);
        }
        .aution-label {
            line-height: 35px;
            position: absolute;
            top: 0;
            border-bottom-left-radius: 4px;
            padding: 0 10px;
            right: 0;
            color: white;
            background-color: rgba(0, 0, 0, 0.7);
        }
    }
    .desc,
    .address-label {
        font-size: 18px;
        font-weight: 400;
        text-align: left;
        line-height: 35px;
        letter-spacing: 0px;
    }
    .action {
        width: 100%;
        border: 2px solid #020202;
        font-size: 16px;
        height: 47px;
        margin-top: 20px;
        display: block;
        cursor: pointer;
        font-weight: 400;
        text-align: center;
        background: transparent;
        color: #020202;
        letter-spacing: 0px;
        padding: 6px 10px;
        margin-right: 10px;
        text-transform: capitalize;
    }

    .action[disabled] {
        border: 2px solid #c3c3c3;
        color: #999;
        cursor: not-allowed;
    }

    .address-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-height: 35px;
    }

    .price {
        font-size: 22px;
        font-weight: 600;
        text-align: left;
        line-height: 30px;
        letter-spacing: 0px;
        margin-top: 8px;
    }

    .status {
        width: 100%;
        border: 2px solid #020202;
        font-size: 16px;
        height: 47px;
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.3;
        cursor: inherit;
        text-align: center;
        background: transparent;
        color: #020202;
        letter-spacing: 0px;
        padding: 6px 10px;
        margin-right: 10px;
        text-transform: capitalize;
    }

    .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        color: #666;
    }
}
.thumbnail.group {
    .item {
        margin-bottom: 115px;
    }
}

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
        width: 450px;
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
