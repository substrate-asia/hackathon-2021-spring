<!--
 * @Description:搜索组件
 * @Author: 龙春雨
 * @Date: 2021-03-14 17:16:02
-->
<template>
  <div class="search">
    <el-input placeholder="请输入关键词，点击搜索按钮进行检索"
              v-model="form.keyWord"
              class="input-with-select">
      <template #prepend>
        <el-select v-model="form.category_id"
                   placeholder="请选择">
          <el-option label="全部"
                     key="all"
                     value=""></el-option>
          <el-option :label="item.label"
                     v-for="item in categoryList"
                     :key="item.value"
                     :value="item.value"></el-option>
        </el-select>
      </template>
      <template #append>
        <el-button icon="el-icon-search"
                   @click="searchChange"></el-button>
      </template>
    </el-input>
  </div>
</template>

<script>
import { categoryList } from '@/assets/const/categoryList';
export default {
  name: 'searchHeader',
  data() {
    return {
      categoryList: categoryList,
      form: {
        category_id: '',
        keyWord: ''
      }
    };
  },
  methods: {
    searchChange() {
      let { keyWord, category_id } = this.form;
      this.$router.push(
        `/tradingCenter?keyword=${keyWord}&category_id=${category_id}`
      );
    }
  }
};
</script>

<style lang="scss">
$height: 56px;
.search {
  background-color: white;
  margin-top: $height;
  text-align: center;
  padding: 20px 0;
  .input-with-select {
    width: 800px;
    margin: 0 auto;
  }
  .el-input-group__prepend,
  .el-input__inner,
  .el-input-group__append {
    border: none;
    background: #f2f1f1;
  }
  > .el-input {
    > .el-input__inner {
      padding-left: 0;
    }
  }
  .el-input-group__prepend {
    .el-input--suffix {
      .el-input__inner {
        width: 110px;
        color: $--color-text-primary;
        font-weight: normal;
      }
      .el-select__caret {
        color: $--color-text-primary;
        font-weight: normal;
      }
    }
  }
  .el-icon-search {
    font-weight: bold;
    color: $--color-text-primary;
  }
}
</style>