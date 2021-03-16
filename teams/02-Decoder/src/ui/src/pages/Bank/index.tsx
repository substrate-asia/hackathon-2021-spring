import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from '@/components';
import { Button } from '@/components'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { ReactComponent as DotIcon } from '@/assets/dot_icon.svg'
import { useAccounts, useApi, useBalance } from '@/hooks';

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
const data: number[] = [12, 11.9, 11.3, 11.56]

export const Bank: React.FC = () => {
  const {api} = useApi();
  const {active} = useAccounts()

  const { t } = useTranslation();
  const [dotApy, setDotApy] = useState<number>(12);
  const [dotBalance, setDotBalance] = useState<number | undefined>();
  const balance = useBalance();

  useEffect(() => {

    const account = active?.address as string
    console.log('account: ' + account);
    
    api.query.system
    .account(account, (info) => {
      const free = info.data.free.toString()
      console.log(free);
      
    })
    setDotBalance(balance);
  }, [active?.address, api.query.system, balance])

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
        <Col span={6} className={'flex-center'}>
          {t('Tokens')}
        </Col>
        <Col span={6} className={'flex-center'}>
          {t('Balance')}
        </Col>
        <Col span={6} className={'flex-center'}>
          {t('Deposit APY')}
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
          {dotApy}
        </Col>
        <Col span={6} className={'flex-center'}>
          <NavLink to={`/deposit/dot`}>
            <DepositButton shape="round" type="primary">{t('Deposit')}</DepositButton>
          </NavLink>
        </Col>
      </RowBox>
    </div>
  )
}