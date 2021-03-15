import styled from 'styled-components';
import { Button } from 'semantic-ui-react';

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
  background: ${(props) => {
    return props.theme.colors[props.styledColor] + '!important';
  }};
  color: ${(props) => props.theme.colors.secondaryBackground + ' !important'};
`;

const StakingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const StakingAprWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 1rem;
`;

const StakingMarketDetails = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: row;
  width: 100%;
`;

const DonutChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 250px;
  width: 100%;
  padding-bottom: 1rem;
`;

const StakingActionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding-top: 10px;
`;

const StakingLeftAction = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
`;

const StakingRightAction = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
`;

const MarketLabel = styled.p`
  color: ${(props) => props.theme.colors.darkText};
  margin-right: 5px;
  font-weight: bold;
`;

const MarketValue = styled.p`
  color: ${(props) => props.theme.colors.text};
  /* margin: 3px; */
`;

const MarketLabelAndValueWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: -0.6rem;
`;

const PercentageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  margin-bottom: 10px;
  /* justify-content: left; */
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

const LabelAndValueWrapper = styled.div`
  margin: 1rem;
`;

const Label = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
`;

const Value = styled.p`
  color: ${(props) => props.theme.colors.primary};
  margin-top: -1rem;
`;

const DonutChartLabel = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
`;

const ModalNameLabel = styled.div`
  display: flex;
  color: ${(props) => props.theme.colors[props.color]};
  font-size: ${(props) => props.theme.fontSizes.p};
  font-weight: bold;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const APRValue = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.large};
  font-weight: bold;
  background: linear-gradient(
    225.64deg,
    #67a4ff 8.44%,
    rgba(165, 131, 242, 0.85) 51.02%,
    rgba(177, 140, 172, 0.5) 92.51%
  );
  -webkit-background-clip: text;
  color: transparent;
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

export {
  Separator,
  APRValue,
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
  ModalNameLabel,
  MarketLabelAndValueWrapper,
  MarketLabel,
  MarketValue,
  InputField,
  PercentageWrapper,
  StakingAprWrapper
};
