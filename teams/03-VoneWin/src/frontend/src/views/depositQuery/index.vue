<!--
 * @Description:存证查询
 * @Author: 龙春雨
 * @Date: 2021-03-02 09:43:54
-->
<template>
  <div class="content deposit-query">
    <h2>证据查询</h2>
    <div class="search-form-wrapper">
      <el-form ref="form"
               :model="form"
               class="search-form"
               label-width="0">
        <el-form-item>
          <el-input v-model="form.keyword"
                    placeholder="存证/证据 编号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.verification"
                    placeholder="验证码">
            <template #append>
              <div class="verification-img">
                <img src="https://www.vonedao.com/code?randomStr=79041615715400910" />

              </div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="search-btn"
                     @click="getProofBook"
                     :loading="loading">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="hash"
         v-if="!tx_hash && !img">
      区块链交易哈希: <a href="#">{{tx_hash || '无'}}</a>
      <copy :text="tx_hash" />
      <div class="certificate">
        <img :src="img"
             v-if="img" />
      </div>
    </div>
  </div>
</template>

<script>
import { getProofBook } from '@/api/index';
import { ElMessage } from 'element-plus';
import copy from '@/components/copy';
export default {
  name: 'DepositQuery',
  data() {
    return {
      form: {
        keyword: '',
        verification: ''
      },
      loading: false,
      img: '',
      tx_hash: 'fdafdafdaf'
    };
  },
  components: {
    copy
  },
  methods: {
    async getProofBook() {
      try {
        if (!this.form.keyword) {
          ElMessage.warning('请输入存证/证据 编号!');
          return false;
        }
        if (!this.form.verification) {
          ElMessage.warning('请输入验证码!');
          return false;
        }
        this.loading = true;
        let res = await getProofBook(this.form.keyword);
        this.img = res.proof_book || '';
        this.tx_hash = res.tx_hash;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    }
  }
};
</script>

<style lang="scss">
.deposit-query {
  background-color: white;
  margin-top: 86px;
  padding: 10px 0 60px 0;
  text-align: center;
  h2 {
    text-align: center;
    font-size: 24px;
    padding: 15px 0;
  }
  .search-form-wrapper {
    .search-form {
      width: 600px;
      margin: 0 auto;
    }
    border-bottom: 1px solid #f2f1f1;
    padding-bottom: 19px;
  }
  .el-input {
    input {
      height: 44px;
      border: 1px solid #f2f1f1;
      border-radius: 3px;
      &::placeholder {
        color: #666;
      }
    }
  }
  .el-input-group__append {
    padding: 0 0 0 10px;
    border: none;
    background-color: white;
    .verification-img {
      width: 90px;
      height: 44px;
      background-color: #ccc;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
  .search-btn {
    display: block;
    height: 44px;
    width: 100%;
    color: white;
    background-color: $primaryColor;
    font-size: 18px;
  }
  .hash {
    padding: 30px 0;
  }
  .certificate {
    width: 423px;
    height: 598px;
    background-color: #f1f1f1;
    margin: 0 auto;
    margin-top: 20px;
    line-height: 598px;
    img {
      display: block;
      width: 100%;
    }
  }
}
</style>