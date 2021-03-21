<template>
    <div class="profile container">
        <div class="title">Personal Account</div>
        <div class="body">
            <el-form
                ref="form"
                :model="form"
                @submit.prevent="onSubmit"
                :rules="rules"
                label-position="right"
            >
                <el-form-item
                    label="Head image"
                    prop="avatar"
                    label-width="190px"
                    class="avatar-form-item"
                >
                    <div class="avatar" @click="uploadAvatar">
                        <AdaptiveImage
                            :url="
                                form.avatar.length > 0 ? form.avatar[2] : yin_2x
                            "
                        />
                        <div class="mask">Upload</div>
                        <Upload
                            ref="upload"
                            v-show="false"
                            v-model="form.avatar"
                        />
                    </div>
                    <button
                        v-if="form.avatar.length <= 0"
                        @click.prevent="uploadAvatar"
                    >
                        choose
                    </button>
                </el-form-item>
                <el-form-item
                    class="gender-form-item"
                    label="Gender"
                    label-width="251px"
                    prop="sex"
                >
                    <el-radio v-model="form.sex" label="1">Men</el-radio>
                    <el-radio v-model="form.sex" label="2">Women</el-radio>
                </el-form-item>
                <el-form-item
                    label="Nickname"
                    prop="display_name"
                    label-width="190px"
                >
                    <Input v-model="form.display_name" />
                </el-form-item>
                <el-form-item label-width="251px"></el-form-item>
                <el-form-item
                    label="Phone"
                    prop="phone_number"
                    :style="`margin-bottom: ${isActivedPhone ? '' : '30px'}`"
                    label-width="190px"
                >
                    <Input
                        :disabled="isActivedPhone"
                        v-model="form.phone_number"
                        type="number"
                    />
                </el-form-item>
                <el-form-item label-width="251px"></el-form-item>
                <el-form-item
                    prop="token"
                    v-if="!isActivedPhone"
                    label-width="190px"
                >
                    <Input
                        style="width: 200px"
                        placeholder="Code"
                        v-model="form.token"
                        type="number"
                    />
                    <button
                        @click.prevent="sendCode"
                        v-loading="sending"
                        class="code-send"
                    >
                        Send
                    </button>
                </el-form-item>
                <el-form-item
                    label-width="251px"
                    v-if="!isActivedPhone"
                ></el-form-item>
                <el-form-item
                    label="College"
                    prop="college"
                    label-width="190px"
                >
                    <Input v-model="form.college" />
                </el-form-item>
                <el-form-item
                    label="Residential Address"
                    prop="residential_address"
                    label-width="251px"
                >
                    <Input v-model="form.residential_address" />
                </el-form-item>
                <el-form-item
                    label="Profile"
                    class="profile-form-item"
                    label-width="190px"
                    style="width: 95%"
                    prop="desc"
                >
                    <Textarea
                        v-model="form.desc"
                        :minRows="7"
                        :maxRows="7"
                        :rows="7"
                    />
                </el-form-item>
                <el-form-item
                    label="Real name"
                    prop="real_name"
                    label-width="190px"
                >
                    <Input v-model="form.real_name" />
                </el-form-item>
                <el-form-item
                    label-width="251px"
                    label="ID Number"
                    prop="id_document_number"
                >
                    <Input v-model="form.id_document_number" type="number" />
                </el-form-item>
                <el-form-item
                    label="Description of Recommendation"
                    class="desc-form-item"
                    label-width="190px"
                    style="width: 95%"
                    prop="artist_desc"
                >
                    <Textarea
                        v-model="form.artist_desc"
                        :minRows="7"
                        :maxRows="7"
                        :rows="7"
                    />
                </el-form-item>
                <el-form-item
                    label="Photo image"
                    prop="recommend_image"
                    label-width="190px"
                    class="photo-form-item"
                >
                    <div class="photo" @click="uploadPhoto">
                        <AdaptiveImage
                            width="133px"
                            height="176px"
                            isBorder="false"
                            :url="
                                form.recommend_image.length > 0
                                    ? form.recommend_image[2]
                                    : photo_image
                            "
                        />
                        <div class="mask">Upload</div>
                        <Upload
                            ref="uploadPhoto"
                            v-show="false"
                            v-model="form.recommend_image"
                        />
                    </div>
                    <button
                        v-if="form.recommend_image.length <= 0"
                        @click.prevent="uploadPhoto"
                    >
                        choose
                    </button>
                </el-form-item>
                <el-form-item style="width: 100%" label-width="190px">
                    <el-button
                        class="submit-button"
                        type="primary"
                        @click="onSubmit"
                        v-loading="isSubmiting"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(0, 0, 0, 0.8)"
                        >Save</el-button
                    >
                    <el-button
                        class="cancel-button"
                        @click="$router.push('/account')"
                        >Cancel</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import AdaptiveImage from "@/components/AdaptiveImage";
import Upload from "@/components/Upload";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Button, Form, FormItem, Radio } from "element-ui";
import yin_2x from "@/assets/images/yin@2x.png";
import photo_image from "@/assets/images/photo_image@2x.png";

export default {
    name: "profile",
    components: {
        AdaptiveImage,
        Upload,
        Input,
        Textarea,
        [Button.name]: Button,
        [Form.name]: Form,
        [FormItem.name]: FormItem,
        [Radio.name]: Radio,
    },
    data() {
        var validatePhoneNumber = (rule, value, callback) => {
            if (this.isActivedPhone) {
                callback();
            } else if (
                !/^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/.test(
                    value
                )
            ) {
                callback(new Error("Wrong format of phone number"));
            } else {
                callback();
            }
        };
        var validateCode = (rule, value, callback) => {
            if (this.isActivedPhone) {
                callback();
            } else if (!/^[0-9]{6}$/.test(value)) {
                callback(new Error("Verification code error"));
            } else {
                callback();
            }
        };
        var validateIDCard = (rule, value, callback) => {
            if (!value) {
                callback();
            } else if (
                !/^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
                    value
                )
            ) {
                callback(new Error("ID card number error"));
            } else {
                callback();
            }
        };
        return {
            yin_2x,
            photo_image,
            isSubmiting: false,
            sending: false,
            isActivedPhone: false,
            form: {
                avatar: [],
                recommend_image: [],
                artist_desc: "",
                display_name: "",
                desc: "",
                sex: "",
                residential_address: "",
                college: "",
                real_name: "",
                token: "",
                phone_number: "",
                id_document_number: "",
            },
            rules: {
                display_name: [
                    {
                        required: false,
                        message: "Please enter the title",
                        trigger: "blur",
                    },
                ],
                sex: [
                    {
                        required: false,
                        message: "Please select gender",
                        trigger: "blur",
                    },
                ],
                desc: [
                    {
                        required: false,
                        message: "Please enter a profile",
                        trigger: "blur",
                    },
                ],
                residential_address: [
                    {
                        required: false,
                        message: "Please enter the place of residence",
                        trigger: "blur",
                    },
                ],
                college: [
                    {
                        required: false,
                        message: "Please enter graduate school",
                        trigger: "blur",
                    },
                ],
                artist_desc: [
                    {
                        required: false,
                        message: "Please enter the artist profile",
                        trigger: "blur",
                    },
                ],
                real_name: [
                    {
                        required: false,
                        message: "please enter your real name",
                        trigger: "blur",
                    },
                ],
                phone_number: [
                    {
                        required: true,
                        validator: validatePhoneNumber,
                        trigger: "blur",
                    },
                ],
                token: [
                    {
                        required: true,
                        validator: validateCode,
                        trigger: "blur",
                    },
                ],
                id_document_number: [
                    {
                        required: false,
                        validator: validateIDCard,
                        trigger: "blur",
                    },
                ],
                avatar: [
                    {
                        required: false,
                        message: "Please upload an avatar",
                        trigger: "change",
                    },
                ],
                recommend_image: [
                    {
                        required: false,
                        message: "Please upload an artist profile picture",
                        trigger: "change",
                    },
                ],
            },
        };
    },
    created() {
        this.requestData();
    },
    methods: {
        uploadAvatar() {
            this.$refs.upload.$el.click();
        },
        uploadPhoto() {
            this.$refs.uploadPhoto.$el.click();
        },
        sendCode() {
            if (this.sending) return;
            this.$refs["form"].validateField("phone_number", (err) => {
                if (!err) {
                    this.sending = true;
                    this.$http
                        .userPostPhoneCode({
                            phone_number: "86" + this.form.phone_number,
                        })
                        .then(() => {
                            this.sending = false;
                            this.$notify.success("Successfully sent");
                        })
                        .catch((err) => {
                            this.sending = false;
                            this.$notify.error(err.head && err.head.msg);
                        });
                }
            });
        },
        requestData() {
            this.$http
                .userGetUserInfo({})
                .then((res) => {
                    this.form.avatar = res.avatar.url
                        ? [null, null, res.avatar.url]
                        : [];
                    this.form.display_name = res.display_name
                        ? res.display_name
                        : "";
                    this.form.residential_address = res.residential_address
                        ? res.residential_address
                        : "";
                    this.form.college = res.college ? res.college : "";
                    this.form.desc = res.desc ? res.desc : "";
                    this.form.artist_desc = res.artist_desc
                        ? res.artist_desc
                        : "";
                    this.form.recommend_image = res.recommend_image.url
                        ? [null, null, res.recommend_image.url]
                        : [];
                    this.form.sex = res.sex ? res.sex + "" : null;
                    this.form.real_name = res.real_name;
                    this.form.phone_number = res.phone_number;
                    this.isActivedPhone = res.phone_number ? true : false;
                    this.form.id_document_number = res.id_document_number;
                })
                .catch((err) => {
                    console.log(err);
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        onSubmit() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.isSubmiting) return;
                    this.isSubmiting = true;
                    let obj = {
                        avatar:
                            this.form.avatar.length > 0 && this.form.avatar[0]
                                ? this.form.avatar
                                : "",
                        recommend_image:
                            this.form.recommend_image.length > 0 &&
                            this.form.recommend_image[0]
                                ? this.form.recommend_image
                                : "",
                        display_name: this.form.display_name
                            ? this.form.display_name
                            : "",
                        residential_address: this.form.residential_address
                            ? this.form.residential_address
                            : "",
                        college: this.form.college ? this.form.college : "",
                        desc: this.form.desc ? this.form.desc : "",
                        artist_desc: this.form.artist_desc
                            ? this.form.artist_desc
                            : "",
                        sex: this.form.sex ? this.form.sex : "",
                        real_name: this.form.real_name
                            ? this.form.real_name
                            : "",
                        phone_number: this.form.phone_number
                            ? this.isActivedPhone
                                ? this.form.phone_number
                                : "86" + this.form.phone_number
                            : "",
                        id_document_number: this.form.id_document_number
                            ? this.form.id_document_number
                            : "",
                    };
                    if (!this.isActivedPhone) {
                        obj.token = this.form.token ? this.form.token : "";
                    }
                    this.$http
                        .userPostChangeUserInfo(obj)
                        .then(() => {
                            this.isSubmiting = false;
                            this.$notify.success("Submitted");
                            this.resetForm();
                            this.$router.push("/account");
                        })
                        .catch((err) => {
                            console.log(err);
                            this.isSubmiting = false;
                            this.$notify.error(err.head ? err.head.msg : err);
                        });
                }
            });
        },
        resetForm() {
            this.$refs.form.resetFields();
        },
    },
};
</script>
<style lang="scss" scoped>
.profile {
    padding: 40px;
    padding-top: 70px;
    padding-left: 0px;
    padding-right: 0px;
    text-align: left;
    margin-bottom: 70px;
    > .title {
        font-family: "Broadway";
        font-size: 38px;
        font-weight: 400;
        text-align: left;
        color: #020202;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 83px;
    }
    .photo,
    .avatar {
        width: 124px;
        height: 124px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        .mask {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transition: opacity 0.3s ease;
            background-color: rgba(4, 4, 4, 0.6);
            color: white;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    .photo {
        height: 176px;
        width: 133px;
        border-radius: 0;
    }
    .photo:hover,
    .avatar:hover {
        .mask {
            opacity: 1;
        }
    }
}

.el-form {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}
.el-form-item {
    width: 45%;
    margin-right: 5%;
    margin-bottom: 60px;
    ::v-deep .el-form-item__label {
        font-size: 18px;
        font-weight: 400;
        color: #020202;
        min-width: 130px;
        padding-right: 60px;
        letter-spacing: 0px;
    }

    .el-radio {
        ::v-deep .el-radio__label {
            font-size: 17px;
            font-weight: 400;
            color: #020202;
            letter-spacing: 0px;
        }
        ::v-deep .el-radio__inner::after {
            background-color: transparent;
        }
        ::v-deep .el-radio__inner.is-checked {
            background-color: #020202;
            border-color: #020202;
        }

        ::v-deep .el-radio__inner {
            border-color: #b7b7b7;
        }
    }
    .code-send {
        font-size: 18px;
        font-weight: 400;
        color: #020202;
        width: 90px;
        height: 45px;
        cursor: pointer;
        letter-spacing: 0px;
        background: transparent;
        outline: none;
        border: none;
        ::v-deep .el-loading-spinner {
            margin-top: -20px;
        }
    }
}
.gender-form-item {
    ::v-deep .el-form-item__label {
        min-width: 190px;
    }
}
.avatar-form-item ::v-deep .el-form-item__content {
    display: flex;
    align-items: flex-end;
    button {
        margin-left: 35px;
        margin-bottom: 15px;
        background: #272727;
        font-size: 15px;
        font-weight: 400;
        text-align: center;
        letter-spacing: 0px;
        color: white;
        padding: 5px 15px;
        border-radius: 6px;
        cursor: pointer;
    }
}
.photo-form-item ::v-deep .el-form-item__content {
    display: flex;
    align-items: flex-end;
    button {
        margin-left: 35px;
        background: #272727;
        font-size: 15px;
        font-weight: 400;
        text-align: center;
        letter-spacing: 0px;
        color: white;
        padding: 5px 15px;
        border-radius: 6px;
        cursor: pointer;
    }
}
.desc-form-item ::v-deep .el-form-item__label {
    text-align: left;
}

.input-box {
    width: 290px;
}

.el-button.cancel-button {
    height: 65px;
    width: 290px;
    background: transparent;
    border: 2px solid #020202;
    font-size: 18px;
    border-radius: 0;
    font-weight: 600;
    text-align: center;
    color: #020202;
    letter-spacing: 0px;
    ::v-deep .el-loading-spinner {
        margin-top: -7px;
    }
}
.el-button.submit-button {
    height: 65px;
    width: 290px;
    margin-right: 30px;
    border-radius: 0;
    background: #020202;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    color: #ffffff;
    letter-spacing: 0px;
    ::v-deep .el-loading-spinner {
        margin-top: -7px;
    }
}
</style>
