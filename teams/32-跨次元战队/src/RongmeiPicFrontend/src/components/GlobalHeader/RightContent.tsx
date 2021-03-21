import { Button, Tag } from 'antd';
import React, { useEffect } from 'react';
import { connect, ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
// import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import HeaderSearch from "@/components/HeaderSearch";
import { getTCC } from "@/services/tcc";
import personalVIP from "@/assets/personal_vip.png";
import enterpriseVIP from "@/assets/enterprise_vip.png";


export type SiderTheme = 'light' | 'dark';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
  history: any;
}

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const { theme, layout, history } = props;
  const [keywords, setKeywords] = React.useState([]);
  const [key, setKey] = React.useState("");
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  useEffect(() => {
    getTCC('rongmei.pic.searchkeywords').then((res) => {
      const rawKeyWords = eval(res.tccTuple.value);
      const newKeyWords = [];
      for (let i = 0; i < rawKeyWords.length; i++) {
        newKeyWords.push({
          label: <a onClick={() => {
            setKey(rawKeyWords[i])
          }}>{rawKeyWords[i]}</a>, value: rawKeyWords[i]
        })
      }
      setKeywords(newKeyWords)
    })
  }, [1]);

  return (
    <div className={className}>
      <div className={styles.action}>
        <Button style={{margin: '0px 10px',background: "linear-gradient(90deg, #CAE3FF 0%, #CAE3FF 72%)", borderRadius:'20px', borderWidth:0}}>
          <img src={personalVIP} />
        个人VIP
      </Button>
        <Button style={{margin: '0px 10px',background:"linear-gradient(90deg, #FFECCA 0%, #FFECCA 72%)", borderRadius:'20px', borderWidth:0}}>
          <img src={enterpriseVIP} />
        团组VIP
      </Button>
      </div>
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        defaultValue="nju"
        value={key}
        options={keywords}
        onSearch={value => {
          history.push(`/search/${value}`)
          window.location.reload()
        }}
        onChange={value => {
          setKey(value)
        }}
      />
      <Avatar />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
