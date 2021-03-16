<!--
 * @Description:我的资产
 * @Author: 龙春雨
 * @Date: 2021-02-24 14:09:50
-->
<template>
  <div class="assets-wrapper content"
       v-loading="loading">
    <header>我的资产</header>
    <div class="tag-list">
      <template v-for="(item, index) in menu"
                :key="item.key">
        <el-tag :type="index.toString() === curr ? '' : 'info'"
                @click="setCurr(index)">{{item.label}}</el-tag>
      </template>
    </div>
    <ul v-if="data.length >0">
      <template v-for="item in data"
                :key="item.id">
        <li class="flex">
          <div class="img flex-0">
            <div class="is-sold"
                 v-if="item.is_sold === 1">已售</div>
            <el-image :src="item.cover"
                      class="flex-0"
                      fit="cover"></el-image>
          </div>
          <div class="assets-item-info flex-1">
            <div class="base-title flex">
              <div class="flex align-center">
                <span class="name">{{item.asset_name}}</span>
                <el-tag style="margin-right:10px;"
                        :type="item.is_proof ? '': 'info'">{{item.is_proof ? '已存证' : '未存证'}}</el-tag>
                <el-tag :type="item.is_register ? '': 'info'">{{item.is_register ? '已创建NFT' : '未创建NFT'}}</el-tag>
              </div>
              <span class="money">{{item.price}}</span>
            </div>
            <div class="params">
              <span v-if="curr==='0'">提交日期：{{dateFormat(parseInt(item.create_time.toString() + '000'))}}</span>
              <span v-else>成交日期：2021-02-02 </span>
              <span style="margin-left:10px;">资产编码：{{item.asset_no}}</span>
            </div>
            <div class="params">
              <span>区块链数字证书: {{item.total_hash}}</span>
            </div>
            <div class="toolbar">
              <el-button @click="publishChange(item)"
                         v-if="item.is_proof === 0">资产存证</el-button>
              <el-button @click="assetsNFT(item)"
                         v-if="item.is_register === 0">创建NFT</el-button>
              <el-button>下载文件</el-button>
              <el-button @click="toDetail(item.id)"
                         v-if="item.is_proof === 1">查看详情</el-button>
              <el-button v-if="curr === 1">一键转卖</el-button>
            </div>
          </div>
        </li>
      </template>
    </ul>
    <div v-else
         class="empty">
      <el-empty description="暂无资产!"></el-empty>
      <el-button @click="toPublish"
                 v-if="curr === '0'">去发布资产</el-button>
      <el-button @click="toOrder"
                 v-else>去购买资产</el-button>
    </div>
  </div>
</template>

<script>
import { getMyAssetsList, getOrderList, chainNotice } from '@/api/index';
import { getStore } from '@/util/store';
import { ContractPromise } from '@polkadot/api-contract';
import abi from '../../assets/contract/metadata';
import { ElMessage } from 'element-plus';
import {
  errTips,
  createApiPromise,
  contractAddress,
  dateFormat
} from '@/util/index';
function strToHexCharCode(str) {
  if (str === '') {
    return '';
  }
  let hexCharCode = [];
  hexCharCode.push('0x');
  for (let i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16));
  }
  return hexCharCode.join('');
}
export default {
  name: 'myAssets',
  data() {
    return {
      data: [],
      curr: '0',
      loading: false,
      menu: [
        {
          key: 'myAssets',
          label: '我发布的'
        },
        {
          key: 'myOrder',
          label: '我购买的'
        }
      ],
      address: '',
      api: null
    };
  },
  props: {
    alice: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    dateFormat,
    async getList() {
      try {
        this.loading = true;
        let fun = this.curr === '0' ? getMyAssetsList : getOrderList;
        let res = await fun({
          offset: 0,
          limit: 100
        });
        this.data = res.list;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    },
    // 进行确认是否要进行存证
    publishChange(item) {
      this.$confirm('是否将资产存证，发布到交易中心吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.publishSubmit(item);
        })
        .catch(() => {});
    },
    // 存证
    async publishSubmit(item) {
      try {
        let _this = this;
        _this.loading = true;
        // 创建接口
        if (!this.api) {
          this.api = await createApiPromise();
        }
        let api = this.api;
        let assets = {
          address: getStore({ name: 'address' }), // 钱包地址
          // file_hash: '555', // 对应列表的total_hash
          file_hash: item.file_lists[0].file_hash, // 对应列表的total_hash
          store_url: item.file_lists[0].file_path // 附件地址
          // store_url: item.file_url | '222' // 附件地址
        };
        // 资产的内容转为16进度
        let assets_info = JSON.stringify(assets);
        let assets_proof = strToHexCharCode(assets_info);
        let createBlockTime = null;
        // 简单测试
        await api.tx.templateModule
          .createClaim(assets_proof, assets_info)
          .signAndSend(this.alice, async result => {
            const { status, isError } = result;
            if (status.isFinalized) {
              // unsubscribe();
              createBlockTime = new Date().getTime();
              let { isSuccess } = await errTips(result);
              if (isSuccess) {
                // 如果已经存证完成
                const statusJSON = status.toJSON();
                // hash调用接口进行存
                const hash = statusJSON.finalized || statusJSON.inBlock; // 区块hash
                const block = await api.rpc.chain.getHeader(hash); // 区块详情
                const number = block.toJSON().number; // 区块高度
                // 调用接口
                _this.updateAssets(hash, item, number, createBlockTime, 1);
              } else {
                _this.loading = false;
                ElMessage.error('资产存证失败，请重试！');
              }
            } else if (isError) {
              _this.loading = false;
              console.log('fail2,', result.toHuman());
            }
          })
          .catch(() => {
            _this.loading = false;
            _this.$message.error('存证失败，请重试！');
          });
      } catch (err) {
        throw new Error(err);
      }
    },
    setCurr(index) {
      this.curr = index.toString();
      this.getList();
    },
    toDetail(id) {
      this.$router.push('/productDetail/' + id);
    },
    async updateAssets(hash, item, number, createBlockTime, type) {
      try {
        await chainNotice({
          tx_hash: hash,
          tx_type: type,
          block_time: createBlockTime,
          block_height: number,
          assets_id: item.id,
          token_id: item.token_id
          // sell_address: this.address
        });
        this.loading = false;
        this.getList();
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    },
    // 发起创建NFT
    async assetsNFT(item) {
      try {
        let _this = this;
        _this.loading = true;
        // 创建接口
        // 创建接口
        if (!this.api) {
          this.api = await createApiPromise();
        }
        let api = this.api;
        // 合约地址
        let address = contractAddress;
        //调用
        const contract = new ContractPromise(api, abi, address);
        const value = 0; // only useful on isPayable messages
        const gasLimit = 100000000000;
        // const tokenId = 12;
        // 合约发送
        await contract.tx
          .mint({ value, gasLimit }, item.token_id)
          .signAndSend(this.alice, async result => {
            let { status } = result;
            if (status.isFinalized) {
              let createBlockTime = new Date().getTime();
              let isSuccess = await errTips(result);
              if (isSuccess) {
                // 如果已经存证完成
                const statusJSON = status.toJSON();
                // hash调用接口进行存
                const hash = statusJSON.finalized || statusJSON.inBlock; // 区块hash
                const block = await api.rpc.chain.getHeader(hash); // 区块详情
                const number = block.toJSON().number; // 区块高度
                _this.updateAssets(hash, item, number, createBlockTime, 2);
              } else {
                _this.loading = false;
                ElMessage.error('创建NFT失败，请重试！');
              }
            } else if (result.isError) {
              _this.loading = false;
              console.log('fail2,', result.toHuman());
            }
          });
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    },
    toOrder() {
      this.$router.push('/tradingCenter');
    },
    toPublish() {
      this.$router.push('/publishAssets');
    },
    async link() {
      this.api = await createApiPromise();
    }
  },
  mounted() {
    this.address = getStore({ name: 'address' });
    this.curr = this.$route.query.type || '0';
    this.getList();
    this.link();
  }
};
</script>
<style lang="scss">
.assets-wrapper {
  background-color: white;
  min-height: 600px;
  margin-top: 86px;
  padding: 20px;
  .tag-list {
    padding-top: 20px;
    .el-tag {
      margin-right: 10px;
      cursor: pointer;
    }
  }
  header {
    font-size: 24px;
    color: $--color-text-primary;
    border-bottom: 1px solid #f2f1f1;
    padding: 20px 0;
  }
  li {
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f2f1f1;
    position: relative;
    &:last-child {
      border-bottom: none;
    }
    .img {
      width: 90px;
      height: 120px;
      position: relative;
      overflow: hidden;
    }
    .is-sold {
      position: absolute;
      width: 90px;
      height: 30px;
      color: white;
      background-color: red;
      transform: rotate(-45deg);
      z-index: 1;
      text-align: center;
      line-height: 30px;
      top: -1px;
      left: -32px;
    }
  }
  .assets-item-info {
    padding-left: 20px;
    .toolbar {
      .el-button {
        padding: 8px 15px;
      }
      text-align: right;
    }
  }
  .el-image {
    width: 90px;
    height: 120px;
    position: relative;
    overflow: hidden;
    img {
      transition: all 0.3s ease;
    }
    &:hover {
      img {
        transform: scale(1.1);
      }
    }
  }
  .base-title {
    padding: 10px 0;
    .name {
      font-size: 16px;
      color: $--color-text-primary;
      margin-right: 10px;
    }
    justify-content: space-between;
  }
  .params {
    padding: 3px 0;
  }
}
</style>