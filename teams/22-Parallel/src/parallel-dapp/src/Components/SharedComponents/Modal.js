import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Progress } from 'semantic-ui-react';
import { web3FromSource } from '@polkadot/extension-dapp';
import { useSubstrate } from '../../substrate-lib';
import { NotificationManager } from 'react-notifications';

import { icons } from '../../icons/icons';
import theme from '../../theme/theme';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import {
  GradientButton,
  StyledChartLabel,
  Separator,
  StyledButton,
  ContentWrapper,
  LeftPannelWrapper,
  RightPannelWrapper,
  ChartWrapper,
  AccountDetailsWrapper,
  TokenIconAndNameWrapper,
  MarketDetailsWrapper,
  LeftDetails,
  RightDetails,
  ActionTitle,
  AmountWrapper,
  HealthFactorLabel,
  TokenAmount,
  CashAmount,
  ProgressBarWrapper,
  ProgressBarLabelWrapper,
  MarketLabel,
  MarketValue,
  PercentageWrapper,
  InputField,
  TokenName,
  ChartDatesWrapper,
  MarketLabelAndValueWrapper,
  ChartAndCommandWrapper,
  Icon,
  ModalNameLabel,
  EquivalentIconWrapper,
  ProgressBarLabel
} from './styled';

const data = [
  {
    name: '3/8',
    interests: 7.9
  },
  {
    name: '3/9',
    interests: 8
  },
  {
    name: '3/10',
    interests: 14
  },
  {
    name: '3/11',
    interests: 14.3
  },
  {
    name: '3/12',
    interests: 13.9
  },
  {
    name: '3/13',
    interests: 14.3
  }
];

function exampleReducer (state, action) {
  switch (action.type) {
    case 'close':
      return { open: false };
    case 'open':
      return { open: true, size: action.size };
    default:
      throw new Error('Unsupported action...');
  }
}
const nameConversion = {
  DOT: 'Polkadot',
  KSM: 'Kusama',
  BTC: 'Bitcoin',
  USDC: 'USD Coin',
  xDOT: 'Staked DOT'
};

const actionConversion = {
  Withdraw: {
    account: 'Account Supplied',
    chart: 'Supply APY History',
    color: 'primary'
  },
  Repay: {
    account: 'Account Borrowed',
    chart: 'Borrow APR History',
    color: 'secondary'
  },
  Borrow: {
    account: 'Account Borrowed',
    chart: 'Borrow APR History',
    color: 'secondary'
  },
  Deposit: {
    account: 'Account Supplied',
    chart: 'Supply APY History',
    color: 'primary'
  }
};

export const ModalExampleSize = (props) => {
  const { api } = useSubstrate();
  const [state, dispatch] = React.useReducer(exampleReducer, {
    open: false,
    size: undefined
  });
  const { open, size } = state;
  const [inputField, setInputField] = useState();
  const { accountPair, currency, action, balance } = props;
  const [paneSelection, setPaneSelection] = useState(0);

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

  const handleAmount = (amount) => {
    setInputField((amount * balance[currency]) / 100);
  };

  const convertLargeAmount = (amount) => {
    if (amount < 10000) {
      return amount.toFixed(2);
    } else if (amount >= 10000 && amount < 1000000) {
      return (amount / 1000).toFixed(2) + 'K';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M';
    }
  };

  function adjustAccount () {
    const callableMap = {
      Deposit: 'mint',
      Withdraw: 'redeem',
      Borrow: 'borrow',
      Repay: 'repayBorrow'
    };
    getFromAcct().then((fromAcct) =>
      api.tx.loans[callableMap[action]](
        currency,
        (inputField * 1e18).toLocaleString('fullwide', { useGrouping: false })
      ).signAndSend(fromAcct, ({ events, status }) => {
        if (status.isReady) {
          NotificationManager.info('Transaction processing');
          setInputField();
          dispatch({ type: 'close' });
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

  return (
    <>
      <Button
        id={props.action + '-button'}
        size="medium"
        primary
        onClick={() => dispatch({ type: 'open', size: 'tiny' })}
      >
        {action}
      </Button>
      <Modal
        size={'large'}
        open={open}
        onClose={() => dispatch({ type: 'close' })}
      >
        <Modal.Header>
          <TokenIconAndNameWrapper>
            <Icon src={`./assets/${currency}-image.png`} />
            <TokenName>{nameConversion[currency]}</TokenName>
          </TokenIconAndNameWrapper>
        </Modal.Header>
        <Modal.Content>
          <ContentWrapper>
            <LeftPannelWrapper>
              <Separator />
              <MarketDetailsWrapper>
                <LeftDetails>
                  <MarketLabelAndValueWrapper>
                    <MarketLabel>Market Size: </MarketLabel>
                    <MarketValue>
                      {convertLargeAmount(props.totalsupply)} {currency}
                    </MarketValue>
                  </MarketLabelAndValueWrapper>
                  <MarketLabelAndValueWrapper>
                    <MarketLabel>Borrowed: </MarketLabel>
                    <MarketValue>
                      {convertLargeAmount(props.totalborrow)} {currency}
                    </MarketValue>
                  </MarketLabelAndValueWrapper>
                </LeftDetails>
                <RightDetails>
                  <MarketLabelAndValueWrapper>
                    <MarketLabel>Net APR: </MarketLabel>
                    <MarketValue>{props.borrowrate}%</MarketValue>
                  </MarketLabelAndValueWrapper>
                  <MarketLabelAndValueWrapper>
                    <MarketLabel>Net APY: </MarketLabel>
                    <MarketValue>{props.supplyrate}%</MarketValue>
                  </MarketLabelAndValueWrapper>
                </RightDetails>
              </MarketDetailsWrapper>
              <Separator />
              <ModalNameLabel styledcolor={actionConversion[action].color}>
                {action} Token
              </ModalNameLabel>
              <MarketLabelAndValueWrapper>
                <MarketLabel>Balance:</MarketLabel>
                <MarketValue>
                  {balance && balance[currency]} {currency}
                </MarketValue>
              </MarketLabelAndValueWrapper>
              <Input labelPosition="right" type="text" placeholder={inputField}>
                <InputField
                  onChange={(event) => setInputField(event.target.value)}
                  value={inputField}
                />
                <StyledButton
                  floated="left"
                  content={action}
                  onClick={() => adjustAccount()}
                  styledcolor={actionConversion[action].color}
                />
              </Input>
              <PercentageWrapper>
                <GradientButton onClick={() => handleAmount(25)}>
                  25%
                </GradientButton>
                <GradientButton onClick={() => handleAmount(50)}>
                  50%
                </GradientButton>
                <GradientButton onClick={() => handleAmount(75)}>
                  75%
                </GradientButton>
                <GradientButton onClick={() => handleAmount(100)}>
                  MAX
                </GradientButton>
              </PercentageWrapper>
              <Separator />
              <ProgressBarWrapper>
                <ProgressBarLabelWrapper>
                  <ProgressBarLabel>Borrow Limit</ProgressBarLabel>
                  <ProgressBarLabel>{`$12.18 (${15.24}%)`}</ProgressBarLabel>
                </ProgressBarLabelWrapper>
                <Progress
                  percent={15.24}
                  size="tiny"
                  inverted
                  color="blue"
                  indicating
                />
              </ProgressBarWrapper>
            </LeftPannelWrapper>
            <RightPannelWrapper>
              <AccountDetailsWrapper>
                <ActionTitle>{actionConversion[action].account}</ActionTitle>
                <AmountWrapper>
                  <TokenAmount
                    styledcolor={actionConversion[action].color}
                    paneSelection={paneSelection}
                  >
                    {props.marketValue && convertLargeAmount(props.marketValue)}
                    {currency}
                  </TokenAmount>
                  <EquivalentIconWrapper>
                    {icons.EquivalentIcon}
                  </EquivalentIconWrapper>
                  <CashAmount paneSelection={paneSelection}>
                    ${convertLargeAmount(props.price * props.marketValue)}
                  </CashAmount>
                </AmountWrapper>
              </AccountDetailsWrapper>
              <ChartWrapper>
                <ChartAndCommandWrapper>
                  <ActionTitle>{actionConversion[action].chart}</ActionTitle>
                  <ChartDatesWrapper>
                    <StyledChartLabel>1D</StyledChartLabel>
                    <StyledChartLabel>1W</StyledChartLabel>
                    <StyledChartLabel>All</StyledChartLabel>
                  </ChartDatesWrapper>
                </ChartAndCommandWrapper>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    width={500}
                    height={400}
                    data={data}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="interests"
                      stroke={theme.colors[actionConversion[action].color]}
                      fill={theme.colors[actionConversion[action].color]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartWrapper>
            </RightPannelWrapper>
          </ContentWrapper>
        </Modal.Content>
        <Modal.Actions></Modal.Actions>
      </Modal>
    </>
  );
};

export default ModalExampleSize;
