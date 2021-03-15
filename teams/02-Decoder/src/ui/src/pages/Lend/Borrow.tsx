/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import BN from 'bignumber.js'

import { Tabs, Row, Col, Space, Divider } from 'antd';
import { ReactComponent as DotIcon } from '@/assets/dot_icon.svg';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/components';
import { Button } from '@/components'
import styled from 'styled-components';
// import './Deposit.css';
import { BalanceInput } from '@/components/BalanceInput';
import { BorrowButton, RepayButton } from '@/pages/Market'
import { useAccounts, useApi, useContractQuery, useContractTX, useLendingPoolContract } from '@/hooks';
import { balanceFormatter } from '@/utils';

const BalanceBox = styled.div`
  width:300px;
  margin-left:30px;
`;
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
  margin-top:12px;
  margin-left:0px;
`;
interface UnlockProps {
  onClick?: () => void;
}
const UnlockBox = styled.span`
  color:var(--orange);
  cursor:pointer;
`;
const Unlock: React.FC<UnlockProps> = ({
  onClick
}) => {
  const { t } = useTranslation()
  return (
    <UnlockBox onClick={onClick}>{t('unlock')}</UnlockBox>
  )
}

export const Borrow: React.FC = () => {
  const { api } = useApi();
  const tokenId = 'dot'
  const { active } = useAccounts()
  const { t } = useTranslation()
  const [price, setPrice] = useState<number>(36.55)
  const [totalLiquidity, setTotalLiquidity] = useState<number>(1614567.62)
  const [apr, setApr] = useState<number>(11.2)
  const [balance, setBalance] = useState<number>(100)
  const [borrowed, setBorrowed] = useState<number>(10)
  const [lendable, setLendable] = useState<number>(0)
  const [deposited, setDeposited] = useState<number>(10)
  const [inputError, setInputError] = useState<string>()
  const [repayError, setRepayError] = useState<string>()
  const [borrowAmount, setBorrowAmount] = useState<number | undefined>()
  const [repayAmount, setRepayAmount] = useState<number | undefined>()
  const [borrowDisabled, setBorrowDisabled] = useState<boolean>(false)
  const [repayDisabled, setRepayDisabled] = useState<boolean>(false)

  const { contract } = useLendingPoolContract()
  const { read } = useContractQuery({ contract, method: 'getScaledBalance' })
  const { read: readReserveData } = useContractQuery({ contract, method: 'getReserveData' })
  const { read: readDelegateAmount } = useContractQuery({ contract, method: 'delegateAmount' })
  const { exec: borrowExec } = useContractTX({ contract, method: 'borrow' })
  const { exec: repayExec } = useContractTX({ contract, method: 'repay' })
  const [delegateAmount, setDelegateAmount] = useState<number>(0)
  const [lendedState, lendedReducer] = useReducer((i) => i + 1, 0)

  const handleBalanceInputChange = useCallback((e) => {
    setBorrowAmount(e.currentTarget.value as number)

    if (e.currentTarget.value as number > balance) {
      setInputError('Insufficient balance')
      setBorrowDisabled(true)
    } else {
      setBorrowDisabled(false)
      setInputError(undefined)
    }
  }, [balance])

  const handleRepayInputChange = useCallback((e) => {
    setRepayAmount(e.currentTarget.value as number)

    if (e.currentTarget.value as number > deposited) {
      setRepayError('Insufficient balance')
      setRepayDisabled(true)
    } else {
      setRepayDisabled(false)
      setRepayError(undefined)
    }
  }, [deposited])

  // get dot balance
  useEffect(() => {

    const account = active?.address as string
    api.query.system
      .account(account, (info) => {
        const free = balanceFormatter(info.data.free.toString(), 10)
        setBalance(free.num);
        console.log(free);

      })
      .catch(() => {
        setBalance(0);
      });
  }, [active?.address, api.query.system])

  // get deposited balance
  useEffect(() => {
    const account = active?.address as string
    console.log('get deposited balance');

    read(account).then(res => {

      const free = balanceFormatter(res as string, 10)
      console.log(free.num);
      setDeposited(free.num);
    })
  }, [active?.address, read])

  // get reserve data balance
  useEffect(() => {
    const account = active?.address as string
    console.log('get deposited balance');

    readReserveData(account).then(res => {
      console.log((res as any).borrow_balance);
      const borrowBalance = balanceFormatter((res as any).borrow_balance as string, 10)
      setBorrowed(borrowBalance.num)
    })
  }, [active?.address, read, readReserveData,lendedState])

  // get delegate amount
  useEffect(() => {
    const account = active?.address as string
    console.log('get deposited balance');

    readDelegateAmount(account,account).then(res => {
      const free = balanceFormatter(res as string, 10)
      console.log(free.num);
      setLendable(free.num);
    })
  }, [active?.address,  readDelegateAmount,lendedState])

  const handleBorrow = useCallback(async() => {
    const account = active?.address as string
    const value = new BN(borrowAmount as number).times(10 ** 10)
    await borrowExec([value.toString(), account], '0',
    ()=>{
      lendedReducer()
      setBorrowAmount(undefined)  
    })
  }, [active?.address, borrowAmount, borrowExec])

  const handleRepay = useCallback(async () => {
    const account = active?.address as string
    const value = new BN(repayAmount as number).times(10 ** 10)
    await repayExec([account], value.toString(),()=>{
      setRepayAmount(undefined)
      lendedReducer()
    })
  }, [active?.address, repayExec, repayAmount])

  return (
    <div className="card-container">
      <Tabs type="card">
        <TabPane tab={t('Borrow')} key="1">
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
                  <Field>{t('Borrow APR')}</Field>
                  <span>{apr}%</span>
                </div>
              </Space>
            </Col>
          </Row>
          <Divider />
          <BalanceBox className={'flex-between'}>
            <div>
              <Field>{t('Deposited')}</Field>
              {deposited}
            </div>
            <div>
              <Field>{t('Able to borrow')}</Field>
              {
                lendable
              }
            </div>
          </BalanceBox>
          <InputBox placeholder="0.0" className={"flex-left"}>
            <BalanceInput error={inputError} value={borrowAmount} onChange={handleBalanceInputChange} />
            <BorrowButton onClick={handleBorrow} disabled={!lendable || borrowDisabled || !borrowAmount} shape="round" type="primary">{t('Borrow')}</BorrowButton>
          </InputBox>
        </TabPane>
        <TabPane tab={t('Repay')} key="2">
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
                  <Field>{t('Borrow APR')}</Field>
                  <span>{apr}%</span>
                </div>
              </Space>
            </Col>
          </Row>
          <Divider />
          <BalanceBox className={'flex-between'}>
            <div>
              <Field>{t('Borrowed')}</Field>
              {borrowed}
            </div>
            <div>
              <Field>{t('Balance')}</Field>
              {balance}
            </div>
          </BalanceBox>
          <InputBox placeholder="0.0" className={"flex-left"}>
            <BalanceInput error={repayError} value={repayAmount} onChange={handleRepayInputChange} />
            <RepayButton onClick={handleRepay} disabled={repayDisabled || !repayAmount} shape="round" type="primary">{t('Repay')}</RepayButton>
          </InputBox>
        </TabPane>
      </Tabs>
    </div>
  )
}