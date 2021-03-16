<!--
 * @Description:提交订单
 * @Author: 龙春雨
 * @Date: 2021-02-24 16:25:16
-->
<template>
  <div class="content">
    <div class="assets-wrapper">
      <header>确认订单信息<span>请在30分钟内完成支付，否则订单会被自动取消</span></header>
      <!-- 商品列表 -->
      <el-table :data="tableData"
                class="custom-table"
                :border="false"
                style="width: 100%">
        <el-table-column prop="proBase"
                         label="店铺宝贝">
          <template v-slot>
            <div class="flex pro-info">
              <el-image src="http://benyouhuifile.it168.com/forum/201109/10/0839430h1rree07zvkr188.jpg"
                        class="flex-0"
                        fit="cover"></el-image>
              <div class="flex-1">
                <div class="name">{{tableData[0] ? tableData[0].asset_name : ''}}</div>
                <div class="store flex">
                  <div class="avatar flex-0">
                    <img src="https://resource.jinse.com/www/v3/img/logo.svg?v=2012" />
                  </div>
                  <div class="store-name flex-1">
                    上海旺链信息科技有限公司
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="asset_type_label"
                         label="资产类型"
                         width="180">
        </el-table-column>
        <el-table-column prop="category_label"
                         label="资产分类"
                         width="180">
        </el-table-column>
        <el-table-column prop="price"
                         label="单价"
                         width="180">
          <template v-slot="{row}">
            <div class="money">{{row.price}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="discount"
                         width="180"
                         label="优惠方式">
          <template v-slot>
            无优惠
          </template>
        </el-table-column>
        <el-table-column prop="total"
                         width="180"
                         align="right"
                         label="小计">
          <template v-slot="{row}">
            <div class="money">{{row.price}}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 订单操作 -->
    <div class="border-tool flex">
      <div>
        实付金额:
        <span class="money">{{total}}</span>
      </div>
      <el-button type="primary"
                 @click="submitOrder">提交订单</el-button>
    </div>
    <pay-dialog v-model:visible="dialogVisible"
                :alice="alice"
                :token_id="tableData[0] ? tableData[0].token_id : ''"
                :price="tableData[0] ? tableData[0].price : '0'" />
  </div>
</template>

<script>
import payDialog from './components/payDialog';
import { getAssetsDetail } from '@/api/index';
import { categoryList, assetsType } from '@/assets/const/categoryList';
import { getLabelByValue } from '@/util/index';
export default {
  name: 'submitOrder',
  data() {
    return {
      tableData: [],
      total: '',
      dialogVisible: false
    };
  },
  components: {
    payDialog
  },
  props: {
    alice: {
      type: Object,
      default: () => {}
    }
  },
  mounted() {
    if (this.$route.params.id) {
      this.getDetail(this.$route.params.id);
    }
  },
  methods: {
    submitOrder() {
      this.dialogVisible = true;
    },
    async getDetail(id) {
      try {
        this.loading = true;
        let res = await getAssetsDetail(id);
        res.tag = res.tag.split(',');
        res.asset_type_label = getLabelByValue(assetsType, res.asset_type);
        res.category_label = getLabelByValue(categoryList, res.category_id);
        this.tableData.push(res);
        this.total = res.price;
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
.assets-wrapper {
  background-color: white;
  min-height: 600px;
  margin-top: 62px;
  padding: 20px;
  header {
    font-size: 24px;
    color: $--color-text-primary;
    border-bottom: 1px solid #f2f1f1;
    padding: 20px 0;
    span {
      font-size: 14px;
      color: #666666;
      padding-left: 10px;
    }
  }
}

.pro-info {
  align-items: center;
  .el-image {
    width: 45px;
    height: 60px;
  }
  > div.flex-1 {
    padding-left: 10px;
    .name {
      font-size: 16px;
      color: $--color-text-primary;
    }
  }
  .store {
    align-items: center;
    // padding-top: 5px;
  }
  .avatar {
    width: 30px;
    height: 30px;
    background: #ffffff;
    border: 1px solid #f2f1f1;
    border-radius: 50%;
    padding: 2px;
    box-sizing: border-box;
    margin-right: 5px;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
.border-tool {
  background-color: white;
  margin-top: 20px;
  padding: 20px;
  height: 100px;
  box-sizing: border-box;
  align-items: center;
  justify-content: flex-end;
  .el-button {
    margin-left: 20px;
    height: 60px;
    width: 220px;
    font-size: 18px;
  }
  .money {
    font-size: 30px;
  }
}
</style>