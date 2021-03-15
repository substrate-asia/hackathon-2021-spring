/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from '@/components';
import { Button } from '@/components'
import styled from 'styled-components'
import {NavLink} from 'react-router-dom'
import {ReactComponent as DotIcon} from '@/assets/dot_icon.svg'

const DotIconBox = styled(DotIcon)`
  background:white;
  width:32px;
  height:32px;
  border-radius:16px;
  padding:8px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.2);
  margin-right:10px;
`;
export const DepositButton = styled(Button)`
  background:var(--blue);
  margin-left:10px;
`;
export const BorrowButton = styled(Button)`
  background:var(--orange)!important;
  border-color:var(--orange)!important;
  margin-left:10px;

  &.ant-btn{
    &:hover{
      background:var(--light-orange)!important;
      border-color:var(--light-orange)!important;
    }
    &:focus{
      background:var(--orange)!important;
      border-color:var(--orange)!important;
    }
    &:active{
      background:var(--dark-orange)!important;
      border-color:var(--dark-orange)!important;
    }
  }
`;

const RowBox = styled(Row)`
  background:white;
  border-radius:var(--normal-radius);
  margin-top:20px;
  padding:20px 0;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.2);
`;

export const Lend: React.FC = () => {
  const { t } = useTranslation();
  const [dotApr, setDotApr] = useState<number>(11.2);
  const [dotBalance, setDotBalance] = useState<number>(3150.66);

  return (
    <div>
      <Row>
        <Col span={6} className={'flex-center'}>
          {t('Tokens')}
        </Col>
        <Col span={6} className={'flex-center'}>
          {t('Balance')}
        </Col>
        <Col span={6} className={'flex-center'}>
          {t('Borrow APR')}
        </Col>
        <Col span={6} className={'flex-center'}>
        </Col>
      </Row>
      <RowBox>
        <Col span={6} className={'flex-center'}>
        <DotIconBox /> DOT
        </Col>
        <Col span={6} className={'flex-center'}>
          {dotBalance}
        </Col>
        <Col span={6} className={'flex-center'}>
          {dotApr}
        </Col>
        <Col span={6} className={'flex-center'}>
        <NavLink to="/lend">          
          <BorrowButton shape="round" type="primary">{t('Borrow')}</BorrowButton>
        </NavLink>
        </Col>
      </RowBox>
    </div>
  )
}