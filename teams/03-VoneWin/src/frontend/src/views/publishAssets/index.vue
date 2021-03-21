<!--
 * @Description:发布资源
 * @Author: 龙春雨
 * @Date: 2021-03-09 09:28:29
-->
<template>
  <div class="submit-assets content">
    <header>发布资产</header>
    <el-form ref="form"
             :model="form"
             :rules="formRules"
             :disabled="loading"
             label-width="80px">
      <el-form-item label="资产名称"
                    prop="asset_name">
        <el-input v-model="form.asset_name"></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="资产类型"
                        prop="asset_type">
            <el-select v-model="form.asset_type"
                       placeholder="请选择">
              <el-option :label="item.label"
                         v-for="item in assetsType"
                         :key="item.value"
                         :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产分类"
                        prop="category_id">
            <el-select v-model="form.category_id"
                       placeholder="请选择">
              <el-option :label="item.label"
                         v-for="item in categoryList"
                         :key="item.value"
                         :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述"
                    prop="describe">
        <el-input v-model="form.describe"
                  type="textarea"
                  :rows="2"></el-input>
      </el-form-item>
      <el-form-item label="标签"
                    prop="tag">
        <el-tag :key="tag"
                v-for="tag in form.tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)">
          {{tag}}
        </el-tag>
        <el-input class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm">
        </el-input>
        <el-button v-else
                   class="button-new-tag"
                   size="small"
                   @click="showInput">+ 新增</el-button>
      </el-form-item>
      <el-form-item label="出售价格"
                    prop="price">
        <el-input-number v-model="form.price"
                         controls-position="right"></el-input-number>
      </el-form-item>
      <el-form-item label="封面照片"
                    prop="cover">
        <el-upload class="avatar-uploader"
                   :action="uploadApi"
                   name="upfile"
                   :show-file-list="false"
                   :headers="headers"
                   :on-success="handleAvatarSuccess"
                   :before-upload="beforeAvatarUpload">
          <img v-if="form.cover"
               :src="form.cover"
               class="avatar">
          <i v-else
             class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="资产附件"
                    prop="upload_file">
        <el-upload class="upload-demo"
                   :action="uploadApi"
                   :headers="headers"
                   name="upfile"
                   :on-remove="handleRemove"
                   :on-success="handleSuccess"
                   :before-remove="beforeRemove"
                   :file-list="form.upload_file">
          <el-button size="small"
                     type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              附件中必须包含作品源文件、可证明作品版权归属当前登录用户的材料，如创作过程视频或其他材料，否则平台资产网关节点将审核不通过
              <div>1、文件名最多可以有50个字符</div>
              <div>2、文件名不能出现特殊字符</div>
              <div>3、文件大小不能超出50M</div>
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item>
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
import { addAssets } from '@/api/index';
import { getStore } from '@/util/store';
import { categoryList, assetsType } from '@/assets/const/categoryList';
export default {
  name: 'PublishAssets',
  data() {
    return {
      form: {
        asset_name: '', //资产名称
        asset_type: 1, //1-版权，2-使用权
        category_id: '', // 大类
        describe: '', // 描述
        tag: [], // 标签
        price: 0, //价格
        cover: '', // 封面
        upload_file: [] // 附件
      },
      formRules: {
        asset_name: [
          {
            required: true,
            message: '请填写资产名称!',
            trigger: 'blur'
          }
        ],
        asset_type: [
          {
            required: true,
            message: '请选择资产类型!',
            trigger: 'change'
          }
        ],
        category_id: [
          {
            required: true,
            message: '请选择资产分类!',
            trigger: 'change'
          }
        ],
        describe: [
          {
            required: true,
            message: '请填写描述!',
            trigger: 'change'
          }
        ],
        price: [
          {
            required: true,
            message: '请填写出售价格!',
            trigger: 'change'
          }
        ],
        cover: [
          {
            required: true,
            message: '请上传封面!',
            trigger: 'change'
          }
        ],
        upload_file: [
          {
            required: true,
            message: '请上传附件!',
            trigger: 'change'
          }
        ]
      },
      loading: false,
      inputVisible: false,
      inputValue: '',
      headers: {
        Authorization: ''
      },
      categoryList: Object.freeze(categoryList) || [],
      assetsType: Object.freeze(assetsType) || []
    };
  },
  methods: {
    handleClose(tag) {
      this.form.tag.splice(this.form.tag.indexOf(tag), 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.form.tag.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    handleAvatarSuccess(res) {
      this.form.cover = res.data.file_path;
    },
    handleSuccess(res) {
      let { file_name, file_path, file_hash, file_size, id } = res.data;
      this.form.upload_file.push({
        name: file_name,
        url: file_path,
        file_name,
        id,
        file_path,
        file_hash,
        file_size
      });
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 1;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 1MB!');
      }
      return isJPG && isLt2M;
    },
    handleRemove(file, fileList) {
      this.form.upload_file = fileList;
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = JSON.parse(JSON.stringify(this.form));
          params.tag = params.tag.join(',');
          // params.upload_file = JSON.stringify(params.upload_file);
          params.owner = getStore({ name: 'userId' });
          params.user_id = params.owner;
          params.price = params.price.toString();
          params.category_id = parseInt(params.category_id);
          let upload_file = params.upload_file.map(item => {
            return item.id;
          });
          params.upload_file = upload_file;
          // params.sub_category_id = 2;
          this.loading = true;
          this.addAssets(params);
        } else {
          return false;
        }
      });
    },
    async addAssets(params) {
      try {
        await addAssets(params);
        this.$message.success('提交成功！');
        this.loading = false;
        this.$router.push('/myAssets');
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    },
    resetForm() {
      this.$refs.form.resetFields();
    }
    // async getCategoryList() {
    //   try {
    //     let res = await getCategoryList();
    //     this.categoryList = res;
    //   } catch (err) {
    //     throw new Error(err);
    //   }
    // }
  },
  mounted() {
    // this.getCategoryList();
    this.headers.Authorization = 'Bearer ' + getStore({ name: 'api_token' });
  }
};
</script>

<style lang="scss" scoped>
.submit-assets {
  background-color: white;
  margin-top: 86px;
  padding: 30px;
  header {
    font-size: 24px;
    color: $--color-text-primary;
    border-bottom: 1px solid #f2f1f1;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .el-upload__tip {
    line-height: 25px;
  }
}
.el-tag {
  margin-right: 10px;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  vertical-align: bottom;
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
.form-footer {
  text-align: center;
  padding-top: 20px;
}
</style>