/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import BN from 'bignumber.js'

import { Tabs, Row, Col, Space, Divider } from 'antd';
import { ReactComponent as DotIcon } from '@/assets/dot_icon.svg';
import { NavLink } from 'react-router-dom';
import { useTranslation, Button, BalanceBox } from '@/components'
import styled from 'styled-components';
// import './Deposit.css';
import { BalanceInput } from '@/components/BalanceInput';
import { useAccounts, useApi, useContractQuery, useContractTX, useLendingPoolContract } from '@/hooks';
import { balanceFormatter } from '@/utils';

const LinkBorrow = styled.span`
  cursor:pointer;
  text-decoration:underline;
  margin-left:20px;
  a{
    color:var(--orange);
    &:hover{
      color:var(--orange);
    }
  }
`;
const { TabPane } = Tabs;
const Field = styled.span`
  color:var(--light-gray-color);
  margin-right:10px;
`;
const DotIconBox = styled(DotIcon)`
  width:48px;
  height:48px;
  border-radius:24px;
  padding:10px;
  margin-left:30px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.2);
`;
const InputBox = styled.div`
  margin-top:32px;
  margin-left:30px;
`;

export const Deposit: React.FC = () => {
  const tokenId = 'dot'
  const { api } = useApi();
  const { active } = useAccounts()
  const { t } = useTranslation()
  const [price, setPrice] = useState<number>(36.55)
  const [totalLiquidity, setTotalLiquidity] = useState<number>(1614567.62)
  const [apy, setApy] = useState<number>(12)
  const [ltv, setLtv] = useState<number>(60)
  const [deposited, setDeposited] = useState<number>(10)
  const [inputError, setInputError] = useState<string>()
  const [withdrawError, setWithdrawError] = useState<string>()
  const [depositAmount, setDepositAmount] = useState<number | undefined>()
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>()
  const [depositDisabled, setDepositDisabled] = useState<boolean>(false)
  const [withdrawDisabled, setWithdrawDisabled] = useState<boolean>(false)
  const liquidationPenalty = 1
  const liquidationThreshold = 82.5

  const [depositedState, depositedReducer] = useReducer((i) => i + 1, 0)

  const [dotBalance, setDotBalance] = useState<number | undefined>();
  const balance = 1000;

  const { contract } = useLendingPoolContract()
  const { read } = useContractQuery({ contract, method: 'getScaledBalance' })
  const { exec: delegateExec } = useContractTX({ contract, method: 'delegate' })
  const { exec: depositExec } = useContractTX({ contract, method: 'deposit' })
  const { exec: withdrawExec } = useContractTX({ contract, method: 'withdraw' })
  const [delegate,setDelegate] = useState<number>(0)

  // get dot balance
  useEffect(() => {

    const account = active?.address as string
    api.query.system
      .account(account, (info) => {
        const free = balanceFormatter(info.data.free.toString(), 10)
        setDotBalance(free.num);
        console.log(free);

      })
      .catch(() => {
        setDotBalance(undefined);
      });
  }, [active?.address, api.query.system,depositedState])

  // get deposited balance
  useEffect(() => {
    const account = active?.address as string
    console.log('get deposited balance');

    read(account).then(res => {
      const free = balanceFormatter(res as string, 10)
      setDeposited(free.num);
    })
  }, [active?.address, read, depositedState])

  const handleBalanceInputChange = useCallback((e) => {
    setDepositAmount(e.currentTarget.value as number)

    if (e.currentTarget.value as number > (dotBalance as number)) {
      setInputError('Insufficient balance')
      setDepositDisabled(true)
    } else {
      setDepositDisabled(false)
      setInputError(undefined)
    }
  }, [dotBalance])

  const handleWithdrawInputChange = useCallback((e) => {
    setWithdrawAmount(e.currentTarget.value as number)

    if (e.currentTarget.value as number > deposited) {
      setWithdrawError('Insufficient balance')
      setWithdrawDisabled(true)
    } else {
      setWithdrawDisabled(false)
      setWithdrawError(undefined)
    }
  }, [deposited])

  const handleDeposit = useCallback(async () => {
    const account = active?.address as string
    const value = new BN(depositAmount as number).times(10 ** 10)

    depositExec([account], value.toString(),()=>{
      setDepositAmount(undefined)
      depositedReducer()
    })

  }, [active?.address, depositAmount, depositExec])

  const handleDelegate = useCallback(async () => {
    const account = active?.address as string

    const delegateVal = new BN(deposited).times(0.6).times(10 ** 10)
    
    await delegateExec([account, delegateVal.toString()], '0')
    setDelegate(0)

  }, [active?.address, deposited, delegateExec])

  const handleTabChange = useCallback((activeKey) => {
    // if (Number(activeKey) === 2) {
    //   depositedReducer();
    // }
  }, [])
  const handleWithdraw = useCallback(() => {
    const account = active?.address as string
    const value = new BN(withdrawAmount as number).times(10 ** 10)
    console.log(withdrawAmount, value.toString());
    withdrawExec([value.toString(), account], '0')
    setWithdrawAmount(undefined)
  }, [active?.address, withdrawAmount, withdrawExec])

  return (
    <div className="card-container">
      <Tabs type="card" onChange={handleTabChange}>
        <TabPane tab={t('Deposit')} key="1">
          <Row>
            <Col span="3" className={'flex-'}>
              <DotIconBox width="32" />
            </Col>
            <Col span="4" >
              <h3>{tokenId.toUpperCase()}</h3>
              <Field>{t('Price')}</Field>
              <span>${price}</span>
            </Col>
            <Col span="16">
              <p>
                <Field>{t('Total liquidity')}</Field>
                <span>{totalLiquidity}{tokenId.toUpperCase()}</span>
              </p>
              <Space size="large">
                <div>
                  <Field>{t('Deposit APY')}</Field>
                  <span>{apy}%</span>
                </div>
                <div>
                  <Field>{t('Borrow LTV')}</Field>
                  <span>{ltv}%</span>
                </div>
                <div>
                  <Field>{t('Liquidation threshold')}</Field>
                  <span>{liquidationThreshold}%</span>
                </div>
                <div>
                  <Field>{t('Liquidation penalty')}</Field>
                  <span>{liquidationPenalty}%</span>
                </div>
              </Space>
            </Col>
          </Row>
          <Divider />
          <InputBox placeholder="0.0" className={"flex-left"}>
            <div>
              <Field>{t('Balance')}</Field>
              {dotBalance}
            </div>
            <BalanceInput error={inputError} value={depositAmount} onChange={handleBalanceInputChange} />
            <Space>
            <Button disabled={depositDisabled || !depositAmount} shape="round" type="primary" onClick={handleDeposit}>{t('Deposit')}</Button>
            <Button shape="round" onClick={handleDelegate}>{t('Delegate')}</Button>
            </Space>
          </InputBox>
        </TabPane>
        <TabPane tab={t('Withdraw')} key="2">
          <Row>
            <Col span="3" className={'flex-'}>
              <DotIconBox width="32" />
            </Col>
            <Col span="4" >
              <h3>{tokenId.toUpperCase()}</h3>
              <Field>{t('Price')}</Field>
              <span>${price}</span>
            </Col>
            <Col span="16">
              <p>
                <Field>{t('Deposited')}</Field>
                <span>{deposited}{tokenId.toUpperCase()}</span>
                <LinkBorrow >
                  <NavLink to="/lend" >
                    {t('Borrow')}
                  </NavLink>
                </LinkBorrow>
              </p>
              <Space size="large">
                <div>
                  <Field>{t('Deposit APY')}</Field>
                  <span>{apy}%</span>
                </div>
                <div>
                  <Field>{t('Borrow LTV')}</Field>
                  <span>{ltv}%</span>
                </div>
                <div>
                  <Field>{t('Liquidation threshold')}</Field>
                  <span>{liquidationThreshold}%</span>
                </div>
                <div>
                  <Field>{t('Liquidation penalty')}</Field>
                  <span>{liquidationPenalty}%</span>
                </div>
              </Space>
            </Col>
          </Row>
          <Divider />
          <InputBox placeholder="0.0" className={"flex-left"}>
            <div>
              <Field>{t('Deposited')}</Field>
              {deposited}
            </div>
            <BalanceInput error={withdrawError} value={withdrawAmount} onChange={handleWithdrawInputChange} />
            <Button onClick={handleWithdraw} disabled={withdrawDisabled || !withdrawAmount} shape="round" type="primary">{t('Withdraw')}</Button>
          </InputBox>
        </TabPane>
      </Tabs>
    </div>
  )
}