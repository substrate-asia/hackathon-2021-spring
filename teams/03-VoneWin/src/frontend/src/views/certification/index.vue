<!--
 * @Description:实名制认证
 * @Author: 龙春雨
 * @Date: 2021-03-10 14:06:09
-->
<template>
  <div class="certification content">
    <header>实名制认证</header>
    <el-form ref="form"
             :model="form"
             :rules="rules"
             :disabled="loading || disabled"
             label-width="140px">
      <el-form-item label="姓名"
                    prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="身份证号"
                    prop="identityNumber">
        <el-input v-model="form.identityNumber"></el-input>
      </el-form-item>
      <el-form-item label="上传身份证正面"
                    prop="positive">
        <el-upload class="avatar-uploader"
                   :action="uploadApi"
                   name="upfile"
                   :show-file-list="false"
                   :headers="headers"
                   :on-success="handlePositive">
          <img v-if="form.positive"
               :src="form.positive"
               class="avatar">
          <i v-else
             class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="上传身份证反面"
                    prop="negativeSide">
        <el-upload class="avatar-uploader"
                   :action="uploadApi"
                   name="upfile"
                   :show-file-list="false"
                   :headers="headers"
                   :on-success="handleNegativeSide">
          <img v-if="form.negativeSide"
               :src="form.negativeSide"
               class="avatar">
          <i v-else
             class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item v-if="!disabled">
        <div class="form-footer">
          <el-button type="primary"
                     :loading="loading"
                     @click="onSubmit">提交</el-button>
          <el-button :loading="loading"
                     @click="resetForm">重置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getStore, setStore } from '@/util/store';
export default {
  name: 'certification',
  data() {
    return {
      form: {
        positive: '',
        negativeSide: '',
        name: '',
        identityNumber: ''
      },
      disabled: false,
      rules: {
        positive: [
          {
            required: true,
            message: '请上传身份证正面!',
            trigger: 'change'
          }
        ],
        negativeSide: [
          {
            required: true,
            message: '请上传身份证反面!',
            trigger: 'change'
          }
        ],
        name: [
          {
            required: true,
            message: '请填写姓名!',
            trigger: 'change'
          }
        ],
        identityNumber: [
          {
            required: true,
            message: '请填写身份证号!',
            trigger: 'change'
          }
        ]
      },
      loading: false,
      headers: {
        Authorization: ''
      }
    };
  },
  mounted() {
    this.headers.Authorization = 'Bearer ' + getStore({ name: 'api_token' });
    let data = getStore({ name: 'certification' });
    if (data) {
      this.form = data;
      this.disabled = true;
    }
  },
  methods: {
    resetForm() {
      this.$refs.form.resetFields();
    },
    onSubmit() {
      let _this = this;
      this.$refs.form.validate(valid => {
        if (valid) {
          _this.loading = true;
          setTimeout(() => {
            setStore({ name: 'certification', content: _this.form });
            _this.loading = false;
          }, 1500);
        } else {
          return false;
        }
      });
    },
    handlePositive(res) {
      this.form.positive = res.data.file_path;
    },
    handleNegativeSide(res) {
      this.form.negativeSide = res.data.file_path;
    }
  }
};
</script>

<style lang="scss" scoped>
.certification {
  background-color: white;
  margin-top: 82px;
  padding: 30px;
  header {
    font-size: 24px;
    color: $--color-text-primary;
    border-bottom: 1px solid #f2f1f1;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .avatar-uploader {
    ::v-deep .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      &:hover {
        border-color: #409eff;
      }
    }
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 220px;
    height: 290px;
    line-height: 290px;
    text-align: center;
  }
  .avatar {
    width: 220px;
    height: 290px;
    display: block;
  }
}
</style>