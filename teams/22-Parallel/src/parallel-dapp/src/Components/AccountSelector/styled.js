import styled from 'styled-components';
import { Container, Label, Button } from 'semantic-ui-react';

const StyledContainer = styled(Container)``;

const StyledButton = styled(Button)`
  background: ${(props) => props.theme.colors.primary + '!important'};
  color: ${(props) => props.theme.colors.primaryBackground + '!important'};
`;

const StyledLabel = styled(Label)`
  cursor: pointer !important;
  border: ${(props) => '2px solid' + props.theme.colors.primary + '!important'};
  box-sizing: ${(props) => 'border-box !important'};
  border-radius: ${(props) => '20px!important'};
  background-color: ${(props) => 'rgb(25, 32, 37, 0) !important'};
  color: ${(props) => props.theme.colors.text + '!important'};
  &:hover {
    background-color: ${(props) => props.theme.colors.primary + '!important'};
    color: ${(props) => props.theme.colors.primaryBackground + '!important'};
  },
`;

const Logo = styled.a`
  color: ${(props) => props.theme.colors.primary};
  text-shadow: ${(props) => '0px 0px 33px' + props.theme.colors.primary};
  margin: 2rem;
  margin-top: 10px;
`;

const WalletLabel = styled.h3`
  color: ${(props) => props.theme.colors.text};
  text-align: center;
`;

const StyledTitle = styled.h2`
  color: ${(props) => props.theme.colors.text + '!important'};
  fontsize: ${(props) => props.theme.colors.p + '!important'};
`;

const LogoWrapper = styled.div`
  width: 30px;
  height: 30px;
  padding-left: 2em;
`;

export {
  Logo,
  LogoWrapper,
  WalletLabel,
  StyledContainer,
  StyledLabel,
  StyledTitle,
  StyledButton
};
