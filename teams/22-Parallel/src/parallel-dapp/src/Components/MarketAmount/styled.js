import styled from 'styled-components';

const MarketContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  width: 100%;
  flex-direction: column;
  background: linear-gradient(
    225.64deg,
    #67a4ff 8.44%,
    rgba(165, 131, 242, 0.85) 51.02%,
    rgba(177, 140, 172, 0.5) 92.51%
  );
  height: 125px;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const MarketTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.text};
`;

const MarketValue = styled.h2`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.text};
  margin: -0.5rem;
`;

export { MarketContainer, MarketValue, MarketTitle };
