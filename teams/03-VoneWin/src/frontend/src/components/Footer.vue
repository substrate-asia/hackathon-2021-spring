<!--
 * @Description: 页面底部
 * @Author: 龙春雨
 * @Date: 2019-12-04 16:23:09
-->
<template>
  <div class="footer"
       :style="footerStyle">
    <h2>您可以在VoneWin轻松索取VOT</h2>
    <el-input placeholder="输入您的钱包地址"
              v-model="address"
              :disabled="loading"
              class="select-address">
      <template #append>
        <el-button @click="getVot"
                   :loading="loading">即刻拥有</el-button>
      </template>
    </el-input>
    <div class="links">
      <a class="iconfont icontwitter"
         href="https://twitter.com/"
         target="_blank"></a>
      <a class="iconfont iconicon_facebook"
         href="https://www.facebook.com/"
         target="_blank"></a>
      <a class="iconfont iconreddit"
         href="https://www.reddit.com/"
         target="_blank"></a>
      <a class="iconfont iconyoutube"
         href="https://www.youtube.com/"
         target="_blank"></a>
      <a class="iconfont icongithub"
         href="https://github.com/"
         target="_blank"></a>
    </div>
    <div class="footer-detail content">
      <div>
        <a href="#">白皮书</a>
        <a href="#">下载钱包</a>
        <a href="#">浏览器</a>
        <a href="#">DApp</a>
        <a href="#">开发者API</a>
        <a href="#">隐私条款</a>
      </div>
      <div>Copyright 2018-2021 VoneWin 版权所有</div>
    </div>
  </div>
</template>
<script>
import { createApiPromise, errTips } from '@/util/index';
import { ElMessage } from 'element-plus';

const { Keyring } = require('@polkadot/keyring');
export default {
  name: 'pageFooter',
  data() {
    return {
      address: '',
      loading: false
    };
  },
  props: {
    alice: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    footerStyle() {
      return this.$route.meta.footerTop === false
        ? 'margin-top:0;'
        : 'margin-top:100px;';
    }
  },
  methods: {
    async getVot() {
      try {
        this.loading = true;
        // 当前用户的钱包地址
        if (!this.address) {
          ElMessage.error('请输入接收的钱包地址！');
          return false;
        }
        let accountAddress = this.address;
        // Instantiate the API
        const api = await createApiPromise();
        // const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
        // Constuct the keying after the API (crypto has an async init)
        const keyring = new Keyring({ type: 'sr25519' });

        // Add Alice to our keyring with a hard-deived path (empty phrase, so uses dev)
        const alice = keyring.addFromUri('//Alice');
        const num = 1000;
        // Create a extrinsic, transferring 12345 units to Bob
        const transfer = api.tx.balances.transfer(
          accountAddress,
          num * 1000000000000
        );
        // Sign and send the transaction using our account
        await transfer.signAndSend(alice, async result => {
          const { status, isError } = result;
          console.log(result);
          if (status.isFinalized) {
            // unsubscribe();
            let createBlockTime = new Date().getTime();
            let { isSuccess } = await errTips(result);
            if (isSuccess) {
              // 如果已经存证完成
              const statusJSON = status.toJSON();
              // hash调用接口进行存
              const hash = statusJSON.finalized || statusJSON.inBlock; // 区块hash
              const block = await api.rpc.chain.getHeader(hash); // 区块详情
              const number = block.toJSON().number; // 区块高度
              // 调用接口
              console.log(`hash:${hash}`);
              console.log(`number:${number}`);
              console.log(`createBlockTime:${createBlockTime}`);
              ElMessage.success('成功索取1,000个VOT！');
              // _this.updateAssets(hash, item, number, createBlockTime, 1);
            } else {
              this.loading = false;
              ElMessage.error('资产存证失败，请重试！');
            }
          } else if (isError) {
            this.loading = false;
            console.log('fail2,', result.toHuman());
          }
        });
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    }
  }
};
</script>
<style lang="scss">
.footer {
  text-align: center;
  padding: 50px 0 100px 0;
  background: url('../assets/footer-bg.png') no-repeat 0 100% #0c0e11;
  h2 {
    color: rgba(255, 255, 255, 0.8);
    padding-bottom: 30px;
  }
  .select-address {
    width: 580px;
    input {
      background: transparent;
      height: 60px;
      font-size: 16px;
      border-color: hsla(0, 0%, 100%, 0.6);
      color: white;
    }
    .el-input-group__append {
      width: 140px;
      background-color: $primaryColor;
      border-color: $primaryColor;
      font-size: 24px;
      color: white;
    }
  }
  .links {
    padding: 80px 0 120px 0;
    a {
      font-size: 27px;
      margin: 0 6px;
      display: inline-block;
      width: 48px;
      height: 48px;
      line-height: 48px;
      border-radius: 100%;
      border: 2px solid hsla(0, 0%, 100%, 0.6);
      color: hsla(0, 0%, 100%, 0.8);
      -webkit-transition: all 0.2s ease;
      transition: all 0.2s ease;
      &:hover {
        border-color: $primaryColor;
        background-color: $primaryColor;
        color: #fff;
      }
    }
  }
  .footer-detail {
    // display: flex;
    // justify-content: space-between;
    color: white;
    opacity: 0.8;
    line-height: 25px;
    a {
      margin-right: 10px;
      color: white;
    }
  }
}
</style>
