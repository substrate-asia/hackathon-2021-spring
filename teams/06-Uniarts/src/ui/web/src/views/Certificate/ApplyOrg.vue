<template>
    <div class="org-apply">
        <div class="container">
            <div class="sign-item">
                <div class="title">Certificate Authority</div>
                <div class="content">
                    <el-form
                        :model="form"
                        ref="form"
                        :rules="rules"
                        label-position="left"
                        label-width="200px"
                    >
                        <el-form-item label="Name" prop="name">
                            <Input style="width: 307px" v-model="form.name" />
                        </el-form-item>
                        <el-form-item label="Description" prop="desc">
                            <Textarea :minRows="4" v-model="form.desc" />
                        </el-form-item>
                        <el-form-item label="Fee" prop="fee">
                            <Input style="width: 307px" v-model="form.fee" />
                            <span style="font-size: 16px; margin-left: 15px"
                                >UART</span
                            >
                        </el-form-item>
                        <el-form-item label="Picture" prop="img_file">
                            <Upload v-model="form.img_file" />
                        </el-form-item>
                        <el-form-item>
                            <button
                                @click.prevent="requestData"
                                v-loading="isSubmiting"
                            >
                                Apply Now
                            </button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { Form, FormItem } from "element-ui";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Upload from "@/components/Upload";
import { stringToHex } from "@polkadot/util";
export default {
    name: "apply-org",
    components: {
        [Form.name]: Form,
        [FormItem.name]: FormItem,
        Upload,
        Input,
        Textarea,
    },
    data() {
        return {
            isSubmiting: false,
            form: {
                name: "",
                desc: "",
                img_file: [],
                fee: "",
            },
            rules: {
                name: [{ required: true, message: "invalid", trigger: "blur" }],
                desc: [{ required: true, message: "invalid", trigger: "blur" }],
                img_file: [
                    { required: true, message: "invalid", trigger: "change" },
                ],
                fee: [{ required: true, message: "invalid", trigger: "blur" }],
            },
        };
    },
    methods: {
        async requestData() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.isSubmiting = true;
                    this.$http
                        .userPostOrganization({
                            name: this.form.name,
                            desc: this.form.desc,
                            img_file:
                                this.form.img_file.length > 0
                                    ? this.form.img_file
                                    : "",
                            fee: this.form.fee,
                        })
                        .then(async (res) => {
                            await this.registerOrg(res);
                            this.isSubmiting = false;
                            this.$refs["form"].resetFields();
                        })
                        .catch((err) => {
                            console.log(err);
                            this.isSubmiting = false;
                            this.$notify.error("err.head ? err.head.msg : err");
                        });
                }
            });
        },
        async registerOrg(info) {
            await this.$rpc.api.isReady;
            this.isSubmiting = true;
            let extrinsic = await this.$rpc.api.tx.names.update(
                stringToHex(info.name + ""),
                JSON.stringify({
                    desc: info.desc,
                    id: info.id,
                    fee: info.fee,
                    img_file: info.img_file.url,
                })
            );

            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
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
    > .content {
        .el-form-item {
            text-align: left;
            margin-bottom: 75px;
            ::v-deep .el-form-item__label {
                font-size: 18px;
                line-height: 45px;
            }
        }
    }
    button {
        width: 307px;
        height: 75px;
        cursor: pointer;
        background: #020202;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        text-align: center;
        color: #ffffff;
        letter-spacing: 0px;
    }
}
</style>
