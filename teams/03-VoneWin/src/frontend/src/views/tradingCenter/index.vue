<!--
 * @Description:交易中心
 * @Author: 龙春雨
 * @Date: 2021-02-25 10:13:28
-->
<template>
  <div>
    <search-header />
    <div class="content">
      <!-- <div class="pro-list" v-if="list.length > 0"> -->
      <header class="trading-title">NFT资产交易中心</header>
      <div class="pro-list">
        <!-- BEGIN:演示数据 -->
        <div class="pro-item"
             @click="showVideo('1.mp4')">
          <el-card shadow="hover"
                   :body-style="{ padding: '0px' }">
            <div class="pic-box">
              <div class="mask">
                <el-button type="primary">查看创作过程</el-button>
              </div>
              <el-image :lazy="true"
                        src="/img/1.jpg"
                        fit="cover"></el-image>
            </div>
            <div style="padding: 14px;">
              <span class="title">标题</span>
              <div class="bottom flex">
                <div class="money">10000.00</div>
                <div>
                  <div type="info">二次元</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="pro-item"
             @click="showVideo('2.mp4')">
          <el-card shadow="hover"
                   :body-style="{ padding: '0px' }">
            <div class="pic-box">
              <div class="mask">
                <el-button type="primary">查看创作过程</el-button>
              </div>
              <el-image :lazy="true"
                        src="/img/2.jpg"
                        fit="cover"></el-image>
            </div>
            <div style="padding: 14px;">
              <span class="title">标题</span>
              <div class="bottom flex">
                <div class="money">10000.00</div>
                <div>
                  <div type="info">二次元</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <!-- END:演示数据 -->
        <template v-for="item in list"
                  :key="item.id">
          <div class="pro-item"
               @click="productDetail(item.id)">
            <el-card shadow="hover"
                     :body-style="{ padding: '0px' }">
              <div class="pic-box">
                <div class="mask">
                  <el-button type="primary">立即购买</el-button>
                </div>
                <el-image :lazy="true"
                          :src="item.cover"
                          fit="cover"></el-image>
              </div>
              <div style="padding: 14px;">
                <span class="title">{{item.asset_name}}</span>
                <div class="bottom flex">
                  <div class="money">{{item.price}}</div>
                  <div>
                    <div type="info">{{item.category_name}}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </template>
      </div>
      <!-- <div v-else
           class="flex-1 empty">
        <el-empty description="暂无可交易的资产!"></el-empty>
        <el-button @click="toPublish">去发布资产</el-button>
      </div> -->
    </div>
    <img-viewer ref="imgViewer"></img-viewer>
  </div>
</template>

<script>
import { getAssetsList } from '@/api/index';
import searchHeader from '@/components/search';
import imgViewer from '@/components/imgViewer';
export default {
  name: 'tradingCenter',
  data() {
    return {
      list: []
    };
  },
  components: {
    searchHeader,
    imgViewer
  },
  mounted() {
    this.getList();
  },
  methods: {
    productDetail(id) {
      this.$router.push('/productDetail/' + id);
    },
    async getList() {
      try {
        let { keyword, category_id } = this.searchForm;
        let res = await getAssetsList({
          offset: 0,
          limit: 10000,
          keyword: keyword || '',
          category_id: category_id || ''
        });
        this.list = res.list;
      } catch (err) {
        throw new Error(err);
      }
    },
    toPublish() {
      this.$router.push('/publishAssets');
    },
    showVideo(url) {
      this.$refs.imgViewer.viewImg(url, true);
    }
  },
  watch: {
    searchForm() {
      this.getList();
    }
  },
  computed: {
    searchForm() {
      return this.$route.query || { keyword: '', category_id: '' };
    }
  }
};
</script>

<style lang="scss">
.trading-title {
  padding-top: 60px;
  font-size: 24px;
  padding-bottom: 20px;
  color: $--color-text-primary;
}
.pro-list {
  display: flex;
  flex-wrap: wrap;
  margin-right: -25px;
  min-height: 500px;
  .pro-item {
    width: 220px;
    height: 382px;
    margin-right: 25px;
    border: none;
    margin-bottom: 24px;
    cursor: pointer;
    .pic-box {
      width: 220px;
      height: 290px;
      position: relative;
      overflow: hidden;
      .el-image {
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
      }
      .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        text-align: center;
        z-index: 2;
        opacity: 0;
        transition: opacity 0.3s ease;
        overflow: hidden;
        .el-button {
          transition: margin-top 0.3s ease;
          margin-top: 300px;
        }
      }
    }
    &:hover {
      position: relative;
      z-index: 2;
      .el-card {
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2);
      }
      .pic-box {
        .el-image {
          transform: scale(1.3);
        }
        .mask {
          opacity: 1;
          .el-button {
            margin-top: 230px;
          }
        }
      }
    }
  }
  .bottom {
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
  }
  .title {
    font-size: 16px;
  }
  .money {
    font-size: 20px;
  }
}
</style>
