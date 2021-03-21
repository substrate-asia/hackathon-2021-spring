<!--
 * @Description:
 * @Author: 龙春雨
 * @Date: 2019-12-27 13:05:49
-->
<template>
  <div class="home-wrapper">
    <div class="banner">
      <el-carousel height="659px"
                   trigger="click"
                   class="cus-carousel"
                   arrow="never">
        <el-carousel-item>
          <img src="@/assets/banner1.png"
               alt="" />
          <div class="banner-text">
            <div class="title">一站式数字资产生态平台</div>
            <h2 style="padding-top:20px;"><img src="@/assets/banner-title.png"
                   alt="" /></h2>
            <p>我们提供NFT资产铸造、交易、版权存证一站式服务，<br />未来将探索DEFI领域，实现NFT资产跨链流通</p>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <img src="@/assets/banner2.png"
               alt="" />
          <div class="banner-text">
            <h2>基于<span class="text-primary-color">Substrate</span>技术的联盟链</h2>
            <p>为NFT数字资产价值流通提供可信网络</p>
            <el-button>查看详情</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 核心优势 -->
    <div class="content">
      <header class="content-title">
        <strong>核心优势</strong>
        <p>行业领先技术高效维权</p>
      </header>
      <ul class="advantage-list">
        <li>
          <img src="@/assets/pic1.png"
               alt="" />
          <div class="title">区块链底层平台 </div>
          <p>基于Substrate定制开发的联盟链平台，
            多中心化治理机制的分布式系统，保证数据
            不被纂改，开放监管入口。
          </p>
        </li>
        <li>
          <img src="@/assets/pic2.png"
               alt="" />
          <div class="title">低成本高效率的维权</div>
          <p>打破传统的取证难，耗时长，成本高，
            版权存证和侵权证据原始数据直通司法鉴定中
            心、律所、互联网法院，维权更快更高效。
          </p>
        </li>
        <li>
          <img src="@/assets/pic3.png"
               alt="" />
          <div class="title">领先的侵权监测技术 </div>
          <p>基于大数据+AI的图像与视频采样识别，
            为需求用户提供全平台24小时侵权监测。</p>
        </li>
      </ul>
    </div>
    <!-- 联盟链平台 -->
    <div class="platform">
      <header class="content-title">
        <strong>联盟链平台</strong>
        <p>基于Substrate底层架构</p>
      </header>
    </div>
    <!-- 数字存证 -->
    <div class="deposit-evidence">
      <div class="content">
        <header class="content-title">
          <strong>数据存证</strong>
          <p>多维确权多种电子证据为您确权</p>
        </header>
        <ul class="flex">
          <li class="flex-1">
            <img src="@/assets/pic5.png"
                 alt="" />
            <h3>作品存证电子证书</h3>
          </li>
          <li class="flex-1">
            <img src="@/assets/pic6.png"
                 alt="" />
            <h3>存证数据保管函</h3>
          </li>
        </ul>
      </div>
    </div>
    <!-- 合作伙伴 -->
    <div class="partner">
      <div class="content">
        <header class="content-title">
          <strong>合作伙伴</strong>
        </header>
        <ul class="flex">
          <li class="flex-1">
            <img src="@/assets/link-pic1.png" />
          </li>
          <li class="flex-1">
            <img src="@/assets/link-pic2.png" />
          </li>
          <li class="flex-1">
            <img src="@/assets/link-pic3.png" />
          </li>
          <li class="flex-1">
            <img src="@/assets/link-pic4.png" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {};
  },
  mounted() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
.cus-carousel {
  ::v-deep .el-carousel__item > img {
    display: block;
    margin: 0 auto;
  }
}

.banner {
  background-color: #070709;
  height: 659px;
  position: relative;
  margin-top: -56px;
  .banner-text {
    position: absolute;
    width: 1204px;
    left: 50%;
    top: 224px;
    color: white;
    transform: translateX(-50%);
    .title {
      background-color: #f2a140;
      padding: 5px 10px;
      font-size: 24px;
      color: #0c0e11;
      display: inline-block;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 52px;
    }
    p {
      font-size: 16px;
      padding: 10px 0 0 0;
    }
    ::v-deep .el-button {
      margin-top: 20px;
      background-color: transparent;
      border-color: $primaryColor;
      color: $primaryColor;
    }
  }
}
.content-title {
  text-align: center;
  padding-top: 110px;
  strong {
    font-size: 36px;
    color: #00041a;
    font-weight: 400;
  }
  p {
    font-size: 16px;
  }
}
.advantage-list {
  margin: 27px auto 0 auto;
  display: flex;
  justify-content: space-between;
  li {
    background-color: white;
    flex: 1;
    text-align: center;
    padding: 50px 50px 80px;
    & + li {
      margin-left: 24px;
    }
    .title {
      font-size: 24px;
      color: $--color-text-primary;
    }
    p {
      padding-top: 10px;
      line-height: 24px;
      color: #666;
    }
  }
}
.platform {
  height: 715px;
  margin-top: 116px;
  background: url('../../assets/pic4.png') no-repeat 50% 0;
  .content-title {
    color: white;
    strong {
      color: white;
    }
  }
}
.deposit-evidence {
  background-color: white;
  ul {
    margin-top: 29px;
  }
  li {
    background-color: white;
    height: 607px;
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: 0px 10px 57px 0px rgba(183, 186, 204, 0.2);
    text-align: center;
    padding-top: 39px;
    & + li {
      margin-left: 83px;
    }
    h3 {
      font-size: 24px;
      color: $--color-text-primary;
      font-weight: 400;
    }
  }
}
.partner {
  background-color: white;
  padding-bottom: 100px;
  ul {
    padding-top: 30px;
  }
}
</style>
