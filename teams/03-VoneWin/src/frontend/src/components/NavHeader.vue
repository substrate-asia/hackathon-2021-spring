<!--
 * @Description:
 * @Author: 龙春雨
 * @Date: 2019-12-04 16:23:09
-->
<template>
  <div>
    <header class="nav-header">
      <div class="content flex align-center">
        <h1 class="logo">
          <span class="name-en text-primary-color">Assets Trust</span>
          <span class="name-zh">数字资产生态平台</span>
        </h1>
        <!-- 菜单 -->
        <div class="flex align-center nav-menu-wrapper">
          <ul class="flex nav-menu">
            <template v-for="item in menu"
                      :key="item.key">
              <li :class="{active: dist.includes(item.path)}"><a href="javascript:void(0)"
                   @click="clickMenu(item.path, item.key)">{{item.label}}</a></li>
            </template>
          </ul>
          <div class="login flex"
               :class="{'is-login': isLogin}"
               @click="loginChange">
            <i class="iconfont iconPolkadot_symbol_color1"></i>
            <span v-if="!isLogin">{{loginTips}}</span>
            <el-dropdown v-else
                         @command="handleCommand">
              <span class="el-dropdown-link user-center">
                {{loginTips}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="myAssets">我的资产</el-dropdown-item>
                  <el-dropdown-item command="certification">实名认证</el-dropdown-item>
                  <el-dropdown-item command="publishAssets">发布资产</el-dropdown-item>
                  <el-dropdown-item command="switchAccount">切换账号</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </header>

  </div>
</template>

<script>
export default {
  name: 'navHeader',
  data() {
    return {
      activeIndex: '1',
      lang: 'zh',
      langOption: [
        {
          label: '中文',
          value: 'zh'
        },
        {
          label: 'EN',
          value: 'EN'
        }
      ],

      dist: '',
      menu: [
        {
          label: '首页',
          key: 'index',
          path: '/index'
        },
        {
          label: '交易中心',
          key: 'wallet',
          path: '/tradingCenter'
        },
        {
          label: '存证查询',
          key: 'depositQuery',
          path: '/depositQuery'
        },
        {
          label: '区块链浏览器',
          key: 'browser',
          path:
            'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fasset-rpc.vonechain.com#/explorer'
        },
        {
          label: '帮助',
          key: 'whitePaper'
        }
      ]
    };
  },
  props: {
    isLogin: {
      type: Boolean,
      default: false
    },
    alice: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    loginTips() {
      return this.isLogin ? this.alice.meta.name : '钱包未登录';
    }
  },
  mounted() {
    this.dist = window.location.pathname;
  },
  methods: {
    menuChange() {
      this.showMenu = !this.showMenu;
    },
    clickMenu(path) {
      if (path.includes('http')) {
        window.open(path);
        return false;
      }
      this.$router.push(path);
    },
    handleCommand(command) {
      if (command === 'switchAccount') {
        this.$emit('switchAccount');
        return false;
      }
      this.$router.push(`/${command}`);
    }
  }
};
</script>
<style lang="scss">
$height: 56px;
.nav-header {
  width: 100%;
  height: $height;
  color: white;
  z-index: 100;
  background: #000;
  position: fixed;
  top: 0;
  a {
    color: white;
  }
  .user-center {
    color: white;
    line-height: 25px;
  }
  .logo {
    margin: 0;
    padding: 0;
    height: 100%;
    display: flex;
    align-items: center;
    .name-en {
      font-size: 24px;
      font-weight: 300;
      position: relative;
      padding-right: 12px;
      &:after {
        content: '';
        position: absolute;
        width: 1px;
        height: 16px;
        background-color: white;
        right: 0;
        top: 9px;
        opacity: 0.4;
      }
    }
    .name-zh {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
      padding-left: 12px;
      padding-top: 3px;
    }
  }
  .content {
    display: flex;
    height: 100%;
    justify-content: space-between;
  }
  .nav-menu {
    li {
      padding: 0 20px;
      line-height: $height;
      cursor: pointer;
      position: relative;
      transition: color 0.3s ease;
      font-size: 16px;
      &:hover {
        a {
          color: $primaryColor;
          display: block;
          height: 100%;
        }
      }
      &.active {
        &:after {
          width: 40%;
          left: 30%;
          content: '';
          position: absolute;
          height: 3px;
          background-color: $primaryColor;
          bottom: 0;
          transform-origin: 50% 50%;
          transition: all 0.2s ease;
        }
      }
    }
  }
  .login {
    line-height: 22px;
    cursor: pointer;
    span {
      font-size: 16px;
    }
    &:hover {
      color: $primaryColor;
    }
    i.iconfont {
      color: #ccc;
      font-size: 25px;
      position: relative;
      margin-right: 5px;
      line-height: 25px;
      align-items: center;
      &:after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 100%;
        background-color: white;
        left: 3px;
        top: 3px;
      }
      &::before {
        position: relative;
        z-index: 1;
      }
    }
    &.is-login {
      i.iconfont {
        color: #f26939;
      }
    }
  }
}
</style>
