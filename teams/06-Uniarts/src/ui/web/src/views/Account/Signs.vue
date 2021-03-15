2020-12-14 14:41:18. */
<template>
    <div class="signs" v-loading="isLoading">
        <Order type="signature" :list="list" @show="showDialog"></Order>
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
        <Dialog :visible.sync="dialogVisible" @closed="closeDialog">
            <div class="content">
                <div class="head">Application Signature</div>
                <div class="body">
                    <div class="label">Organization:</div>
                    <div class="label-org">
                        {{
                            selectItem.organization
                                ? selectItem.organization.name
                                : ""
                        }}
                    </div>
                    <div class="label">Signature information:</div>
                    <div class="label-desc">
                        {{ selectItem.memo }}
                    </div>
                </div>
                <div class="button-group">
                    <button
                        class="refuse"
                        v-loading="refuseLoading"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(0, 0, 0, 0.8)"
                        @click="refuse"
                    >
                        Refuse
                    </button>
                    <button
                        class="signature"
                        v-loading="signatureLoading"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(0, 0, 0, 0.8)"
                        @click="signature"
                    >
                        Signature
                    </button>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import Order from "@/views/Account/Order";
import Dialog from "@/components/Dialog/Dialog";
import { stringToHex } from "@polkadot/util";
export default {
    name: "signs",
    components: {
        Order,
        Dialog,
    },
    data() {
        return {
            list: [],
            page: 1,
            isLoading: false,
            per_page: 18,
            total_pages: 0,
            total_count: 0,

            dialogVisible: false,
            selectItem: {},
            refuseLoading: false,
            signatureLoading: false,
        };
    },
    mounted() {
        this.requestData();
    },
    computed: {
        hasPrev() {
            return this.page > 1;
        },
        hasNext() {
            return this.page < this.total_pages;
        },
    },
    methods: {
        requestData() {
            this.isLoading = true;
            this.$http
                .userGetApplySignature({
                    page: this.page,
                    per_page: this.per_page,
                })
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
        showDialog(item) {
            this.selectItem = item;
            this.dialogVisible = true;
        },
        closeDialog() {
            this.selectItem = {};
            this.dialogVisible = false;
        },
        refuse() {
            this.refuseLoading = true;
            this.$http
                .userPostRefuseSignature(
                    {
                        organization_name: this.selectItem.organization.name,
                    },
                    {
                        id: this.selectItem.art.id,
                    }
                )
                .then(() => {
                    this.refuseLoading = false;
                    this.dialogVisible = false;
                    this.$notify.success("Success");
                })
                .catch((err) => {
                    console.log(err);
                    this.refuseLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        async signature() {
            this.signatureLoading = true;
            await this.$rpc.api.isReady;
            let extrinsic = await this.$rpc.api.tx.nft.addSignature(
                this.selectItem.art.collection_id,
                this.selectItem.art.item_id,
                stringToHex(this.selectItem.organization.name),
                this.selectItem.memo,
                null
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.signatureLoading = false;
                    this.$notify.info("Application submitted");
                    this.selectItem = {};
                    this.dialogVisible = false;
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.signatureLoading = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.signs {
    padding-left: 10%;
    padding-top: 40px;
}
.content {
    .head {
        text-align: center;
        font-size: 18px;
        font-weight: 500;
        color: black;
    }
    .body {
        margin-top: 40px;
        font-size: 16px;
        color: black;
        .label {
            margin-bottom: 10px;
            color: #343434;
        }
        .label-desc {
            height: 252px;
            overflow: hidden;
        }
        .label-org {
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 600;
        }
    }
    .button-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .refuse,
        .signature {
            border: 2px solid #020202;
            font-size: 16px;
            margin-top: 20px;
            cursor: pointer;
            width: 200px;
            font-weight: 400;
            text-align: center;
            color: #020202;
            background: transparent;
            letter-spacing: 0px;
            padding: 10px 10px;
            margin-right: 10px;
            text-transform: capitalize;
        }
        .signature {
            background-color: #020202;
            color: white;
        }
    }
}
.pagenation {
    margin-top: 100px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 133px;
    .prev {
        width: 110px;
        height: 70px;
        background: url("~@/assets/images/zuo@2x.png") no-repeat;
        background-size: 100% auto;
        margin: 0 91px;
        cursor: pointer;
    }
    .next {
        width: 110px;
        height: 70px;
        background: url("~@/assets/images/you@2x.png") no-repeat;
        background-size: 100% auto;
        margin: 0 91px;
        cursor: pointer;
    }
    .prev.no-prev,
    .next.no-next {
        opacity: 0.3;
        cursor: not-allowed;
    }
}
</style>
