import React from "react";
import { Header } from "semantic-ui-react";

// 这里应该用变量代替价格，根据数据是否有价格对比而显示
const CommissionHeader = (props) => {
  const { name, total, reward, hash, url } = props;

  return (
    <hgroup>
      <Header as="h2" content={<span>{name} <a href={decodeURIComponent(url)} target="blank">Taobao</a></span>} />
      <Header as="h5" content={<a href="#">{`#${hash}`}</a>} />
      <h3 className="product-price">
        <span className="discount">
          ${(parseFloat(total) / 100000000).toFixed(2)}{" "}
          <b>Reward: ${(parseFloat(reward) / 100000000).toFixed(2)}</b>
        </span>
        <span></span>
      </h3>
    </hgroup>
  );
};

export default CommissionHeader;
