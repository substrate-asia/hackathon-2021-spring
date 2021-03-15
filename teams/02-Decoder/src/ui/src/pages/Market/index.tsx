/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from '@/components';
import { Button,BalanceBox } from '@/components'
import styled from 'styled-components'
import {NavLink} from 'react-router-dom'
import {ReactComponent as DotIcon} from '@/assets/dot_icon.svg'
import { balanceFormatter } from '@/utils';
import { useAccounts, useApi } from '@/hooks';

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
export const RepayButton = styled(Button)`
background:var(--purple)!important;
border-color:var(--purple)!important;
margin-left:10px;

&.ant-btn{
  &:hover{
    background:var(--light-purple)!important;
    border-color:var(--light-purple)!important;
  }
  &:focus{
    background:var(--purple)!important;
    border-color:var(--purple)!important;
  }
  &:active{
    background:var(--dark-purple)!important;
    border-color:var(--dark-purple)!important;
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
const data: number[] = [12, 11.9, 11.3, 11.56]

export const Market: React.FC = () => {
  const { t } = useTranslation();
  const {api} = useApi();
  const {active} = useAccounts()

  const [dotApy, setDotApy] = useState<number>(12);
  const [dotApr, setDotApr] = useState<number>(11.2);  
  const [dotBalance, setDotBalance] = useState<number | undefined>();
  // const balance = useBalance();
  const balance = 1000;


  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      const n = Math.floor(Math.random() * 4);
      setDotApy(data[n]);
    }, 5000);
    return () => clearInterval(interval)
  }, []);

  return (
    <div>
      <Row>
        <Col span={5} className={'flex-center'}>
          {t('Tokens')}
        </Col>
        <Col span={5} className={'flex-center'}>
          {t('Balance')}
        </Col>
        <Col span={4} className={'flex-center'}>
          {t('Deposit APY')}
        </Col>
        <Col span={4} className={'flex-center'}>
          {t('Borrow APR')}
        </Col>
        <Col span={6} className={'flex-center'}>
        </Col>
      </Row>
      <RowBox>
        <Col span={5} className={'flex-center'}>
        <DotIconBox /> DOT
        </Col>
        <Col span={5} className={'flex-center'}>
          <BalanceBox></BalanceBox>
        </Col>
        <Col span={4} className={'flex-center'}>
          {dotApy}
        </Col>
        <Col span={4} className={'flex-center'}>
          {dotApr}
        </Col>
        <Col span={6} className={'flex-center'}>
        <NavLink to="/bank">
          <DepositButton shape="round" type="primary">{t('Deposit')}</DepositButton>
        </NavLink>
        <NavLink to="/lend">          
          <BorrowButton shape="round" type="primary">{t('Borrow')}</BorrowButton>
        </NavLink>
        </Col>
      </RowBox>
    </div>
  )
}