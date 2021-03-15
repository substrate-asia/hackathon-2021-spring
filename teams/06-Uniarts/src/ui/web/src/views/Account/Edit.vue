<template>
    <div class="edit container">
        <div class="title">Edit Works</div>
        <el-form
            ref="form"
            :model="form"
            label-width="130px"
            :rules="rules"
            label-position="left"
        >
            <el-form-item label="Name" prop="name">
                <Input v-model="form.name" />
            </el-form-item>
            <el-form-item label="Category" prop="category_id">
                <Select
                    v-model="form.category_id"
                    placeholder="select"
                    :options="categories"
                    optionLabel="title"
                    optionValue="id"
                    optionKey="id"
                ></Select>
            </el-form-item>
            <el-form-item label="Theme" prop="theme_id">
                <Select
                    v-model="form.theme_id"
                    placeholder="select"
                    :options="themes"
                    optionLabel="title"
                    optionValue="id"
                    optionKey="id"
                ></Select>
            </el-form-item>
            <el-form-item label="Material" prop="material_id">
                <Select
                    v-model="form.material_id"
                    placeholder="select"
                    :options="materials"
                    optionLabel="title"
                    optionValue="id"
                    optionKey="id"
                ></Select>
            </el-form-item>
            <el-form-item label="Date" prop="produce_at">
                <DatePicker v-model="form.produce_at" placeholder="select" />
            </el-form-item>
            <el-form-item label="Size" class="size-form-item">
                <el-form-item class="size-length" prop="size_length">
                    <Input
                        class="size-input"
                        style="margin-right: 10px"
                        v-model="form.size_length"
                        type="number"
                    />
                </el-form-item>
                cm X
                <el-form-item class="size-width" prop="size_width">
                    <Input
                        class="size-input"
                        style="margin-left: 10px; margin-right: 10px"
                        v-model="form.size_width"
                        type="number"
                    />
                </el-form-item>
                cm
            </el-form-item>
            <el-form-item label="Price" prop="price">
                <Input v-model="form.price" append="UART" />
            </el-form-item>
            <el-form-item label="Description" prop="details">
                <Textarea
                    v-model="form.details"
                    :minRows="5"
                    :maxRows="5"
                    :rows="5"
                />
            </el-form-item>
            <el-form-item class="main-upload" label="Main">
                <el-form-item class="upload-form-item" prop="img_main_file1">
                    <Upload v-model="form.img_main_file1" />
                </el-form-item>
                <el-form-item class="upload-form-item" prop="img_main_file2">
                    <Upload v-model="form.img_main_file2" />
                </el-form-item>
                <el-form-item class="upload-form-item" prop="img_main_file3">
                    <Upload v-model="form.img_main_file3" />
                </el-form-item>
            </el-form-item>
            <el-form-item class="detail-upload" label="Detail">
                <div class="detail-box">
                    <el-form-item
                        class="upload-form-item"
                        prop="img_detail_file1"
                    >
                        <Upload v-model="form.img_detail_file1" />
                    </el-form-item>
                    <el-form-item
                        class="textarea-form-item"
                        prop="img_detail_file1_desc"
                    >
                        <Textarea
                            placeholder="Enter the Detailed description"
                            v-model="form.img_detail_file1_desc"
                            :rows="10"
                            :minRows="10"
                            :maxRows="10"
                        />
                    </el-form-item>
                </div>
                <div class="detail-box">
                    <el-form-item
                        class="upload-form-item"
                        prop="img_detail_file2"
                    >
                        <Upload v-model="form.img_detail_file2" />
                    </el-form-item>
                    <el-form-item
                        class="textarea-form-item"
                        prop="img_detail_file2_desc"
                    >
                        <Textarea
                            placeholder="Enter the Detailed description"
                            v-model="form.img_detail_file2_desc"
                            :rows="10"
                            :minRows="10"
                            :maxRows="10"
                        />
                    </el-form-item>
                </div>
                <div class="detail-box">
                    <el-form-item
                        class="upload-form-item"
                        prop="img_detail_file3"
                    >
                        <Upload v-model="form.img_detail_file3" />
                    </el-form-item>
                    <el-form-item
                        class="textarea-form-item"
                        prop="img_detail_file3_desc"
                    >
                        <Textarea
                            placeholder="Enter the Detailed description"
                            v-model="form.img_detail_file3_desc"
                            :rows="10"
                            :minRows="10"
                            :maxRows="10"
                        />
                    </el-form-item>
                </div>
                <div class="detail-box">
                    <el-form-item
                        class="upload-form-item"
                        prop="img_detail_file4"
                    >
                        <Upload v-model="form.img_detail_file4" />
                    </el-form-item>
                    <el-form-item
                        class="textarea-form-item"
                        prop="img_detail_file4_desc"
                    >
                        <Textarea
                            placeholder="Enter the Detailed description"
                            v-model="form.img_detail_file4_desc"
                            :rows="10"
                            :minRows="10"
                            :maxRows="10"
                        />
                    </el-form-item>
                </div>
                <div class="detail-box">
                    <el-form-item
                        class="upload-form-item"
                        prop="img_detail_file5"
                    >
                        <Upload v-model="form.img_detail_file5" />
                    </el-form-item>
                    <el-form-item
                        class="textarea-form-item"
                        prop="img_detail_file5_desc"
                    >
                        <Textarea
                            placeholder="Enter the Detailed description"
                            v-model="form.img_detail_file5_desc"
                            :rows="10"
                            :minRows="10"
                            :maxRows="10"
                        />
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item style="width: 100%">
                <el-button
                    class="submit-button"
                    type="primary"
                    @click="onSubmit"
                    v-loading="isSubmiting"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                    >Update</el-button
                >
                <el-button
                    class="cancel-button"
                    @click="$router.push('/account')"
                    >Cancel</el-button
                >
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import { Form, FormItem, Button, Dialog } from "element-ui";
import Input from "@/components/Input";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import Textarea from "@/components/Textarea";
import Upload from "@/components/Upload";
export default {
    name: "upload",
    components: {
        [Form.name]: Form,
        [FormItem.name]: FormItem,
        [Button.name]: Button,
        [Dialog.name]: Dialog,
        Input,
        Select,
        DatePicker,
        Textarea,
        Upload,
    },
    data() {
        let fileValidator = (rule, value, callback) => {
            if (
                !value &&
                !this.form.img_detail_file2[0] &&
                !this.form.img_detail_file3[0]
            ) {
                return callback(new Error("至少上传一张主图"));
            } else {
                callback();
            }
        };
        return {
            id: this.$route.params.id,
            form: {
                name: "",
                category_id: "",
                theme_id: "",
                material_id: "",
                produce_at: "",
                size_length: "",
                size_width: "",
                details: "",
                price: "",
                fee: "",
                img_main_file1: [],
                img_main_file2: [],
                img_main_file3: [],
                img_detail_file1: [],
                img_detail_file2: [],
                img_detail_file3: [],
                img_detail_file4: [],
                img_detail_file5: [],
                img_detail_file1_desc: "",
                img_detail_file2_desc: "",
                img_detail_file3_desc: "",
                img_detail_file4_desc: "",
                img_detail_file5_desc: "",
            },
            isSubmiting: false,
            rules: {
                name: [
                    { required: true, message: "请输入标题", trigger: "blur" },
                ],
                category_id: [
                    {
                        required: true,
                        message: "请选择分类",
                        trigger: "change",
                    },
                ],
                theme_id: [
                    {
                        required: true,
                        message: "请选择主题",
                        trigger: "change",
                    },
                ],
                material_id: [
                    {
                        required: true,
                        message: "请选择材质",
                        trigger: "change",
                    },
                ],
                produce_at: [
                    {
                        required: true,
                        message: "请选择创作日期",
                        trigger: "blur",
                    },
                ],
                size_length: [
                    {
                        required: false,
                        message: "请输入作品长度",
                        trigger: "blur",
                    },
                ],
                size_width: [
                    {
                        required: false,
                        message: "请输入作品宽度",
                        trigger: "blur",
                    },
                ],
                details: [
                    { required: false, message: "请输入说明", trigger: "blur" },
                ],
                price: [
                    { required: false, message: "请输入价格", trigger: "blur" },
                ],
                img_main_file1: [
                    {
                        required: true,
                        validator: fileValidator,
                        trigger: "change",
                    },
                ],
            },
        };
    },
    created() {
        this.requestData();
    },
    computed: {
        categories() {
            return this.$store.state.art.categories;
        },
        materials() {
            return this.$store.state.art.materials;
        },
        themes() {
            return this.$store.state.art.themes;
        },
    },
    methods: {
        requestData() {
            this.$http
                .globalGetArtById({}, { id: this.id })
                .then(async (res) => {
                    this.form.name = res.name;
                    this.form.category_id = res.category_id;
                    this.form.theme_id = res.theme_id;
                    this.form.material_id = res.material_id;
                    this.form.produce_at = res.produce_at * 1000;
                    this.form.size_length = res.size_length;
                    this.form.size_width = res.size_width;
                    this.form.details = res.details;
                    this.form.price = res.price;

                    this.form.img_main_file1 = res.img_main_file1.url && [
                        "",
                        "",
                        res.img_main_file1.url,
                    ];
                    this.form.img_main_file2 = ["", "", res.img_main_file2.url];
                    this.form.img_main_file3 = ["", "", res.img_main_file3.url];

                    this.form.img_detail_file1 = [
                        "",
                        "",
                        res.img_detail_file1.url,
                    ];
                    this.form.img_detail_file2 = [
                        "",
                        "",
                        res.img_detail_file2.url,
                    ];
                    this.form.img_detail_file3 = [
                        "",
                        "",
                        res.img_detail_file3.url,
                    ];
                    this.form.img_detail_file4 = [
                        "",
                        "",
                        res.img_detail_file4.url,
                    ];
                    this.form.img_detail_file5 = [
                        "",
                        "",
                        res.img_detail_file5.url,
                    ];

                    this.form.img_detail_file1_desc = res.img_detail_file1_desc;
                    this.form.img_detail_file2_desc = res.img_detail_file2_desc;
                    this.form.img_detail_file3_desc = res.img_detail_file3_desc;
                    this.form.img_detail_file4_desc = res.img_detail_file4_desc;
                    this.form.img_detail_file5_desc = res.img_detail_file5_desc;
                });
        },
        onSubmit() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.isSubmiting) return;
                    this.isSubmiting = true;
                    let obj = {
                        name: this.form.name,
                        category_id: this.form.category_id,
                        theme_id: this.form.theme_id,
                        material_id: this.form.material_id,
                        produce_at: this.form.produce_at / 1000,
                        size_length: this.form.size_length,
                        size_width: this.form.size_width,
                        details: this.form.details,
                        price: this.form.price,
                        img_main_file1: this.form.img_main_file1[0]
                            ? this.form.img_main_file1
                            : "",
                        img_main_file2: this.form.img_main_file2[0]
                            ? this.form.img_main_file2
                            : "",
                        img_main_file3: this.form.img_main_file3[0]
                            ? this.form.img_main_file3
                            : "",
                        img_detail_file1: this.form.img_detail_file1[0]
                            ? this.form.img_detail_file1
                            : "",
                        img_detail_file2: this.form.img_detail_file2[0]
                            ? this.form.img_detail_file2
                            : "",
                        img_detail_file3: this.form.img_detail_file3[0]
                            ? this.form.img_detail_file3
                            : "",
                        img_detail_file4: this.form.img_detail_file4[0]
                            ? this.form.img_detail_file4
                            : "",
                        img_detail_file5: this.form.img_detail_file5[0]
                            ? this.form.img_detail_file5
                            : "",
                        img_detail_file1_desc: this.form.img_detail_file1_desc,
                        img_detail_file2_desc: this.form.img_detail_file2_desc,
                        img_detail_file3_desc: this.form.img_detail_file3_desc,
                        img_detail_file4_desc: this.form.img_detail_file4_desc,
                        img_detail_file5_desc: this.form.img_detail_file5_desc,
                    };
                    if (!this.form.img_main_file1[0]) {
                        if (this.form.img_main_file2[0]) {
                            obj.img_main_file1 = this.form.img_main_file2;
                            obj.img_main_file2 = this.form.img_main_file3[0]
                                ? this.form.img_main_file3
                                : "";
                            obj.img_main_file3 = "";
                        } else if (this.form.img_main_file3[0]) {
                            obj.img_main_file1 = this.form.img_main_file3;
                            obj.img_main_file2 = "";
                            obj.img_main_file3 = "";
                        }
                    } else {
                        (obj.img_main_file1 = this.form.img_main_file1[0]
                            ? this.form.img_main_file1
                            : ""),
                            (obj.img_main_file2 = this.form.img_main_file2[0]
                                ? this.form.img_main_file2
                                : ""),
                            (obj.img_main_file3 = this.form.img_main_file3[0]
                                ? this.form.img_main_file3
                                : "");
                    }
                    this.$http
                        .userPostEditArt(obj)
                        .then(() => {
                            this.isSubmiting = false;
                            this.$notify.success("Submitted");
                            this.resetForm();
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
.edit {
    padding: 40px;
    padding-top: 70px;
    padding-left: 0px;
    padding-right: 0px;
    text-align: left;
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
}
.el-form {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}
.el-form-item {
    width: 40%;
    margin-right: 10%;
    margin-bottom: 50px;
    ::v-deep .el-form-item__label {
        font-size: 17px;
        font-weight: 400;
        text-align: center;
        color: #020202;
        letter-spacing: 0px;
    }
    .size-input {
        width: 90px;
    }
}
.size-form-item {
    .size-length,
    .size-width {
        width: 90px;
        margin-right: 10px;
        display: inline-block;
        margin-bottom: 0;
    }
    ::v-deep .el-form-item__content {
        font-size: 17px;
        font-weight: 400;
        color: #020202;
        letter-spacing: 0px;
    }
}
.main-upload {
    width: 100%;
    ::v-deep .el-form-item__content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
    .uni-upload {
        width: 300px;
    }
    .upload-form-item {
        width: 300px;
        margin-right: 0;
        margin-bottom: 0;
    }
    .textarea-form-item {
        margin-right: 0;
        width: calc(100% - 300px);
    }
}
.detail-upload {
    width: 100%;
    .detail-box {
        width: 100%;
        display: flex;
        align-items: center;
        .uni-upload {
            width: 300px;
        }
        .upload-form-item {
            width: 300px;
            margin-right: 0;
        }
        .textarea-form-item {
            margin-right: 0;
            width: calc(100% - 300px);
        }
    }
}

.el-button.cancel-button {
    height: 65px;
    width: 300px;
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
    width: 300px;
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
