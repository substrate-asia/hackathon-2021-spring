<!--
 * @Description: 商品详情
 * @Author: 龙春雨
 * @Date: 2021-02-24 09:39:45
-->
<template>
  <div>
    <search-header />
    <div class="content">
      <!-- 基本信息 -->
      <div class="pro-info-wrapper flex">
        <div class="big-img">
          <el-image style="width:100%; height:100%;"
                    :lazy="true"
                    :src="detail.cover"
                    :preview-src-list="[detail.cover]"
                    fit="cover"></el-image>
          <div class="name">{{detail.asset_name}}</div>
        </div>
        <div class="pro-base-info">
          <!-- 产品基本信息 -->
          <h2>{{detail.asset_name}}</h2>
          <div class="money">{{detail.price}}</div>
          <ul class="pro-params">
            <li>
              <span class="label">资产编码：</span>
              <span class="value">{{detail.asset_no}}</span>
            </li>
            <li>
              <span class="label">区块链数字证书:</span>
              <span class="certificate value"
                    @click="openPreview">{{detail.total_hash}}</span>
              <copy :text="detail.total_hash" />
            </li>
            <li>
              <span class="label">证书日期：</span>
              <span class="value">{{detail.create_time}}</span>
            </li>
            <li>
              <span class="label">区块高度：</span>
              <span class="value">{{detail.block_height}}</span>
            </li>
            <li>
              <span class="label">区块生成时间：</span>
              <span class="value">{{detail.block_time}}</span>
            </li>
            <li>
              <span class="label">区块哈希值：</span>
              <span class="value">{{detail.tx_hash}}</span>
              <copy :text="detail.tx_hash" />
            </li>
          </ul>
          <div class="toolbar flex">
            <div class="cus-button flex-0">
              <i class="iconfont iconfollow"></i>
              收藏
            </div>
            <div class="cus-button flex-0">
              <i class="iconfont iconjubao"></i>
              举报
            </div>
            <el-button type="primary"
                       @click="payChange"
                       class="flex-1">立即购买</el-button>
          </div>
          <!-- 店铺信息 -->
          <div class="store-info">
            <div class="store-header flex">
              <div class="avatar flex-0">
                <img src="https://resource.jinse.com/www/v3/img/logo.svg?v=2012" />
              </div>
              <div class="store-name flex-1">
                <div>店铺信息</div>
                <span>上海旺链信息科技有限公司</span>
              </div>
            </div>
            <div class="img-list flex">
              <template v-for="(item, index) in imgList"
                        :key="index">
                <el-image :src="item.cover"
                          @click="switchImg(index)"
                          fit="cover"></el-image>
              </template>
            </div>
          </div>
          <div class="share">
            <span>
              分享到：
            </span>
            <i class="iconfont iconqq"></i>
            <i class="iconfont iconweibo"></i>
            <i class="iconfont iconQQkongjian"></i>
          </div>
        </div>
      </div>
      <!-- 产品详情 -->
      <div class="pro-detail">
        <header>
          标签：
        </header>
        <div>
          <template v-for="(item,index) in detail.tag"
                    :key="index">
            <el-tag type="info">{{item}}</el-tag>
          </template>
        </div>
        <!-- 交易记录 -->
        <header style="padding-top:50px;">交易记录</header>
        <!-- 商品列表 -->
        <el-table :data="detail.tx_history_list"
                  :border="false"
                  empty-text="暂无交易记录"
                  class="custom-table"
                  style="width: 100%">
          <el-table-column type="index"
                           :index="indexMethod">
          </el-table-column>
          <el-table-column prop="proBase"
                           label="店铺宝贝">
          </el-table-column>
          <el-table-column prop="tx_hash"
                           label="转账交易hash">
          </el-table-column>
          <el-table-column prop="seller_address"
                           label="卖家钱包">
          </el-table-column>
          <el-table-column prop="buyer_address"
                           label="买家钱包">
          </el-table-column>
          <el-table-column prop="price"
                           width="180"
                           label="价格">
          </el-table-column>
          <el-table-column prop="tx_time"
                           width="180"
                           label="交易时间">
          </el-table-column>
        </el-table>
      </div>
      <img-viewer ref="imgViewer"></img-viewer>
    </div>
  </div>
</template>

<script>
import { getAssetsDetail, getAssetsList } from '@/api/index';
import imgViewer from '@/components/imgViewer';
import { dateFormat } from '@/util/index';
import searchHeader from '@/components/search';
import copy from '@/components/copy';
export default {
  name: 'productDetail',
  data() {
    return {
      imgList: [],
      detail: {
        cover: '',
        tags: [],
        tx_history_list: []
      }
    };
  },
  components: {
    imgViewer,
    searchHeader,
    copy
  },
  mounted() {
    if (this.$route.params.id) {
      this.getDetail(this.$route.params.id);
      this.getList();
    }
  },
  methods: {
    indexMethod(index) {
      return index + 1;
    },
    payChange() {
      this.$router.push('/submitOrder/' + this.$route.params.id);
    },
    async getDetail(id) {
      try {
        let res = await getAssetsDetail(id);
        res.tag = res.tag.split(',');
        res.block_time = dateFormat(
          parseInt(res.block_time.toString() + '000')
        );
        this.detail = res;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getList() {
      try {
        let res = await getAssetsList({
          offset: 0,
          limit: 3,
          keyword: '',
          category_id: ''
        });
        this.imgList = res.list;
      } catch (err) {
        throw new Error(err);
      }
    },
    openPreview() {
      // this.$ImagePreview(this.produceList, index);
      this.$refs.imgViewer.viewImg(this.detail.proof_book);
    }
  }
};
</script>

<style lang="scss">
$size: 60px;
.pro-info-wrapper {
  height: 882px;
  padding-top: 61px;
  justify-content: space-between;
  box-sizing: border-box;
  .certificate {
    color: #2e64d1;
    text-decoration: underline;
    cursor: pointer;
  }
  .big-img {
    width: 660px;
    height: 100%;
    position: relative;
    .name {
      position: absolute;
      background-color: rgba(12, 14, 17, 0.3);
      color: rgba(255, 255, 255, 0.6);
      padding: 3px 15px;
      right: 10px;
      bottom: 10px;
      font-size: 18px;
    }
  }
  h2 {
    font-size: 24px;
    color: $--color-text-primary;
    padding-top: 10px;
  }
  .money {
    padding: 10px 0;
    color: $moneyColor;
    font-size: 19px;
  }
  .pro-params {
    color: #666666;
    li {
      padding: 8px 0;
      display: flex;
      align-items: center;
      .value {
        flex: 1;
        overflow: hidden; /* 超出一行文字自动隐藏 */
        text-overflow: ellipsis; /* 文字隐藏后添加省略号 */
        white-space: nowrap; /* 强制不换行 */
      }
      .label {
        flex-shrink: 0;
      }
    }
    background-color: rgba(245, 245, 245, 0.6);
    padding: 10px 20px;
  }
  .toolbar {
    padding-top: 20px;
    height: $size;
    .el-button {
      font-size: 18px;
    }
    padding-bottom: 42px;
    border-bottom: 1px solid #f2f1f1;
  }
  .cus-button {
    width: $size;
    text-align: center;
    border: 1px solid #f2f1f1;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    color: $--color-text-primary;
    box-sizing: border-box;
    cursor: pointer;
    i {
      display: block;
      font-size: 18px;
    }
    &:hover {
      //   background-color: $primaryColor;
      //   color: white;
      border-color: $primaryColor;
      color: $primaryColor;
    }
  }
  .store-header {
    padding: 30px 0 15px 0;
    .avatar {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #f2f1f1;
      border-radius: 50%;
      box-sizing: border-box;
      padding: 3px;
      img {
        display: block;
        max-width: 100%;
        max-height: 100%;
      }
    }
    .store-name {
      > div {
        font-weight: bold;
        // padding: 0 0 2px 0;
      }
      padding-left: 10px;
    }
  }
  .img-list {
    .el-image {
      width: 140px;
      height: 186px;
      overflow: hidden;
      cursor: pointer;
      img {
        transition: all 0.3s ease;
        &:hover {
          transform: scale(1.2);
        }
      }
    }
    justify-content: space-between;
    padding-bottom: 24px;
    border-bottom: 1px solid #f2f1f1;
  }
  .share {
    padding-top: 14px;
    display: flex;
    align-items: center;
    i {
      margin: 0 4px;
      cursor: pointer;
      font-size: 20px;
      color: #838383;
      &:hover {
        color: $primaryColor;
      }
    }
  }
}
.pro-base-info {
  width: 523px;
  background-color: white;
  height: 100%;
  padding: 21px;
  box-sizing: border-box;
}
.pro-detail {
  background-color: white;
  padding: 40px 20px;
  margin-top: 26px;
  header {
    font-size: 24px;
    color: $--color-text-primary;
    margin-bottom: 10px;
  }
  .el-tag {
    color: $--color-text-primary;
    margin-right: 10px;
  }
}
</style>