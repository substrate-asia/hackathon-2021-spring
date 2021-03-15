import styled from 'styled-components';
import { Button, Label } from 'semantic-ui-react';

const GradientButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
  color: white;
  font-weight: bold;
  width: 50px;
  height: 25px;
  background: none;
  text-decoration: inherit;
  font-family: system-ui;
  font-size: 0.7rem;
  /* padding: 1rem 2rem; */
  border: 1px solid;
  border-image-slice: 1;
  border-width: 2px;
  border-image-source: linear-gradient(
    89.99deg,
    #90e5ef 8.94%,
    #6d5d92 27.05%,
    #6ca7d7 49.6%,
    #bfadb4 66.6%,
    #bb9dad 79.9%
  );
  cursor: pointer;
`;

const StyledButton = styled(Button)`
  background: ${(props) =>
    props.theme.colors[props.styledcolor] + '!important'};
  color: ${(props) => props.theme.colors.secondaryBackground + ' !important'};
`;

const StyledActionLabel = styled(Label)`
  background: ${(props) =>
    props.paneSelection
      ? props.theme.colors.secondary + '!important'
      : props.theme.colors.primary + '!important'};

  color: ${(props) => props.theme.colors.secondaryBackground + ' !important'};
`;

const StyledChartLabel = styled.button`
  border: 0px;
  font-size: 12px;
  background: ${(props) => props.theme.colors.tertiaryBackground};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 400px;
  flex-direction: row;
  /* flex-wrap: wrap; */
`;

const LeftPannelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-width: 400px;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 1rem;
`;

const RightPannelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  /* min-width: 400px; */
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 1rem;
`;

const TokenDetailsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
`;

const ChartWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 240px;
  flex-direction: column;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 1.2rem;
  padding-bottom: 1.6rem;
  background: ${(props) => props.theme.colors.tertiaryBackground};
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
  border-radius: 20px;
`;

const AccountDetailsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-direction: column;
  /* margin-top: -10px; */
  padding-left: 2rem;
  padding-right: 2rem;
  border-radius: 20px;
  height: 100px;
  margin-top: 10px;
  /* background: ${(props) => props.theme.colors.tertiaryBackground}; */
  background: linear-gradient(
    225.64deg,
    #67a4ff 8.44%,
    rgba(165, 131, 242, 0.85) 51.02%,
    rgba(177, 140, 172, 0.5) 92.51%
  );
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const DashBoardTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
`;

const DashBoardAmount = styled.h2`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
`;

const DashBoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 12px 12px 12px 12px;
  width: 100%;
  height: 200px;
`;

const SupplyTabWrapper = styled.div`
  display: flex;
  width: 100%;
  margin: 1rem;
  align-items: center;
  justify-content: center;
  border-radius: 12px 0px 0px 0px;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
  /* background-color: ${(props) =>
    props.paneSelection
      ? props.theme.colors.tertiaryBackground
      : props.theme.colors.secondaryBackground}; */
  cursor: pointer;
`;

const BorrowTabWrapper = styled.div`
  display: flex;
  margin: 1rem;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 0px 12px 0px 0px;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
  /* background-color: ${(props) =>
    props.paneSelection
      ? props.theme.colors.secondaryBackground
      : props.theme.colors.tertiaryBackground}; */
  cursor: pointer;
`;

const SupplyTabName = styled.h3`
  font-size: ${(props) => props.theme.fontSizes.p};
  padding: 1.5rem;
  color: ${(props) =>
    props.paneSelection ? props.theme.colors.text : props.theme.colors.primary};
`;

const BorrowTabName = styled.h3`
  font-size: ${(props) => props.theme.fontSizes.p};
  padding: 1.5rem;
  color: ${(props) =>
    props.paneSelection
      ? props.theme.colors.secondary
      : props.theme.colors.text};
`;

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  height: 20px;
  background: ${(props) => props.theme.colors.tertiaryBackground};
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const TokenIconAndNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  color: white;
`;

const MarketDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  width: 100%;
  height: 60px;
`;

const LeftDetails = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
`;

const RightDetails = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
`;

const ActionTitle = styled.div`
  color: ${(props) => props.theme.colors.text};
  width: 100%;
  font-weight: bold;
`;

const ActionSectionWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  height: 240px;
`;

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const HealthFactorLabel = styled.div`
  display: flex;
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  width: 100%;
  justify-content: flex-end;
  align-items: flex-start;
`;

const ModalNameLabel = styled.div`
  display: flex;
  color: ${(props) => props.theme.colors[props.styledcolor] + '!important'};
  font-size: ${(props) => props.theme.fontSizes.p};
  font-weight: bold;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const TokenAmount = styled.div`
  font-size: ${(props) => props.theme.fontSizes.medium};
  color: ${(props) =>
    props.paneSelection
      ? props.theme.colors.secondary
      : props.theme.colors.primary};
`;

const EquivalentIcon = styled.div``;

const CashAmount = styled.div`
  font-size: ${(props) => props.theme.fontSizes.medium};
  color: ${(props) => props.theme.colors.text};
`;

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const ProgressBarLabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  /* margin-bottom: -10px; */
`;

const ProgressBarLabel = styled.p`
  color: ${(props) => props.theme.colors.text};
  margin-right: 5px;
  font-weight: bold;
`;

const MarketLabel = styled.p`
  color: ${(props) => props.theme.colors.darkText};
  margin-right: 5px;
  font-weight: bold;
`;

const MarketValue = styled.p`
  color: ${(props) => props.theme.colors.text};
`;

const PercentageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const ChartDatesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-end;
`;

const InputField = styled.input`
  width: 80%;
  height: 100%;
  background: ${(props) =>
    props.theme.colors.tertiaryBackground + '!important'};
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
  color: ${(props) => props.theme.colors.text + '!important'};
  &:focus {
    outline: "none" + "!important";
  }
  margin-bottom: 10px;
`;

const TokenName = styled.div`
  font-size: ${(props) => props.theme.fontSizes.large};
  color: ${(props) => props.theme.colors.text};
  margin-left: 10px;
`;

const TokenIcon = styled.div``;

const EquivalentIconWrapper = styled.div`
  margin-left: 15px;
  margin-right: 15px;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(
    89.99deg,
    #90e5ef 8.94%,
    #6d5d92 27.05%,
    #6ca7d7 49.6%,
    #bfadb4 66.6%,
    #bb9dad 79.9%
  );
  margin-top: 10px;
  margin-bottom: 10px;
`;

const MarketLabelAndValueWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: -0.6rem;
`;

const ChartAndCommandWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
`;

const Icon = styled.img`
  weight: 45px;
  height: 45px;
`;

export {
  EquivalentIconWrapper,
  GradientButton,
  StyledActionLabel,
  StyledChartLabel,
  Separator,
  InputField,
  StyledButton,
  ContentWrapper,
  LeftPannelWrapper,
  TokenDetailsWrapper,
  ActionWrapper,
  RightPannelWrapper,
  ChartWrapper,
  AccountDetailsWrapper,
  DashBoardAmount,
  DashBoardTitle,
  DashBoardWrapper,
  SupplyTabWrapper,
  BorrowTabWrapper,
  BorrowTabName,
  SupplyTabName,
  MenuWrapper,
  TokenIconAndNameWrapper,
  MarketDetailsWrapper,
  LeftDetails,
  RightDetails,
  ActionTitle,
  AmountWrapper,
  HealthFactorLabel,
  TokenAmount,
  EquivalentIcon,
  CashAmount,
  ProgressBarWrapper,
  ProgressBarLabelWrapper,
  MarketLabel,
  MarketValue,
  ActionSectionWrapper,
  PercentageWrapper,
  TokenName,
  TokenIcon,
  ChartDatesWrapper,
  MarketLabelAndValueWrapper,
  ChartAndCommandWrapper,
  Icon,
  ModalNameLabel,
  ProgressBarLabel
};
