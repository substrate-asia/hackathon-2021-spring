import React from "react";
import { Row, Col } from "antd";
import footerStyles from "./Footer.less";
import center from "@/pages/account/center";
import { QqOutlined, TwitterOutlined, WechatOutlined, WeiboOutlined } from "@ant-design/icons";

const Footer: React.FC<any> = () => {
  return (
    <div className={footerStyles.footerPlaceHolder}>
      <div className={footerStyles.footerContainer}>
        <div>
          <Row gutter={{ sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" span={6}>
              <span style={{ marginLeft: 100, marginTop: 20, height: 200, float: 'left' }}>
                <p className={footerStyles.footerItemTitleLarge}>跨次元</p>
                <p className={footerStyles.footerItemContent}>国际领先的</p>
                <p className={footerStyles.footerItemContent}>内容数字资产交易平台</p>
              </span>
            </Col>
            <Col className="gutter-row" span={4}>
              <span style={{ marginLeft: 100, marginTop: 20, height: 200, float: 'left' }}>
                <p className={footerStyles.footerItemTitleSmall}>关于我们</p>
                <a href="" className={footerStyles.footerItemContent}>平台介绍</a>
                <br />
                <a href="https://admin.dimension.pub/#/picadmin/account/center/home" target='_blank' className={footerStyles.footerItemContent}>创作者平台</a>
              </span>
            </Col>
            <Col className="gutter-row" span={4}>
              <span style={{ marginLeft: 100, marginTop: 20, height: 200, float: 'left' }}>
                <p className={footerStyles.footerItemTitleSmall}>联系我们</p>
                <p className={footerStyles.footerContact}></p>
                <p className={footerStyles.footerItemContent}>关注跨次元微信公众号，留言你的问题</p>
              </span>
            </Col>
            <Col className="gutter-row" span={4}>
              <span style={{ marginLeft: 100, marginTop: 20, height: 200, float: 'left' }}>
                <p className={footerStyles.footerItemTitleSmall}>平台协议</p>
                <a target='_blank' href="/#/protocol/private" className={footerStyles.footerItemContent}>隐私协议</a>
                <br />
                <a target='_blank' href="/#/protocol/platform" className={footerStyles.footerItemContent}>平台协议</a>
                <br />
                {/* <a href="http://rongmeitech.com/map" className={footerStyles.footerItemContent}>融梅堪景平台</a>
                <br />
                <a href="http://rongmeitech.com/resume" className={footerStyles.footerItemContent}>融梅简历平台</a>
                <br />
                <a href="http://rongmeitech.com/mall" className={footerStyles.footerItemContent}>融梅业务商城</a> */}
              </span>
            </Col>
            <Col className="gutter-row" span={6}>
              <Row className={footerStyles.media}>
                <Col className={footerStyles.mediaItem} span={8}>
                  <a className={footerStyles.qq} href="https://jq.qq.com/?_wv=1027&k=s1DwDBQp" target="_blank">
                    <QqOutlined className={footerStyles.mediaIcon} />
                    <div className={footerStyles.qrcode}></div>
                  </a>
                </Col>
                <Col className={footerStyles.mediaItem} span={8}>
                  <a className={footerStyles.weibo} href="https://weibo.com/u/5533987370" target="_blank">
                    <WeiboOutlined className={footerStyles.mediaIcon} />
                    <div className={footerStyles.qrcode}></div>
                  </a>
                </Col>
              </Row>
              <Row className={footerStyles.media}>
                <Col className={footerStyles.mediaItem} span={8}>
                  <a className={footerStyles.twitter} href="https://twitter.com/WTMCjYxkeOjMGoV" target="_blank">
                    <TwitterOutlined className={footerStyles.mediaIcon} />
                    <div className={footerStyles.qrcode}></div>
                  </a>
                </Col>
                <Col className={footerStyles.mediaItem} span={8}>
                  <a className={footerStyles.weixin}>
                    <WechatOutlined className={footerStyles.mediaIcon} />
                    <div className={footerStyles.qrcode}></div>
                  </a>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div style={{ width: '100%', float: 'left' }}>
          <span style={{ marginLeft: 100, marginBottom: 20, float: 'left' }}>
            <div style={{ color: '#85888a', fontSize: 12, textAlign: center }}>
              ©2020 南京崇新数字科技有限公司
              <a style={{ color: '#ffffff' }} href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" >苏 ICP 备 20045842 号</a>
            </div>
          </span>
        </div>
      </div>
    </div>
  )
};
export default Footer
