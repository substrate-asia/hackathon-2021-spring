import styled from 'styled-components';

const PriceCard = styled.div`
  box-shadow: none;
  min-height: 150px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const PriceAndLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SuppliedLabel = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.primary};
  text-align: center;
  margin: -0.5rem;
`;

const BorrowedLabel = styled.h3`
  color: ${(props) => props.theme.colors.secondary};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.secondary};
  text-align: center;
  margin: -0.5rem;
`;

const EarnedLabel = styled.h3`
  font-size: 2rem;
  color: ${(props) => props.theme.colors.text};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.text};
  text-align: center;
  margin: -0.5rem;
`;

const EarnedAmountLabel = styled.h3`
  font-size: 2rem;
  color: ${(props) => props.theme.colors.text};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.text};
  text-align: center;
`;

const AmountLabel = styled.h3`
  color: ${(props) => props.theme.colors.text};
  text-align: center;
`;

export {
  PriceCard,
  SuppliedLabel,
  AmountLabel,
  BorrowedLabel,
  EarnedLabel,
  PriceAndLabelWrapper,
  EarnedAmountLabel
};
