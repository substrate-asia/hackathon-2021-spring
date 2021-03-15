<template>
    <div class="sign">
        <div class="container">
            <div class="sign-item">
                <div class="title">
                    {{ isOrg ? "organization" : "WALLET ADDRESS" }}
                </div>
                <div class="content">
                    <div class="address">
                        {{
                            isOrg
                                ? hexTostring(name)
                                : $store.state.user.info.address
                        }}
                    </div>
                </div>
            </div>
            <div class="sign-item" v-loading="isLoading">
                <div class="title">SELECT A WORK</div>
                <div class="content">
                    <div
                        class="item"
                        :class="{
                            offline: !v.item_id,
                            active: selectArt.id == v.id,
                        }"
                        v-for="(v, i) in list"
                        :key="i"
                        @click="clickArt(v)"
                    >
                        <AdaptiveImage
                            width="250px"
                            height="187px"
                            :url="v.img_main_file1.url"
                        ></AdaptiveImage>
                        <div class="art-info">
                            <div class="name">{{ v.name }}</div>
                            <div class="texture">
                                {{ getMaterial(v.material_id).title }}
                            </div>
                        </div>
                    </div>
                </div>
                <button class="apply" @click="addSignature">Apply Now</button>
            </div>
        </div>
        <Dialog type="medium" :visible.sync="dialogVisible">
            <div class="dialog-body">
                <div class="tip">TIPS</div>
                <div class="label">
                    Please enter the information attached to the signature
                </div>
                <Textarea
                    class="dialog-textarea"
                    placeholder="Please enter the information attached to the signature"
                    v-model="signContent"
                    :minRows="4"
                    :maxRows="4"
                />
                <button
                    @click="submit"
                    v-loading="isSubmiting"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    Signature
                </button>
            </div>
        </Dialog>
    </div>
</template>
<script>
import AdaptiveImage from "@/components/AdaptiveImage";
import Textarea from "@/components/Textarea";
import { hexToString } from "@polkadot/util";
import Dialog from "@/components/Dialog/Dialog";
export default {
    name: "sign",
    components: {
        AdaptiveImage,
        Textarea,
        Dialog,
    },
    data() {
        return {
            isLoading: false,
            list: [],
            selectArt: {},
            page: 1,
            per_page: 18,
            total_pages: 0,
            total_count: 0,

            signContent: "",
            dialogVisible: false,
            isSubmiting: false,
            name: this.$route.params.hash,

            organization: {},
        };
    },
    created() {
        this.requestData();
        this.getOrgInfo();
    },
    computed: {
        isOrg() {
            return this.$route.name == "OrgSign";
        },
    },
    methods: {
        requestData() {
            this.isLoading = true;
            this.$http
                .userOwnSginArts({
                    organization_name: this.hexTostring(this.name),
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
        getMaterial(id) {
            let item = this.$store.state.art.materials.find((v) => (v.id = id));
            return item ? item : {};
        },
        hexTostring(hex) {
            return hexToString(hex);
        },
        addSignature() {
            if (!this.selectArt.id) return;
            this.dialogVisible = true;
        },
        async getOrgInfo() {
            await this.$rpc.api.isReady;
            let result = await this.$rpc.api.query.names.names(this.name);
            this.organization = result.toJSON();
        },
        async submit() {
            if (
                this.organization.owner !== this.$store.state.user.info.address
            ) {
                this.applyOrgSignature(this.selectArt.id, this.name);
                return;
            }
            this.isSubmiting = true;
            await this.$rpc.api.isReady;
            let extrinsic = await this.$rpc.api.tx.nft.addSignature(
                this.selectArt.collection_id,
                this.selectArt.item_id,
                this.name,
                this.signContent,
                null
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.signContent = "";
                    this.dialogVisible = false;
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
        applyOrgSignature(id, organization_name) {
            this.isSubmiting = true;
            this.$http
                .userPostApplySignature(
                    {
                        id: id,
                        organization_name: hexToString(organization_name),
                        memo: this.signContent,
                    },
                    {
                        id: id,
                    }
                )
                .then(() => {
                    this.isSubmiting = false;
                    this.dialogVisible = false;
                    this.$notify.success("Application submitted");
                })
                .catch((err) => {
                    console.log(err);
                    this.isSubmiting = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        clickArt(item) {
            if (item.item_id) {
                this.selectArt = item;
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.sign-item {
    margin-top: 109px;
    > .title {
        font-family: "Broadway";
        font-size: 38px;
        font-weight: 400;
        text-align: left;
        color: #020202;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 63px;
    }
    .content {
        text-align: left;
        overflow: hidden;
        .address {
            font-size: 26px;
            font-weight: 400;
            text-align: left;
            color: #020202;
            letter-spacing: 0px;
        }
        .item {
            /* display: inline-block; */
            float: left;
            width: 250px;
            height: 288px;
            margin-bottom: 52px;
            cursor: pointer;
            box-sizing: border-box;
            transition: box-shadow 0.3s ease;
            border-radius: 4px;
            margin-right: 64px;
            position: relative;
            z-index: 1;
            border: 2px solid transparent;
        }
        .item:nth-child(4n) {
            margin-right: 0;
        }
        .item:hover {
            box-shadow: 3px 4px 11px 1px rgba(108, 108, 108, 0.6);
        }
        .item.active {
            overflow: hidden;
            border-color: #c61e1e;
            box-shadow: 4px 7px 14px 1px rgba(3, 37, 48, 0.6);
        }
        .item.active::before {
            content: "";
            display: block;
            position: absolute;
            right: 0px;
            z-index: 1;
            top: 0px;
            border-right: 22px solid #c61e1e;
            border-bottom: 22px solid transparent;
            border-left: 22px solid transparent;
            border-top: 22px solid #c61e1e;
        }
        .item.active::after {
            content: "";
            display: block;
            position: absolute;
            right: 0px;
            z-index: 2;
            top: 0px;
            width: 25px;
            height: 25px;
            background: url(~@/assets/images/gou_ico@2x.png) no-repeat;
            background-size: 25px;
        }
        .item.offline {
            cursor: not-allowed;
            box-shadow: none;
        }
        .adaptive-image {
            margin-bottom: 24px;
            margin-right: -1px;
            margin-top: -2px;
            margin-left: -2px;
        }
        .art-info {
            .name {
                font-size: 16px;
                font-weight: 400;
                text-align: left;
                color: #020202;
                line-height: 21px;
                letter-spacing: 0px;
                margin-bottom: 5px;
                padding-left: 10px;
                padding-right: 10px;
            }
            .texture {
                font-size: 16px;
                font-weight: 400;
                text-align: left;
                color: #010034;
                line-height: 27px;
                letter-spacing: 0px;
                margin-bottom: 20px;
                padding-left: 10px;
                padding-right: 10px;
            }
        }
    }
    button.apply {
        display: block;
        font-size: 26px;
        font-weight: 600;
        text-align: center;
        color: #020202;
        letter-spacing: 0px;
        border: 3px solid #020202;
        width: 381px;
        height: 82px;
        cursor: pointer;
        margin: 0 auto;
        margin-top: 100px;
        margin-bottom: 100px;
        background-color: transparent;
    }
}

.dialog-body {
    text-align: center;
    .tip {
        font-size: 26px;
        font-weight: 600;
        text-align: center;
        color: #020202;
        letter-spacing: 0px;
        margin-top: 14px;
        margin-bottom: 84px;
    }
    .label {
        font-size: 20px;
        font-weight: 400;
        text-align: center;
        color: #020202;
        letter-spacing: 0px;
        margin-bottom: 50px;
    }
    .dialog-textarea {
        height: 114px;
        margin-bottom: 79px;
    }
    > button {
        cursor: pointer;
        width: 307px;
        height: 75px;
        background: #020202;
        color: white;
        font-size: 21px;
        font-weight: 400;
        text-align: center;
        letter-spacing: 0px;
    }
}
</style>
