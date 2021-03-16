<!--
 * @Description:支付窗口
 * @Author: 龙春雨
 * @Date: 2021-02-24 17:42:52
-->
<template>
  <el-dialog title="提示"
             v-model="dialogVisible"
             width="30%"
             custom-class="pay-dialog"
             :before-close="handleClose">
    <div class="order-detail">
      <div class="order-monery">
        实付金额:
        <span class="money">{{price}}</span>
      </div>
      <div>请在30分钟内完成支付</div>
      <div class="code">
        <img src="../../../assets/code.png"
             alt="" />
      </div>
      <div class="tips">请扫码支付</div>
      <el-button class="submit-order-status"
                 :loading="loading"
                 @click="orderNFT">我已支付</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { ContractPromise } from '@polkadot/api-contract';
import { errTips, createApiPromise, contractAddress } from '@/util/index';
import { chainNotice } from '@/api/index';
import abi from '../../../assets/contract/metadata';
import { getStore } from '@/util/store';
import { ElMessage } from 'element-plus';
export default {
  name: 'payDialog',
  data() {
    return {
      loading: false
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    price: {
      type: String,
      required: true
    },
    token_id: {
      type: String,
      required: true
    },
    alice: {
      required: true,
      type: Object
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  methods: {
    handleClose() {
      if (this.loading) {
        ElMessage.error('正在进行交易中，请不要关闭窗口!');
        return false;
      }
      this.dialogVisible = false;
    },
    // 发起NFT交易
    async orderNFT(item) {
      try {
        let _this = this;
        _this.loading = true;
        // 创建接口
        const api = await createApiPromise();
        // 合约地址
        let address = contractAddress;
        //调用
        const contract = new ContractPromise(api, abi, address);
        const value = 0; // only useful on isPayable messages
        const gasLimit = 100000000000;
        const accountAddress = getStore({ name: 'address' });
        // const tokenId = 12;
        // 合约发送
        await contract.tx
          .transfer({ value, gasLimit }, accountAddress, this.token_id)
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
                _this.updateAssets(
                  hash,
                  this.$route.params.id,
                  number,
                  createBlockTime,
                  3
                );
              } else {
                _this.loading = false;
                ElMessage.error('NFT交易失败，请重试！');
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
    async updateAssets(hash, id, number, createBlockTime, type) {
      try {
        await chainNotice({
          tx_hash: hash,
          tx_type: type,
          block_time: createBlockTime,
          block_height: number,
          assets_id: id,
          token_id: this.token_id
          // sell_address: getStore({ name: 'address' })
        });
        this.loading = false;
        ElMessage.success('购买成功！');
        this.$router.push('/myAssets?type=1');
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    }
  }
};
</script>

<style lang="scss">
.order-detail {
  text-align: center;
  .order-monery,
  .tips {
    font-size: 16px;
    color: $--color-text-primary;
    padding-bottom: 5px;
  }
  .code {
    width: 250px;
    height: 250px;
    background-color: black;
    margin: 20px auto;
    img {
      width: 100%;
      display: block;
    }
  }
  .submit-order-status {
    border-color: #57ae8d;
    color: #57ae8d;
    display: block;
    margin: 5px auto 0 auto;
  }
}
.pay-dialog {
  .el-dialog__header {
    height: 60px;
    background: #f5f5f5;
    border-radius: 3px;
    box-sizing: border-box;
    text-align: center;
    font-size: 16px;
  }
  .el-dialog__headerbtn {
    font-size: 22px;
  }
}
</style>