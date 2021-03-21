<!--
 * @Description:页面layout
 * @Author: 龙春雨
 * @Date: 2021-01-27 15:24:53
-->
<template>
  <div class="wrapper"
       v-loading="loading">
    <nav-header :active="active"
                :alice="alice"
                @switchAccount="switchAccount"
                :isLogin="isLogin"></nav-header>
    <div>
      <router-view :alice="alice"
                   v-if="isLogin"></router-view>
    </div>
    <nav-footer :alice="alice"
                v-if="isLogin" />
    <back-top @click="backTop"
              :style="`opacity:${backTopOpacity}`" />
    <el-dialog title="请选择您要登录的账号"
               v-model="dialogVisible"
               width="30%">
      <el-select v-model="selectIndex"
                 style="width:100%;"
                 placeholder="请选择">
        <el-option v-for="(item, index) in allAccounts"
                   :key="item.address"
                   :label="item.meta.name"
                   :value="index">
        </el-option>
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="submitChange">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import BackTop from './BackTop';
import NavHeader from './NavHeader';
import NavFooter from './Footer';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { loginOrRegister } from '@/api/index';
import { setStore, getStore } from '@/util/store';
export default {
  name: 'Layout',
  data() {
    return {
      active: 'index',
      backTopOpacity: 0,
      alice: {},
      sign_result: '',
      isLogin: false,
      allAccounts: [],
      dialogVisible: false,
      selectIndex: 0,
      loading: false
    };
  },
  components: {
    BackTop,
    NavHeader,
    NavFooter
  },
  mounted() {
    let _this = this;
    _this.getUserInfo();
  },
  watch: {},
  methods: {
    backTop() {
      if (this.backTopOpacity) {
        //判断为浏览器
        let timer = null;
        let scrollbarEl = this.$refs.scrollbar.wrap;
        timer = setInterval(() => {
          let top = scrollbarEl.scrollTop;
          top -= 100;
          if (top > 0) {
            scrollbarEl.scrollTop = top;
          } else {
            scrollbarEl.scrollTop = 0;
            clearInterval(timer);
          }
        });
      }
    },
    // 拿到钱包相关信息后进行登录
    async loginChange(message) {
      if (this.isLogin) {
        this.loading = false;
        return false;
      }
      try {
        let { address } = this.alice;
        let data = {
          username: 'uairain',
          address, //账号
          // public_key: publicKey, //公钥
          message, //随机字符串
          sign_result: [], //签名结果
          sign_alg: 'sr25519' //签名使用的算法
        };
        let signResult = JSON.parse(JSON.stringify(this.sign_result));
        for (let i = 0; i < 64; i++) {
          data.sign_result.push(signResult[i]);
        }
        let res = await loginOrRegister(data);
        let { api_token, userId } = res;
        // 登录成功，记录address及api_token
        setStore({ name: 'address', content: address });
        setStore({ name: 'api_token', content: api_token });
        setStore({ name: 'userId', content: userId });
        this.isLogin = true;
        this.loading = false;
        // console.log(res);
      } catch (err) {
        this.loading = false;
        throw new Error(err);
      }
    },
    async getUserInfo() {
      this.loading = true;
      // 允许app可读取polkadot-js extensiont管理的账号
      await web3Enable('VoneWin');
      // // 遍历polkadot-js wxtensiont管理的账号
      let allAccounts = await web3Accounts();
      allAccounts = allAccounts.map(({ address, meta }) => {
        return {
          address,
          meta: {
            ...meta,
            name: `${meta.name} (${meta.source})`
          }
        };
      });
      // //载入包括开发节点的账号
      keyring.loadAll({ isDevelopment: true }, allAccounts);

      let pairs = keyring.getPairs();
      this.allAccounts = pairs;
      let api_token = getStore({ name: 'api_token' });
      if (api_token) {
        // 当前为登录状态,初始化用户信息
        let address = getStore({ name: 'address' });
        this.isLogin = true;
        pairs.forEach((item, index) => {
          if (item.address === address) {
            this.alice = item;
            this.selectIndex = index;
          }
        });
        this.loading = false;
        return false;
      }
      if (pairs.length > 1) {
        this.loading = false;
        this.dialogVisible = true;
      } else if (pairs.length === 1) {
        this.alice = pairs[0];
        this.selectAccount();
      }
    },
    selectAccount() {
      // 清空所有的缓存
      setStore({ name: 'address', content: '' });
      setStore({ name: 'api_token', content: '' });
      setStore({ name: 'userId', content: '' });
      this.isLogin = false;
      let { alice } = this;
      let message = new Date().getTime().toString();
      this.sign_result = alice.sign(message);
      let address = getStore({ name: 'address' });
      let api_token = getStore({ name: 'api_token' });
      if (address === alice.address && api_token) {
        this.isLogin = true;
        this.loading = false;
        return false;
      }
      this.loginChange(message);
    },
    submitChange() {
      this.dialogVisible = false;
      this.alice = this.allAccounts[this.selectIndex];
      this.loading = true;
      this.selectAccount();
    },
    switchAccount() {
      this.dialogVisible = true;
    }
  }
};
</script>

<style lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
