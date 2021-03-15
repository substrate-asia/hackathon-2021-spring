import React, { useState, useEffect } from 'react';
import { Input } from 'semantic-ui-react';
import {
  Separator,
  StakingWrapper,
  StakingMarketDetails,
  StakingActionWrapper,
  StakingLeftAction,
  StakingRightAction,
  LabelAndValueWrapper,
  Label,
  Value,
  DonutChartWrapper,
  DonutChartLabel,
  GradientButton,
  StyledButton,
  MarketLabelAndValueWrapper,
  MarketLabel,
  MarketValue,
  InputField,
  PercentageWrapper,
  StakingAprWrapper,
  APRValue
} from './styled';
import PieCharts from './PieCharts';
import { NotificationManager } from 'react-notifications';

export default function Staking (props) {
  const [stakeInput, setStakeInput] = useState();
  const [unstakeInput, setUnstakeInput] = useState();
  const { accountPair, balance } = props;

  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = accountPair;
    let fromAcct;
    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }
    return fromAcct;
  };

  function transactionCall (callable, amount) {
    getFromAcct().then((fromAcct) =>
      api.tx.loans[callable](
        (amount * 1e18).toLocaleString('fullwide', { useGrouping: false })
      ).signAndSend(fromAcct, ({ events, status }) => {
        if (status.isReady) {
          NotificationManager.info('Transaction processing');
        }
        if (status.isInBlock) { NotificationManager.success('Transaction success'); }
        events.forEach(({ phase, event: { data, method, section } }) => {
          if (method === 'ExtrinsicFailed') {
            NotificationManager.error('Transaction error');
          }
          console.log(
            phase.toString() +
              ' : ' +
              section +
              '.' +
              method +
              ' ' +
              data.toString()
          );
        });
      })
    );
  }

  function stakeTokens () {
    transactionCall('stake', stakeInput);
  }

  function unstakeTokens () {
    transactionCall('unstake', unstakeInput);
  }

  function getComposition () {
    const sum = balance.DOT + balance.xDOT;
    return [
      {
        name: 'DOT',
        value: parseFloat(((balance.DOT / sum) * 100).toFixed(2))
      },
      {
        name: 'Staked xDOT',
        value: parseFloat(((balance.xDOT / sum) * 100).toFixed(2))
      }
    ];
  }

  const handleAmount = (amount, currency) => {
    if (currency === 'DOT') {
      setStakeInput((amount * balance[currency]) / 100);
    } else {
      setUnstakeInput((amount * balance[currency]) / 100);
    }
  };

  return (
    <StakingWrapper>
      <StakingAprWrapper>
        <APRValue>Current APR: 12.36%</APRValue>
      </StakingAprWrapper>
      <Separator />
      <StakingMarketDetails>
        <LabelAndValueWrapper>
          <Label>Asset:</Label>
          <Value>Polkadot</Value>
        </LabelAndValueWrapper>
        <LabelAndValueWrapper>
          <Label>Token Price:</Label>
          <Value>$ 38.2</Value>
        </LabelAndValueWrapper>
        <LabelAndValueWrapper>
          <Label>Pool Size:</Label>
          <Value>{numberWithCommas(1021322)} DOT</Value>
        </LabelAndValueWrapper>
        <LabelAndValueWrapper>
          <Label>Pool Profits:</Label>
          <Value>${numberWithCommas(323212332)}</Value>
        </LabelAndValueWrapper>
      </StakingMarketDetails>
      <Separator />
      <DonutChartWrapper>
        <PieCharts data={getComposition()} />
        <DonutChartLabel>Staking Composition</DonutChartLabel>
      </DonutChartWrapper>
      <Separator />
      <StakingActionWrapper>
        <StakingLeftAction>
          <MarketLabelAndValueWrapper>
            <MarketLabel>Balance:</MarketLabel>
            <MarketValue>
              {balance && balance.DOT.toFixed(0)} DOT
            </MarketValue>
          </MarketLabelAndValueWrapper>
          <Input labelPosition="right" type="text" placeholder={stakeInput}>
            <InputField
              onChange={(event) => setStakeInput(event.target.value)}
              value={stakeInput}
            />
            <StyledButton
              styledColor={'primary'}
              floated="left"
              content="Stake"
              onClick={() => stakeTokens()}
            />
          </Input>
          <PercentageWrapper>
            <GradientButton onClick={() => handleAmount(25, 'DOT')}>
              25%
            </GradientButton>
            <GradientButton onClick={() => handleAmount(50, 'DOT')}>
              50%
            </GradientButton>
            <GradientButton onClick={() => handleAmount(75, 'DOT')}>
              75%
            </GradientButton>
            <GradientButton onClick={() => handleAmount(100, 'DOT')}>
              MAX
            </GradientButton>
          </PercentageWrapper>
        </StakingLeftAction>
        <StakingRightAction>
          <MarketLabelAndValueWrapper>
            <MarketLabel>Balance:</MarketLabel>
            <MarketValue>
              {balance && balance.xDOT.toFixed(0)} xDOT
            </MarketValue>
          </MarketLabelAndValueWrapper>
          <Input labelPosition="right" type="text" placeholder={unstakeInput}>
            <InputField
              onChange={(event) => setUnstakeInput(event.target.value)}
              value={unstakeInput}
            />
            <StyledButton
              styledColor={'secondary'}
              floated="left"
              content="Unstake"
              onClick={() => unstakeTokens()}
            />
          </Input>
          <PercentageWrapper>
            <GradientButton onClick={() => handleAmount(25, 'xDOT')}>
              25%
            </GradientButton>
            <GradientButton onClick={() => handleAmount(50, 'xDOT')}>
              50%
            </GradientButton>
            <GradientButton onClick={() => handleAmount(75, 'xDOT')}>
              75%
            </GradientButton>
            <GradientButton onClick={() => handleAmount(100, 'xDOT')}>
              MAX
            </GradientButton>
          </PercentageWrapper>
        </StakingRightAction>
      </StakingActionWrapper>
    </StakingWrapper>
  );
}
