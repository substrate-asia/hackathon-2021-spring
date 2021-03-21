import styled from 'styled-components';
import { Container } from 'semantic-ui-react';

const StyledContainer = styled(Container)({
  width: '900px!important'
});

const WelcomeMessage = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
`;

const ProgressBarLabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: -10px;
`;

const Label = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.p - 1};
  font-weight: bold;
`;

export { WelcomeMessage, ProgressBarLabelWrapper, Label, StyledContainer };
