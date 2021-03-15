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
  position: absolute;
  z-index: 2;
`;

const EarnedLabel = styled.h3`
  font-size: 2rem;
  color: #ffffff;
  text-shadow: 0px 0px 33px #ffffff;
  text-align: center;
  margin: -0.5rem;
`;

const EarnedAmountLabel = styled.h3`
  font-size: 2rem;
  color: #ffffff;
  text-shadow: 0px 0px 33px #ffffff;
  text-align: center;
`;

export { PriceCard, EarnedLabel, EarnedAmountLabel, PriceAndLabelWrapper };
