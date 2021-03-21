import React from "react";
import {Spin} from "antd";

const PageLoading: React.FC<any> = () => {
  return (
    <Spin size="large" tip="正在加载..."/>
  );
};

export default PageLoading;
