import styled from 'styled-components';

const AccountDetailsWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-radius: 0px 0px 12px 12px;
  width: 100%;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const AccordionButton = styled.div`
  padding-left: 1rem;
  height: 3rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
  width: 100%;
  background-color: ${(props) => props.theme.colors.tertiaryBackground};
  cursor: pointer;
  align-items: center;
  display: flex;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
  border-radius: ${(props) =>
    props.isExpanded ? '12px 12px 0px 0px' : '12px 12px 12px 12px'};
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 0px 0px 12px 12px;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 2rem;
  /* padding: 2rem; */
  /* padding-top: 0rem; */
`;

const ValuesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 600px;
  padding-top: 2rem;
`;

const LeftValuesWrapper = styled.div`
  width: 100%;
`;

const RightValuesWrapper = styled.div`
  width: 100%;
`;

const WheelsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly;
  /* border: solid 1px white; */
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

const HealthLabel = styled.p`
  color: ${(props) => props.theme.colors.secondary};
  margin-top: -1rem;
  font-weight: bold;
`;

const DonutChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 220px;
  height: 220px;
`;

const DonutChartLabel = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
`;

export {
  AccountDetailsWrapper,
  AccordionButton,
  ContentWrapper,
  ValuesWrapper,
  LeftValuesWrapper,
  RightValuesWrapper,
  WheelsWrapper,
  Label,
  Value,
  LabelAndValueWrapper,
  HealthLabel,
  DonutChartWrapper,
  DonutChartLabel
};
